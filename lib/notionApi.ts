/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, isFullPage } from '@notionhq/client';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { compareAsc, compareDesc } from 'date-fns';
import lqip from 'lqip-modern';

const notion = new Client({
  auth: process.env.NOTION_API_TOKEN,
});

export type Post = {
  id: string;
  createdAt: string;
  lastEditedAt: string;
  coverImage: string | null;
  tags: string[];
  title: string;
  description: string;
  slug: string;
};

const noop = async (block: BlockObjectResponse) => block;

/**
 * Union type of all block types
 * @see https://developers.notion.com/reference/block
 */
type BlockType = BlockObjectResponse['type'];

/**
 * Lookup table for transforming block types
 * Allows to transform an api response for a specific block type into a more usable format
 */
/**
 * Lookup table for transforming block types
 * Allows to transform an api response for a specific block type into a more usable format
 */
const BlockTypeTransformLookup: Record<
  BlockType,
  (block: BlockObjectResponse) => Promise<BlockObjectResponse>
> = {
  file: noop,
  paragraph: noop,
  heading_1: noop,
  heading_2: noop,
  heading_3: noop,
  bulleted_list_item: noop,
  numbered_list_item: noop,
  quote: noop,
  to_do: noop,
  toggle: noop,
  template: noop,
  synced_block: noop,
  child_page: noop,
  child_database: noop,
  equation: noop,
  code: noop,
  callout: noop,
  divider: noop,
  breadcrumb: noop,
  table_of_contents: noop,
  column_list: noop,
  column: noop,
  link_to_page: noop,
  table: noop,
  table_row: noop,
  embed: noop,
  bookmark: noop,
  image: async (block: any) => {
    const contents = block[block.type];
    const buffer = await fetch(contents[contents.type].url).then(async (res) =>
      Buffer.from(await res.arrayBuffer())
    );
    const { metadata } = await lqip(buffer);
    const blurDataUrl = `data:image/${metadata.type};base64,${metadata.dataURIBase64}`;
    block.image['size'] = { height: metadata.height, width: metadata.width };
    block.image['placeholder'] = blurDataUrl;

    return block;
  },
  video: noop,
  pdf: noop,
  audio: noop,
  link_preview: noop,
  unsupported: noop,
};

const CompareFunctionLookup = {
  asc: compareAsc,
  desc: compareDesc,
};

class NotionApi {
  constructor(
    private readonly notion: Client,
    private readonly databaseId: string
  ) {}

  // Map a Notion page to a Post object
  private mapPage = (page: any): Post => {
    if (!isFullPage(page)) {
      throw new Error('Notion page is not a full page');
    }
    return {
      id: page.id,
      createdAt: page.created_time,
      lastEditedAt: page.last_edited_time,
      coverImage:
        page.cover?.type === 'external'
          ? page.cover.external.url
          : page.cover?.type === 'file'
          ? page.cover.file.url
          : null,
      tags:
        'multi_select' in page.properties['태그'] &&
        Array.isArray(page.properties['태그'].multi_select)
          ? page.properties['태그'].multi_select.map((tag: any) => tag.name)
          : [],
      title:
        'title' in page.properties['이름']
          ? page.properties['이름'].title[0]?.plain_text
          : '',
      description:
        'rich_text' in page.properties['설명']
          ? page.properties['설명'].rich_text[0]?.plain_text
          : '',
      slug:
        'rich_text' in page.properties['slug']
          ? page.properties['slug'].rich_text[0]?.plain_text
          : '',
    };
  };

  // Query posts from Notion database with given options
  private async queryPosts(options: {
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    customFilter?: any;
    startCursor?: string;
  }): Promise<{ posts: Post[]; nextCursor?: string }> {
    const { sortOrder = 'desc', limit, customFilter, startCursor } = options;

    // 기본 필터: 블로그 게시 체크박스가 true인 것
    const baseFilter = {
      property: '블로그 게시',
      checkbox: { equals: true },
    };

    // customFilter가 있을 경우 and 필터로 연결합니다.
    const filter = customFilter
      ? {
          and: [baseFilter, customFilter],
        }
      : baseFilter;

    const sorts = [
      {
        property: '생성 일시',
        direction:
          sortOrder === 'asc'
            ? ('ascending' as const)
            : ('descending' as const),
      },
    ];

    const response = await this.notion.databases.query({
      database_id: this.databaseId,
      filter,
      sorts,
      page_size: limit,
      start_cursor: startCursor,
    });

    const posts = response.results.map(this.mapPage);

    return { posts, nextCursor: response.next_cursor ?? undefined };
  }

