'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Post } from '@/lib/notionApi';

export default function BlogPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const limit = 9;

  // 태그를 가져옵니다.
  useEffect(() => {
    async function fetchTags() {
      const res = await fetch('/api/blog/tags');
      const data = await res.json();
      setTags(data.tags);
    }
    fetchTags();
  }, []);

  // 필터 조건 및 페이지 변경 시 POST 요청으로 posts를 가져옵니다.
  useEffect(() => {
    async function fetchPosts() {
      try {
        const body = {
          sortOrder: 'desc',
          page: currentPage,
          limit,
          tags: selectedTags,
          search: searchQuery,
        };
        const res = await fetch('/api/blog/query-posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        setPosts(data.posts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    }
    fetchPosts();
  }, [selectedTags, searchQuery, currentPage]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    // 태그 필터가 변경되면 페이지를 초기화합니다.
    setCurrentPage(1);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNext = () => {
    // 불러온 게시글 개수가 limit보다 작으면 마지막 페이지
    if (posts.length === limit) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-background dark:from-pink-950/20 pb-12">
      {/* Search and Filter Section */}
      <section className="sticky top-16 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="container py-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search posts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Tags */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            {tags?.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group relative overflow-hidden rounded-lg border bg-card p-4 text-card-foreground transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative mb-4 aspect-video overflow-hidden rounded-md">
                <Image
                  src={post.coverImage || '/placeholder.svg'}
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
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <time className="block text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </time>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button variant="outline" disabled>
            {currentPage}
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={posts.length < limit}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
