"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// Mock data for demonstration
const categories = ["Web", "Mobile", "Desktop", "Library", "Design"];

const technologies = [
	"React",
	"Next.js",
	"TypeScript",
	"Node.js",
	"Tailwind",
	"Python",
	"Flutter",
	"Rust",
];

const projects = [
	{
		title: "Pixel Perfect Editor",
		description:
			"A modern pixel art editor with real-time collaboration features and custom brush support.",
		image: "/placeholder.svg",
		categories: ["Web", "Desktop"],
		technologies: ["React", "TypeScript", "Node.js"],
		demoUrl: "https://demo.example.com",
		githubUrl: "https://github.com/example",
	},
	{
		title: "Weather Forecast App",
		description:
			"Beautiful weather application with animated transitions and accurate forecasts.",
		image: "/placeholder.svg",
		categories: ["Mobile"],
		technologies: ["Flutter", "Python"],
		demoUrl: "https://demo.example.com",
		githubUrl: "https://github.com/example",
	},
	{
		title: "Data Visualization Library",
		description:
			"High-performance data visualization library with support for large datasets.",
		image: "/placeholder.svg",
		categories: ["Library"],
		technologies: ["TypeScript", "React"],
		demoUrl: "https://demo.example.com",
		githubUrl: "https://github.com/example",
	},
	{
		title: "Task Management System",
		description:
			"Efficient task management system with real-time updates and team collaboration features.",
		image: "/placeholder.svg",
		categories: ["Web"],
		technologies: ["Next.js", "TypeScript", "Node.js"],
		demoUrl: "https://demo.example.com",
		githubUrl: "https://github.com/example",
	},
	{
		title: "System Monitor Dashboard",
		description:
			"Real-time system monitoring dashboard with beautiful visualizations.",
		image: "/placeholder.svg",
		categories: ["Desktop"],
		technologies: ["Rust", "TypeScript", "React"],
		demoUrl: "https://demo.example.com",
		githubUrl: "https://github.com/example",
	},
	{
		title: "UI Component Library",
		description:
			"A collection of beautiful and accessible UI components for modern web applications.",
		image: "/placeholder.svg",
		categories: ["Library", "Design"],
		technologies: ["React", "TypeScript", "Tailwind"],
		demoUrl: "https://demo.example.com",
		githubUrl: "https://github.com/example",
	},
] as const;

export default function PortfolioPage() {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
		[]
	);

	const toggleCategory = (category: string) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	const toggleTechnology = (tech: string) => {
		setSelectedTechnologies((prev) =>
			prev.includes(tech)
				? prev.filter((t) => t !== tech)
				: [...prev, tech]
		);
	};

	const filteredProjects = projects.filter((project) => {
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
			<section className="sticky top-16 z-40 border-b bg-background/80 backdrop-blur-sm">
				<div className="container py-4">
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
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{filteredProjects.map((project) => (
						<div
							key={project.title}
							className="group relative overflow-hidden rounded-lg border bg-card p-4 text-card-foreground transition-all hover:-translate-y-1 hover:shadow-lg"
						>
							<div className="relative mb-4 aspect-video overflow-hidden rounded-md bg-muted">
								<Image
									src={project.image || "/placeholder.svg"}
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
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											asChild
										>
											<Link href={project.demoUrl}>
												<ExternalLink className="h-4 w-4" />
												<span className="sr-only">
													Visit demo
												</span>
											</Link>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8"
											asChild
										>
											<Link href={project.githubUrl}>
												<Github className="h-4 w-4" />
												<span className="sr-only">
													View source
												</span>
											</Link>
										</Button>
									</div>
								</div>
								<p className="text-sm text-muted-foreground line-clamp-2">
									{project.description}
								</p>
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
			</div>
		</div>
	);
}
