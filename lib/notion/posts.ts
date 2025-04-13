import { Client, isFullPage } from "@notionhq/client";
import { compareAsc, compareDesc } from "date-fns";
import { GetPostsByCursorOptions, Post } from "./types";
import { getPageContent } from "./blocks";

// 정렬 관련 함수
const CompareFunctionLookup = {
	asc: compareAsc,
	desc: compareDesc,
};

export class PostsApi {
	constructor(
		private readonly notion: Client,
		private readonly databaseId: string
	) {}

	// Map a Notion page to a Post object
	private mapPost = (page: any): Post => {
		if (!isFullPage(page)) {
			throw new Error("Notion page is not a full page");
		}
		return {
			id: page.id,
			createdAt: page.created_time,
			lastEditedAt: page.last_edited_time,
			coverImage:
				page.cover?.type === "external"
					? page.cover.external.url
					: page.cover?.type === "file"
					? page.cover.file.url
					: null,
			tags:
				"multi_select" in page.properties["태그"] &&
				Array.isArray(page.properties["태그"].multi_select)
					? page.properties["태그"].multi_select.map(
							(tag: any) => tag.name
					  )
					: [],
			title:
				"title" in page.properties["이름"]
					? page.properties["이름"].title[0]?.plain_text
					: "",
			description:
				"rich_text" in page.properties["설명"]
					? page.properties["설명"].rich_text[0]?.plain_text
					: "",
			slug:
				"rich_text" in page.properties["slug"]
					? page.properties["slug"].rich_text[0]?.plain_text
					: "",
		};
	};

	// Query posts from Notion database with given options
	private async queryPosts(options: {
		sortOrder?: "asc" | "desc";
		limit?: number;
		customFilter?: any;
		startCursor?: string;
	}): Promise<{ posts: Post[]; nextCursor?: string }> {
		const {
			sortOrder = "desc",
			limit,
			customFilter,
			startCursor,
		} = options;

		// 기본 필터: 블로그 게시 체크박스가 true인 것
		const baseFilter = {
			property: "블로그 게시",
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
				property: "생성 일시",
				direction:
					sortOrder === "asc"
						? ("ascending" as const)
						: ("descending" as const),
			},
		];

		const response = await this.notion.databases.query({
			database_id: this.databaseId,
			filter,
			sorts,
			page_size: limit,
			start_cursor: startCursor,
		});

		const posts = response.results.map(this.mapPost);

		return { posts, nextCursor: response.next_cursor ?? undefined };
	}

	/**
	 * 커서 기반으로 포스트를 가져오는 통합 메서드
	 * 태그 필터링, 검색, 일반 조회 등 모든 경우를 처리합니다.
	 */
	async getPostsByCursor(
		options: GetPostsByCursorOptions
	): Promise<{ posts: Post[]; nextCursor?: string }> {
		const {
			sortOrder = "desc",
			limit = 12,
			startCursor,
			tags,
			search,
		} = options;

		let customFilter: any = undefined;

		// 태그 필터 적용
		if (tags && Array.isArray(tags) && tags.length > 0) {
			customFilter = {
				and: tags.map((tag) => ({
					property: "태그",
					multi_select: { contains: tag },
				})),
			};
		}
		// 검색 필터 적용
		else if (search && search.trim() !== "") {
			customFilter = {
				or: [
					{
						property: "이름",
						title: { contains: search },
					},
					{
						property: "설명",
						rich_text: { contains: search },
					},
				],
			};
		}

		// 커서 기반으로 게시물 조회
		return await this.queryPosts({
			sortOrder,
			limit,
			customFilter,
			startCursor,
		});
	}

	// Get posts from Notion database, supporting page and limit options.
	// 만약 page와 limit이 제공되면 해당 페이지의 데이터만 Notion API를 통해 가져옵니다.
	async getPosts(
		sortOrder: "asc" | "desc" = "desc",
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
		sortOrder: "asc" | "desc" = "desc",
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
				property: "태그",
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
		sortOrder: "asc" | "desc" = "desc",
		page?: number,
		limit?: number
	) {
		// Notion 필터로 검색 조건 구성
		const searchFilter = {
			or: [
				{
					property: "이름",
					title: { contains: search },
				},
				{
					property: "설명",
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
			property: "slug",
			rich_text: { equals: slug },
		};

		const { posts } = await this.queryPosts({
			customFilter: filter,
			limit: 1,
		});
		if (posts.length === 0) {
			throw new Error("Post not found");
		}
		const post = posts[0];
		const content = await getPageContent(post.id);

		return { ...post, content };
	}

	async getAllTags() {
		const response = await this.notion.databases.retrieve({
			database_id: this.databaseId,
		});

		const tagProperty = response.properties["태그"];
		if (tagProperty.type === "multi_select") {
			return tagProperty.multi_select.options.map(
				(option) => option.name
			);
		}

		return [];
	}
}
