import { notion } from "./client";
import { PostsApi } from "./posts";
import { PortfolioApi } from "./portfolio";

// 블로그 포스트 API 인스턴스 생성
export const notionApi = new PostsApi(
	notion,
	process.env.NOTION_POST_DATABASE_ID!
);

// 포트폴리오 API 인스턴스 생성
export const portfolioApi = new PortfolioApi(
	notion,
	process.env.NOTION_PORTFOLIO_DATABASE_ID!
);

// 타입 내보내기
export * from "./types";
export * from "./blocks";
