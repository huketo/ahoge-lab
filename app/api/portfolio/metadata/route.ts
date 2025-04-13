import { NextResponse } from "next/server";
import { portfolioApi } from "@/lib/notion";

export async function GET() {
	try {
		// 카테고리와 기술 정보를 병렬로 가져옵니다
		const [categories, technologies] = await Promise.all([
			portfolioApi.getAllPortfolioCategories(),
			portfolioApi.getAllPortfolioTechnologies(),
		]);

		return NextResponse.json({ categories, technologies });
	} catch (error) {
		console.error("포트폴리오 메타데이터 가져오기 실패:", error);
		return NextResponse.json(
			{
				error: "포트폴리오 메타데이터를 가져오는 중 오류가 발생했습니다.",
			},
			{ status: 500 }
		);
	}
}
