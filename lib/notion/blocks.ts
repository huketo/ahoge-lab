import { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import lqip from "lqip-modern";
import { TransformedBlock } from "./types";
import { notion } from "./client";

const noop = async (block: BlockObjectResponse) => block;

/**
 * Union type of all block types
 * @see https://developers.notion.com/reference/block
 */
type BlockType = BlockObjectResponse["type"];

/**
 * Lookup table for transforming block types
 * Allows to transform an api response for a specific block type into a more usable format
 */
export const BlockTypeTransformLookup: Record<
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
		try {
			// AbortController를 사용하여 타임아웃 구현
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

			const buffer = await Promise.race([
				fetch(contents[contents.type].url, {
					signal: controller.signal,
				}).then(async (res) => {
					if (!res.ok)
						throw new Error(`Failed to fetch image: ${res.status}`);
					return Buffer.from(await res.arrayBuffer());
				}),
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error("Fetch timeout")), 5000)
				),
			])
				.catch((err) => {
					console.warn(`Could not fetch image: ${err.message}`);
					return null;
				})
				.finally(() => {
					clearTimeout(timeoutId);
				});

			// 이미지 버퍼를 성공적으로 가져온 경우에만 처리
			if (buffer) {
				try {
					// buffer가 null이 아닌 경우에만 lqip 처리
					const { metadata } = await lqip(buffer as Buffer);

					// 이미지 크기 정보 저장
					block.image["size"] = {
						height: metadata.height || 500,
						width: metadata.width || 800,
					};

					// 이미지가 40x40보다 클 경우에만 placeholder 적용
					if (metadata.height > 40 && metadata.width > 40) {
						const blurDataURL = `data:${metadata.type};base64,${metadata.dataURIBase64}`;
						block.image["placeholder"] = blurDataURL;
					}
				} catch (error) {
					// 타입 캐스팅으로 TypeScript 오류 해결
					const lqipError = error as Error;
					console.warn(
						`LQIP processing failed: ${lqipError.message}`
					);
					// 메타데이터 생성에 실패해도 기본 크기 정보는 설정
					block.image["size"] = { height: 500, width: 800 };
				}
			} else {
				// 이미지를 가져오지 못한 경우 기본 크기 설정
				block.image["size"] = { height: 500, width: 800 };
			}
		} catch (err) {
			// 타입 캐스팅으로 TypeScript 오류 해결
			const error = err as Error;
			console.error(`Error processing image block: ${error.message}`);
			// 오류 발생 시 기본 크기 설정
			block.image["size"] = { height: 500, width: 800 };
		}

		return block;
	},
	video: noop,
	pdf: noop,
	audio: noop,
	link_preview: noop,
	unsupported: noop,
};

// 블록 하위 아이템 가져오기
export const getBlocks = async (blockId: string) => {
	const list = await notion.blocks.children.list({
		block_id: blockId,
	});

	while (list.has_more && list.next_cursor) {
		const { results, has_more, next_cursor } =
			await notion.blocks.children.list({
				block_id: blockId,
				start_cursor: list.next_cursor,
			});
		list.results = list.results.concat(results);
		list.has_more = has_more;
		list.next_cursor = next_cursor;
	}

	return list.results as BlockObjectResponse[];
};

// 페이지 콘텐츠 가져오기
export const getPageContent = async (
	pageId: string
): Promise<TransformedBlock[]> => {
	const blocks = await getBlocks(pageId);

	const blocksChildren = await Promise.all(
		blocks.map(async (block) => {
			const { id } = block;
			const contents = block[block.type as keyof typeof block] as any;
			if (
				!["unsupported", "child_page"].includes(block.type) &&
				block.has_children
			) {
				contents.children = await getBlocks(id);
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
			if (curr.type === "bulleted_list_item") {
				if (acc[acc.length - 1]?.type === "bulleted_list") {
					acc[acc.length - 1][
						acc[acc.length - 1].type
					].children?.push(curr);
				} else {
					acc.push({
						type: "bulleted_list",
						bulleted_list: { children: [curr] },
					});
				}
			} else if (curr.type === "numbered_list_item") {
				if (acc[acc.length - 1]?.type === "numbered_list") {
					acc[acc.length - 1][
						acc[acc.length - 1].type
					].children?.push(curr);
				} else {
					acc.push({
						type: "numbered_list",
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
