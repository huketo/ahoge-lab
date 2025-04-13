import { Client, isFullPage } from "@notionhq/client";
import { Portfolio } from "./types";
import { getPageContent } from "./blocks";

export class PortfolioApi {
	constructor(
		private readonly notion: Client,
		private readonly databaseId: string
	) {}

	private mapPortfolio = (page: any): Portfolio => {
		if (!isFullPage(page)) {
			throw new Error("Notion page is not a full page");
		}
		return {
			id: page.id,
			coverImage:
				page.cover?.type === "external"
					? page.cover.external.url
					: page.cover?.type === "file"
					? page.cover.file.url
					: null,
			title:
				"title" in page.properties["이름"]
					? page.properties["이름"].title[0]?.plain_text
					: "",
			categories:
				"multi_select" in page.properties["카테고리"]
					? page.properties["카테고리"].multi_select.map(
							(tag: any) => tag.name
					  )
					: [],
			technologies:
				"multi_select" in page.properties["기술"]
					? page.properties["기술"].multi_select.map(
							(tag: any) => tag.name
					  )
					: [],
			demoUrl:
				"url" in page.properties["프로젝트 URL"]
					? page.properties["프로젝트 URL"].url || ""
					: "",
			githubUrl:
				"url" in page.properties["Github URL"]
					? page.properties["Github URL"].url || ""
					: "",
		};
	};

	// 포트폴리오 쿼리 메서드
	private async queryPortfolios(options: {
		customFilter?: any;
		startCursor?: string;
	}): Promise<{ portfolios: Portfolio[]; nextCursor?: string }> {
		const { customFilter, startCursor } = options;

		// 기본 필터: 포트폴리오에 표시 체크박스가 true인 것
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

		// 정렬 옵션 제거 - 노션 API의 기본 정렬 순서를 사용합니다

		const response = await this.notion.databases.query({
			database_id: this.databaseId,
			filter,
			start_cursor: startCursor,
		});

		const portfolios = response.results.map(this.mapPortfolio);

		return { portfolios, nextCursor: response.next_cursor ?? undefined };
	}

	// 포트폴리오 데이터 가져오기
	async getPortfolios(limit?: number) {
		if (limit) {
			// limit이 제공되면 제한된 수의 포트폴리오만 가져옵니다.
			const { portfolios } = await this.queryPortfolios({});
			return portfolios;
		} else {
			// 전체 포트폴리오를 가져옵니다.
			let allPortfolios: Portfolio[] = [];
			let startCursor: string | undefined = undefined;
			do {
				const { portfolios, nextCursor } = await this.queryPortfolios({
					startCursor,
				});
				allPortfolios = allPortfolios.concat(portfolios);
				startCursor = nextCursor;
			} while (startCursor);

			return allPortfolios;
		}
	}

	// 카테고리나 기술로 포트폴리오 필터링
	async getPortfoliosByFilter(filterOptions: {
		categories?: string[];
		technologies?: string[];
	}) {
		// 필터링 조건이 없으면 모든 포트폴리오를 반환
		if (
			(!filterOptions.categories ||
				filterOptions.categories.length === 0) &&
			(!filterOptions.technologies ||
				filterOptions.technologies.length === 0)
		) {
			return await this.getPortfolios();
		}

		// 필터 조건 구성
		const filterConditions: any[] = [];

		// 카테고리 필터
		if (filterOptions.categories && filterOptions.categories.length > 0) {
			filterConditions.push({
				or: filterOptions.categories.map((category) => ({
					property: "카테고리",
					multi_select: { contains: category },
				})),
			});
		}

		// 기술 필터
		if (
			filterOptions.technologies &&
			filterOptions.technologies.length > 0
		) {
			filterConditions.push({
				or: filterOptions.technologies.map((tech) => ({
					property: "기술",
					multi_select: { contains: tech },
				})),
			});
		}

		// 필터 조건이 없는 경우 기본 필터만 사용
		const customFilter =
			filterConditions.length > 0 ? { and: filterConditions } : undefined;

		// 모든 결과를 가져옵니다
		let allPortfolios: Portfolio[] = [];
		let startCursor: string | undefined = undefined;

		try {
			do {
				const { portfolios, nextCursor } = await this.queryPortfolios({
					customFilter,
					startCursor,
				});
				allPortfolios = allPortfolios.concat(portfolios);
				startCursor = nextCursor;
			} while (startCursor);

			return allPortfolios;
		} catch (error) {
			console.error("포트폴리오 필터링 중 오류 발생:", error);
			throw error;
		}
	}

	// 특정 포트폴리오 항목 가져오기
	async getPortfolio(id: string) {
		const response = await this.notion.pages.retrieve({
			page_id: id,
		});

		const portfolio = this.mapPortfolio(response);
		const content = await getPageContent(portfolio.id);

		return { ...portfolio, content };
	}

	// 포트폴리오 카테고리 전체 목록 가져오기
	async getAllPortfolioCategories() {
		const response = await this.notion.databases.retrieve({
			database_id: this.databaseId,
		});

		const categoryProperty = response.properties["카테고리"];
		if (categoryProperty.type === "multi_select") {
			return categoryProperty.multi_select.options.map(
				(option) => option.name
			);
		}

		return [];
	}

	// 포트폴리오에 사용된 기술 전체 목록 가져오기
	async getAllPortfolioTechnologies() {
		const response = await this.notion.databases.retrieve({
			database_id: this.databaseId,
		});

		const techProperty = response.properties["기술"];
		if (techProperty.type === "multi_select") {
			return techProperty.multi_select.options.map(
				(option) => option.name
			);
		}

		return [];
	}
}
