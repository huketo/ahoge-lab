"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, ArrowUp } from "lucide-react";
import { Post } from "@/lib/notion/types";

export default function BlogPage() {
	const [tags, setTags] = useState<string[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
	const [initialLoad, setInitialLoad] = useState(true);
	const [showScrollTop, setShowScrollTop] = useState(false);

	const limit = 12; // 한 번에 가져올 게시물 수를 12개로 수정
	const observerRef = useRef<IntersectionObserver | null>(null);
	const loadingRef = useRef<HTMLDivElement>(null);

	// fetchPosts 함수를 useCallback으로 메모이제이션
	const fetchPosts = useCallback(async () => {
		if (loading || !hasMore) return;

		setLoading(true);
		try {
			const body = {
				sortOrder: "desc",
				limit,
				tags: selectedTags,
				search: searchQuery,
				cursor: nextCursor,
			};

			const res = await fetch("/api/blog/query-posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const data = await res.json();

			if (data.posts.length === 0) {
				setHasMore(false);
			} else {
				// 중복 게시물 필터링 로직 추가
				setPosts((prev) => {
					// 기존 posts에 있는 id들을 Set으로 만들어 빠른 검색 가능하게 함
					const existingIds = new Set(
						prev.map((post: Post) => post.id)
					);
					// 새로운 posts에서 기존에 없는 것만 필터링
					const newPosts = data.posts.filter(
						(post: Post) => !existingIds.has(post.id)
					);
					return [...prev, ...newPosts];
				});

				setNextCursor(data.nextCursor);
				setHasMore(!!data.nextCursor);
			}
		} catch (error) {
			console.error("Failed to fetch posts:", error);
		} finally {
			setLoading(false);
		}
	}, [loading, hasMore, selectedTags, searchQuery, nextCursor, limit]);

	// 태그를 가져옵니다.
	useEffect(() => {
		async function fetchTags() {
			const res = await fetch("/api/blog/tags");
			const data = await res.json();
			setTags(data.tags);
		}
		fetchTags();
	}, []);

	// 필터 조건 변경시 posts를 초기화하고 새로 가져옵니다.
	useEffect(() => {
		// 필터 조건이 변경되면 상태 초기화
		setPosts([]);
		setNextCursor(undefined);
		setHasMore(true);
		setInitialLoad(true); // 초기 로딩 상태로 설정
	}, [selectedTags, searchQuery]);

	// 초기 로딩 또는 필터 조건 변경 시에만 데이터를 가져오는 효과
	useEffect(() => {
		if (initialLoad) {
			fetchPosts();
			setInitialLoad(false);
		}
	}, [initialLoad, fetchPosts]);

	// IntersectionObserver 설정
	const handleObserver = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [target] = entries;
			if (target.isIntersecting && hasMore && !loading && !initialLoad) {
				fetchPosts();
			}
		},
		[hasMore, loading, initialLoad, fetchPosts]
	);

	// IntersectionObserver 등록
	useEffect(() => {
		const options = {
			root: null,
			rootMargin: "0px",
			threshold: 0.1,
		};

		if (observerRef.current) {
			observerRef.current.disconnect();
		}

		observerRef.current = new IntersectionObserver(handleObserver, options);

		if (loadingRef.current) {
			observerRef.current.observe(loadingRef.current);
		}

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [handleObserver]);

	// 스크롤 위치를 감지하여 맨 위로 가기 버튼 표시 여부 결정
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 300) {
				setShowScrollTop(true);
			} else {
				setShowScrollTop(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	// 맨 위로 이동하는 함수
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-50 to-background dark:from-pink-950/20 pb-12">
			{/* Search and Filter Section - sticky 속성 제거 */}
			<section className="border-b bg-background/80 backdrop-blur-sm">
				<div className="container py-4">
					{/* Search Bar */}
					<div className="relative mb-4">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search posts..."
							className="pl-10"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>

					{/* Tags */}
					<div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
						{tags?.map((tag) => (
							<Badge
								key={tag}
								variant={
									selectedTags.includes(tag)
										? "default"
										: "outline"
								}
								className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
								onClick={() => toggleTag(tag)}
							>
								{tag}
							</Badge>
						))}
					</div>
				</div>
			</section>

			{/* Blog Posts Grid */}
			<div className="container py-8">
				<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
					{posts?.map((post) => (
						<Link
							key={post.id}
							href={`/blog/${post.slug}`}
							className="group relative overflow-hidden rounded-lg border bg-card p-4 text-card-foreground transition-all hover:-translate-y-1 hover:shadow-lg"
						>
							<div className="relative mb-4 aspect-video overflow-hidden rounded-md">
								<Image
									src={post.coverImage || "/placeholder.svg"}
									alt={post.title}
									fill
									className="object-cover transition-transform group-hover:scale-105"
								/>
							</div>
							<div className="space-y-2">
								<h2 className="line-clamp-2 text-xl font-semibold">
									{post.title}
								</h2>
								<p className="line-clamp-2 text-sm text-muted-foreground">
									{post.description}
								</p>
								<div className="flex flex-wrap gap-2">
									{post.tags.map((tag: string) => (
										<Badge
											key={tag}
											variant="secondary"
											className="text-xs"
										>
											{tag}
										</Badge>
									))}
								</div>
								<time className="block text-sm text-muted-foreground">
									{new Date(
										post.createdAt
									).toLocaleDateString()}
								</time>
							</div>
						</Link>
					))}
				</div>

				{/* 무한 스크롤을 위한 로딩 표시 */}
				<div ref={loadingRef} className="flex justify-center py-8">
					{loading && (
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					)}
					{!hasMore && posts.length > 0 && (
						<p className="text-center text-muted-foreground">
							더 이상 게시물이 없습니다
						</p>
					)}
				</div>
			</div>

			{/* 맨 위로 이동 버튼 */}
			{showScrollTop && (
				<Button
					variant="secondary"
					size="icon"
					className="fixed bottom-6 left-6 z-50 rounded-full shadow-lg"
					onClick={scrollToTop}
					aria-label="맨 위로 이동"
				>
					<ArrowUp className="h-5 w-5" />
				</Button>
			)}
		</div>
	);
}