  // Get posts from Notion database, supporting page and limit options.
  // 만약 page와 limit이 제공되면 해당 페이지의 데이터만 Notion API를 통해 가져옵니다.
  async getPosts(
    sortOrder: 'asc' | 'desc' = 'desc',
    page?: number,
    limit?: number
  ) {
    // page와 limit 모두 제공되면 페이지네이션 방식으로 가져옵니다.
    if (page && limit) {
      let startCursor: string | undefined = undefined;
      let currentPage = 1;
      let posts: Post[] = [];
      while (currentPage <= page) {
        const { posts: curPosts, nextCursor } = await this.queryPosts({
          sortOrder,
          limit,
          startCursor,
        });
        // 원하는 페이지에 도달하면 결과를 반환합니다.
        if (currentPage === page) {
          posts = curPosts;
          break;
        }
        // 다음페이지로 이동
        if (nextCursor) {
          startCursor = nextCursor;
          currentPage++;
        } else {
          // 더 이상 페이지가 없으면 빈 배열을 반환합니다.
          posts = [];
          break;
        }
      }
      return posts;
    } else if (limit) {
      // limit만 제공되면 첫 페이지만 가져옵니다.
      const { posts } = await this.queryPosts({ sortOrder, limit });
      return posts;
    } else {
      // page, limit이 없는 경우 전체 게시글을 가져온 후 정렬합니다.
      let allPosts: Post[] = [];
      let startCursor: string | undefined = undefined;
      do {
        const { posts, nextCursor } = await this.queryPosts({
          sortOrder,
          startCursor,
        });
        allPosts = allPosts.concat(posts);
        startCursor = nextCursor;
      } while (startCursor);

      allPosts.sort((a, b) =>
        CompareFunctionLookup[sortOrder](
          new Date(a.createdAt),
          new Date(b.createdAt)
        )
      );
      return allPosts;
    }
  }

  // Get posts by tag(s) from Notion database (모든 지정 태그를 포함하는 게시글)
  async getPostsByTag(
    tags: string[],
    sortOrder: 'asc' | 'desc' = 'desc',
    page?: number,
    limit?: number
  ) {
    // 만약 태그 배열이 비어있다면 전체 게시글 조회
    if (tags.length === 0) {
      return await this.getPosts(sortOrder, page, limit);
    }

    // 각 태그마다 multi_select filter를 생성하고, 모두 만족하는 조건(and)으로 결합합니다.
    const tagsFilter = {
      and: tags.map((tag) => ({
        property: '태그',
        multi_select: { contains: tag },
      })),
    };

    // page와 limit 모두 제공되면 페이지네이션 방식으로 가져옵니다.
    if (page && limit) {
      let startCursor: string | undefined = undefined;
      let currentPage = 1;
      let posts: Post[] = [];
      while (currentPage <= page) {
        const { posts: curPosts, nextCursor } = await this.queryPosts({
          sortOrder,
          limit,
          customFilter: tagsFilter,
          startCursor,
        });
        // 원하는 페이지에 도달하면 결과를 반환합니다.
        if (currentPage === page) {
          posts = curPosts;
          break;
        }
        // 다음 페이지로 이동
        if (nextCursor) {
          startCursor = nextCursor;
          currentPage++;
        } else {
          posts = [];
          break;
        }
      }
      return posts;
    } else if (limit) {
      const { posts } = await this.queryPosts({
        sortOrder,
        limit,
        customFilter: tagsFilter,
      });
      return posts;
    } else {
      let allPosts: Post[] = [];
      let startCursor: string | undefined = undefined;
      do {
        const { posts, nextCursor } = await this.queryPosts({
          sortOrder,
          customFilter: tagsFilter,
          startCursor,
        });
        allPosts = allPosts.concat(posts);
        startCursor = nextCursor;
      } while (startCursor);
      return allPosts;
    }
  }

