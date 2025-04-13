import { notFound } from "next/navigation";
import { notionApi } from "@/lib/notion";
import { NotionBlockRenderer } from "@/components/notion/NotionBlockRenderer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, Twitter, Facebook, Link2 } from "lucide-react";
import Image from "next/image";

export default async function BlogPost({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;

	let post;
	try {
		post = await notionApi.getPost(slug);
	} catch (error) {
		console.error(error);
		notFound();
	}

	return (
		<article className="min-h-screen bg-gradient-to-b from-pink-50 to-background dark:from-pink-950/20 pb-12">
			{/* Header */}
			<header className="container space-y-8 py-12 lg:py-16">
				<div className="space-y-4">
					<div className="flex flex-wrap gap-2">
						{post.tags.map((tag: string) => (
							<Badge key={tag} variant="secondary">
								{tag}
							</Badge>
						))}
					</div>
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						{post.title}
					</h1>
				</div>

				<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<div className="relative h-10 w-10 overflow-hidden rounded-full">
							<Image
								src="/placeholder.svg"
								alt="Ahoge Hakase"
								fill
								className="object-cover"
							/>
						</div>
						<span className="font-medium text-foreground">
							Ahoge Hakase
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4" />
						<time>
							{new Date(post.createdAt).toLocaleDateString()}
						</time>
					</div>
					<div className="flex items-center gap-2">
						<Clock className="h-4 w-4" />
						<span>5 min read</span>
					</div>
				</div>

				<div className="relative aspect-video w-full overflow-hidden rounded-lg">
					<Image
						src={post.coverImage || "/placeholder.svg"}
						alt="Blog post cover"
						fill
						className="object-cover"
						priority
					/>
				</div>
			</header>

			{/* Content */}
			<div className="container">
				<div className="prose prose-pink dark:prose-invert mx-auto max-w-4xl">
					{post?.content.map((block: any) => (
						<NotionBlockRenderer key={block.id} block={block} />
					))}
				</div>
			</div>

			{/* Footer */}
			<footer className="container mt-12">
				<div className="mx-auto max-w-4xl space-y-8">
					<div className="flex flex-wrap items-center justify-end gap-4">
						<div className="flex gap-2">
							<Button variant="ghost" size="icon">
								<Twitter className="h-4 w-4" />
								<span className="sr-only">
									Share on Twitter
								</span>
							</Button>
							<Button variant="ghost" size="icon">
								<Facebook className="h-4 w-4" />
								<span className="sr-only">
									Share on Facebook
								</span>
							</Button>
							<Button variant="ghost" size="icon">
								<Link2 className="h-4 w-4" />
								<span className="sr-only">Copy link</span>
							</Button>
						</div>
					</div>
				</div>
			</footer>
		</article>
	);
}
