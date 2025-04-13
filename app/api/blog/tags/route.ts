import { NextResponse } from "next/server";
import { notionApi } from "@/lib/notion";

export async function GET() {
	try {
		const tags = await notionApi.getAllTags();
		return NextResponse.json({ tags });
	} catch (error) {
		console.error(error);
		return NextResponse.error();
	}
}
