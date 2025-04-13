import { NextRequest, NextResponse } from "next/server";
import { portfolioApi } from "@/lib/notion";

export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);

		// 쿼리 파라미터 추출
		const categories = url.searchParams.get("categories")?.split(",") || [];
		const technologies =
			url.searchParams.get("technologies")?.split(",") || [];

		let portfolios;

		// 필터링 조건이 있는 경우
		if (
			(categories.length > 0 && categories[0] !== "") ||
			(technologies.length > 0 && technologies[0] !== "")
		) {
			portfolios = await portfolioApi.getPortfoliosByFilter({
				categories: categories[0] ? categories : [],
				technologies: technologies[0] ? technologies : [],
			});
		} else {
			// 모든 포트폴리오 가져오기
			portfolios = await portfolioApi.getPortfolios();
		}

		return NextResponse.json({ portfolios });
	} catch (error) {
		console.error("포트폴리오 데이터 가져오기 실패:", error);
		return NextResponse.json(
			{ error: "포트폴리오 데이터를 가져오는 중 오류가 발생했습니다." },
			{ status: 500 }
		);
	}
}
