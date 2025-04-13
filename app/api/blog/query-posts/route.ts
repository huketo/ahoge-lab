import { NextResponse, NextRequest } from "next/server";
import { notionApi } from "@/lib/notionApi";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			sortOrder = "desc",
			limit,
			tags, // string[] : 복수 태그 필터
			search, // string : 제목/내용 검색
			cursor, // string | undefined : 다음 페이지 커서
		} = body;

		let result;

		if (tags && Array.isArray(tags) && tags.length > 0) {
			result = await notionApi.getPostsByCursor({
				tags,
				sortOrder,
				limit,
				startCursor: cursor,
			});
		} else if (
			search &&
			typeof search === "string" &&
			search.trim() !== ""
		) {
			result = await notionApi.getPostsByCursor({
				search,
				sortOrder,
				limit,
				startCursor: cursor,
			});
		} else {
			result = await notionApi.getPostsByCursor({
				sortOrder,
				limit,
				startCursor: cursor,
			});
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error(error);
		return NextResponse.error();
	}
}
