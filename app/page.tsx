import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { notionApi } from "@/lib/notionApi";

export default async function Home() {
	const recentPosts = await notionApi.getPosts("desc", 1, 3);

	return (
		<div className="bg-gradient-to-b from-pink-50 to-background dark:from-pink-950/20">
			{/* Hero Section */}
			<section className="container py-24 md:py-32">
				<div className="grid items-center gap-8 md:grid-cols-2">
					<div className="space-y-6">
						<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
							Welcome to{" "}
							<span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
								Ahoge Lab
							</span>
						</h1>
						<p className="text-xl text-muted-foreground">
							안녕하세요, I&apos;m Ahoge Hakase 👨🏻‍🔬✨
						</p>
						<div className="pt-2">
							<Link href="/blog">
								<Button className="group" size="lg">
									Read Blog
									<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
								</Button>
							</Link>
						</div>
					</div>
					<div className="relative mx-auto aspect-square w-full max-w-md">
						<Image
							src="/ahoge-hakase.png"
							alt="Ahoge Hakase"
							fill
							className="animate-float object-contain"
							sizes="(max-width: 768px) 100vw, 50vw"
							priority
						/>
					</div>
				</div>
			</section>

			{/* Recent Posts */}
			<section className="container py-24">
				<h2 className="mb-12 text-center text-3xl font-bold">
					Recent Posts
				</h2>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{recentPosts.map((post) => (
						<Link
							key={post.id}
							href={`/blog/${post.slug}`}
							className="group relative overflow-hidden rounded-lg border bg-card p-4 text-card-foreground transition-shadow hover:shadow-lg"
						>
							<div className="relative mb-4 aspect-video overflow-hidden rounded-md">
								<Image
									src={post.coverImage ?? "/placeholder.svg"}
									alt={`"${post.title}"'s cover image`}
									fill
									className="object-cover transition-transform group-hover:scale-105"
								/>
							</div>
							<h3 className="mb-2 font-semibold">
								{post.title.length > 50
									? `${post.title.slice(0, 50)}...`
									: post.title}
							</h3>
							<p className="text-sm text-muted-foreground">
								{post.description.length > 100
									? `${post.description.slice(0, 100)}...`
									: post.description}
							</p>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
