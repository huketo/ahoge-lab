import { Client } from "@notionhq/client";

// Notion 클라이언트 초기화
export const notion = new Client({
	auth: process.env.NOTION_API_TOKEN,
});