  // 제목과 내용을 검색하여 게시글을 가져오는 함수
  async getPostsBySearch(
    search: string,
    sortOrder: 'asc' | 'desc' = 'desc',
    page?: number,
    limit?: number
  ) {
    // Notion 필터로 검색 조건 구성
    const searchFilter = {
      or: [
        {
          property: '이름',
          title: { contains: search },
        },
        {
          property: '설명',
          rich_text: { contains: search },
        },
      ],
    };

    // page와 limit 모두 제공되면 페이지네이션 방식으로 가져옵니다.
    if (page && limit) {
      let startCursor: string | undefined = undefined;
      let currentPage = 1;
      let posts: Post[] = [];
      while (currentPage <= page) {
        const { posts: curPosts, nextCursor } = await this.queryPosts({
          sortOrder,
          limit,
          customFilter: searchFilter,
          startCursor,
        });
        // 원하는 페이지에 도달하면 결과를 반환합니다.
        if (currentPage === page) {
          posts = curPosts;
          break;
        }
        // 다음페이지로 이동
        if (nextCursor) {
          startCursor = nextCursor;
          currentPage++;
        } else {
          posts = [];
          break;
        }
      }
      return posts;
    } else if (limit) {
      const { posts } = await this.queryPosts({
        sortOrder,
        limit,
        customFilter: searchFilter,
      });
      return posts;
    } else {
      let allPosts: Post[] = [];
      let startCursor: string | undefined = undefined;
      do {
        const { posts, nextCursor } = await this.queryPosts({
          sortOrder,
          customFilter: searchFilter,
          startCursor,
        });
        allPosts = allPosts.concat(posts);
        startCursor = nextCursor;
      } while (startCursor);
      return allPosts;
    }
  }

  async getPost(slug: string) {
    const filter = {
      property: 'slug',
      rich_text: { equals: slug },
    };

    const { posts } = await this.queryPosts({ customFilter: filter, limit: 1 });
    if (posts.length === 0) {
      throw new Error('Post not found');
    }
    const post = posts[0];
    const content = await this.getPageContent(post.id);

    return { ...post, content };
  }

  async getAllTags() {
    const posts = await this.getPosts();
    return Array.from(
      posts.reduce((tagSet: Set<string>, post: Post) => {
        post.tags.forEach((tag) => tagSet.add(tag));
        return tagSet;
      }, new Set<string>())
    );
  }

  private getPageContent = async (pageId: string) => {
    const blocks = await this.getBlocks(pageId);

    const blocksChildren = await Promise.all(
      blocks.map(async (block) => {
        const { id } = block;
        const contents = block[block.type as keyof typeof block] as any;
        if (
          !['unsupported', 'child_page'].includes(block.type) &&
          block.has_children
        ) {
          contents.children = await this.getBlocks(id);
        }

        return block;
      })
    );

    return Promise.all(
      blocksChildren.map(async (block) => {
        return BlockTypeTransformLookup[block.type as BlockType](block);
      })
    ).then((blocks) => {
      return blocks.reduce((acc: any, curr) => {
        if (curr.type === 'bulleted_list_item') {
          if (acc[acc.length - 1]?.type === 'bulleted_list') {
            acc[acc.length - 1][acc[acc.length - 1].type].children?.push(curr);
          } else {
            acc.push({
              type: 'bulleted_list',
              bulleted_list: { children: [curr] },
            });
          }
        } else if (curr.type === 'numbered_list_item') {
          if (acc[acc.length - 1]?.type === 'numbered_list') {
            acc[acc.length - 1][acc[acc.length - 1].type].children?.push(curr);
          } else {
            acc.push({
              type: 'numbered_list',
              numbered_list: { children: [curr] },
            });
          }
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
    });
  };

  private getBlocks = async (blockId: string) => {
    const list = await this.notion.blocks.children.list({
      block_id: blockId,
    });

    while (list.has_more && list.next_cursor) {
      const { results, has_more, next_cursor } =
        await this.notion.blocks.children.list({
          block_id: blockId,
          start_cursor: list.next_cursor,
        });
      list.results = list.results.concat(results);
      list.has_more = has_more;
      list.next_cursor = next_cursor;
    }

    return list.results as BlockObjectResponse[];
  };
}

export const notionApi = new NotionApi(notion, process.env.NOTION_DATABASE_ID!);
