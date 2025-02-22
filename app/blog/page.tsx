'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data for demonstration
const tags = [
  'Programming',
  'JavaScript',
  'React',
  'TypeScript',
  'Next.js',
  'CSS',
  'Anime',
  'Research',
];

const posts = Array(9).fill({
  title: 'Understanding the Magic of React Hooks',
  summary:
    'A deep dive into React Hooks and how they revolutionize state management in functional components...',
  date: '2024-02-22',
  tags: ['React', 'JavaScript', 'Programming'],
  image: '/placeholder.svg',
});

export default function BlogPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Filter posts based on search query and selected tags
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => post.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
            {tags.map((tag) => (
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
          {filteredPosts.map((post, i) => (
            <Link
              key={i}
              href={`/blog/post-${i}`}
              className="group relative overflow-hidden rounded-lg border bg-card p-4 text-card-foreground transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative mb-4 aspect-video overflow-hidden rounded-md">
                <Image
                  src={post.image || '/placeholder.svg'}
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
                  {post.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <time className="block text-sm text-muted-foreground">
                  {new Date(post.date).toLocaleDateString()}
                </time>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center gap-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button variant="outline">1</Button>
          <Button variant="default">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">Next</Button>
        </div>
      </div>
    </div>
  );
}
