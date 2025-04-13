import {
	BlockObjectResponse,
	RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

export type { RichTextItemResponse };

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

export type Portfolio = {
	id: string;
	title: string;
	coverImage: string | null;
	categories: string[];
	technologies: string[];
	demoUrl: string;
	githubUrl: string;
};

export type NotionListBlock = {
	id: string;
	type: "bulleted_list" | "numbered_list";
	bulleted_list?: {
		children: BlockObjectResponse[];
	};
	numbered_list?: {
		children: BlockObjectResponse[];
	};
};

export type BlockValue = {
	rich_text?: RichTextItemResponse[];
	checked?: boolean;
	children?: BlockObjectResponse[];
	caption?: RichTextItemResponse[];
	language?: string;
	url?: string;
	external?: { url: string };
	file?: { url: string };
	size?: { width: number; height: number };
	placeholder?: string;
	title?: string;
	type?: BlockObjectResponse["type"] | "external" | "file";
	icon?: { emoji: string } | { type: string; [key: string]: any };
	expression?: string;
};

export type NotionBlockType =
	| BlockObjectResponse["type"]
	| "bulleted_list"
	| "numbered_list";

export type BlockData = {
	[K in NotionBlockType]: BlockValue;
};

export type TransformedBlock = {
	id: string;
	type: NotionBlockType;
} & Partial<BlockData>;

// 커서 기반 게시물 조회를 위한 옵션 타입
export interface GetPostsByCursorOptions {
	sortOrder?: "asc" | "desc";
	limit?: number;
	startCursor?: string;
	tags?: string[];
	search?: string;
}
