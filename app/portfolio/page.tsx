"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Portfolio } from "@/lib/notion/types";

export default function PortfolioPage() {
	const [projects, setProjects] = useState<Portfolio[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [technologies, setTechnologies] = useState<string[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(true);

	// 포트폴리오 데이터 및 필터 옵션 가져오기
	useEffect(() => {
		async function fetchInitialData() {
			try {
				// API에서 모든 프로젝트 데이터 가져오기
				const projectsResponse = await fetch("/api/portfolio");
				const projectsData = await projectsResponse.json();

				// API에서 카테고리 및 기술 메타데이터 가져오기
				const metadataResponse = await fetch("/api/portfolio/metadata");
				const metadataData = await metadataResponse.json();

				setProjects(projectsData.portfolios || []);
				setCategories(metadataData.categories || []);
				setTechnologies(metadataData.technologies || []);
			} catch (error) {
				console.error("데이터 로딩 중 오류 발생:", error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchInitialData();
	}, []);

	// 카테고리 토글
	const toggleCategory = (category: string) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	// 기술 토글
	const toggleTechnology = (tech: string) => {
		setSelectedTechnologies((prev) =>
			prev.includes(tech)
				? prev.filter((t) => t !== tech)
				: [...prev, tech]
		);
	};

	// 필터링된 프로젝트 가져오기
	const getFilteredProjects = useCallback(() => {
		if (
			selectedCategories.length === 0 &&
			selectedTechnologies.length === 0
		) {
			return projects;
		}

		return projects.filter((project) => {
			const matchesCategories =
				selectedCategories.length === 0 ||
				project.categories.some((category) =>
					selectedCategories.includes(category)
				);

			const matchesTechnologies =
				selectedTechnologies.length === 0 ||
				project.technologies.some((tech) =>
					selectedTechnologies.includes(tech)
				);

			return matchesCategories && matchesTechnologies;
		});
	}, [projects, selectedCategories, selectedTechnologies]);

	// 필터링된 프로젝트
	const filteredProjects = getFilteredProjects();

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-50 to-background dark:from-pink-950/20 pb-12">
			{/* Header */}
			<div className="container py-8 md:py-12">
				<div className="space-y-4">
					<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
						Portfolio
					</h1>
					<p className="text-xl text-muted-foreground">
						A collection of my projects and experiments
					</p>
				</div>
			</div>

			{/* Filters */}
			<section className="sticky top-16 z-40 container py-4">
				<div className="rounded-lg border border-border p-4 shadow-sm bg-card">
					{/* Categories */}
					<div className="space-y-2">
						<h2 className="text-sm font-medium text-muted-foreground">
							Categories
						</h2>
						<div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
							{categories.map((category) => (
								<Badge
									key={category}
									variant={
										selectedCategories.includes(category)
											? "default"
											: "outline"
									}
									className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
									onClick={() => toggleCategory(category)}
								>
									{category}
								</Badge>
							))}
						</div>
					</div>

					{/* Technologies */}
					<div className="space-y-2 mt-4">
						<h2 className="text-sm font-medium text-muted-foreground">
							Technologies
						</h2>
						<div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
							{technologies.map((tech) => (
								<Badge
									key={tech}
									variant={
										selectedTechnologies.includes(tech)
											? "default"
											: "outline"
									}
									className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
									onClick={() => toggleTechnology(tech)}
								>
									{tech}
								</Badge>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Projects Grid */}
			<div className="container py-8">
				{isLoading ? (
					<div className="flex justify-center items-center py-12">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
					</div>
				) : filteredProjects.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-xl text-muted-foreground">
							No projects found
						</p>
					</div>
				) : (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{filteredProjects.map((project) => (
							<div
								key={project.id}
								className="group relative overflow-hidden rounded-lg border bg-card p-4 text-card-foreground transition-all hover:-translate-y-1 hover:shadow-lg"
							>
								<div className="relative mb-4 aspect-video overflow-hidden rounded-md bg-muted">
									<Image
										src={
											project.coverImage ||
											"/placeholder.svg"
										}
										alt={project.title}
										fill
										className="object-cover transition-transform group-hover:scale-105"
									/>
								</div>
								<div className="space-y-2">
									<div className="flex items-start justify-between">
										<h3 className="font-semibold">
											{project.title}
										</h3>
										<div className="flex gap-2">
											{project.demoUrl && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													asChild
												>
													<Link
														href={project.demoUrl}
														target="_blank"
													>
														<ExternalLink className="h-4 w-4" />
														<span className="sr-only">
															Visit demo
														</span>
													</Link>
												</Button>
											)}
											{project.githubUrl && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													asChild
												>
													<Link
														href={project.githubUrl}
														target="_blank"
													>
														<Github className="h-4 w-4" />
														<span className="sr-only">
															View source
														</span>
													</Link>
												</Button>
											)}
										</div>
									</div>
									<div className="flex flex-wrap gap-2">
										{project.technologies.map((tech) => (
											<Badge
												key={tech}
												variant="secondary"
												className="text-xs"
											>
												{tech}
											</Badge>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
