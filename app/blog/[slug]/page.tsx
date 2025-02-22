import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Twitter, Facebook, Link2 } from "lucide-react"

export default function BlogPost() {
  return (
    <article className="min-h-screen bg-gradient-to-b from-pink-50 to-background dark:from-pink-950/20 pb-12">
      {/* Header */}
      <header className="container space-y-8 py-12 lg:py-16">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Programming</Badge>
            <Badge variant="secondary">React</Badge>
            <Badge variant="secondary">Tutorial</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Understanding React Server Components: A Comprehensive Guide
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image src="/placeholder.svg" alt="Ahoge Hakase" fill className="object-cover" />
            </div>
            <span className="font-medium text-foreground">Ahoge Hakase</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <time>February 22, 2024</time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>5 min read</span>
          </div>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image src="/placeholder.svg" alt="Blog post cover" fill className="object-cover" priority />
        </div>
      </header>

      {/* Content */}
      <div className="container">
        <div className="prose prose-pink dark:prose-invert mx-auto max-w-4xl">
          <h2>Introduction</h2>
          <p>
            React Server Components represent a paradigm shift in how we build React applications. In this comprehensive
            guide, we&apos;ll explore what they are, how they work, and when to use them.
          </p>

          <div className="my-8 rounded-lg border bg-muted/40 p-4">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 flex-none overflow-hidden rounded-full">
                <Image src="/placeholder.svg" alt="Ahoge Hakase Note" fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Hakase&apos;s Note</p>
                <p className="text-sm text-muted-foreground">
                  Remember, Server Components are not a replacement for Client Components. They&apos;re a new tool in
                  our toolbox that we can use when appropriate!
                </p>
              </div>
            </div>
          </div>

          <h2>Understanding the Basics</h2>
          <p>
            Let&apos;s start with a simple example of how Server Components work in practice. Here&apos;s a basic
            implementation:
          </p>

          <pre className="relative rounded-lg bg-muted p-4">
            <code className="language-typescript">
              {`// app/page.tsx
export default async function Page() {
  const data = await getData()
  return <h1>{data.title}</h1>
}`}
            </code>
          </pre>

          <h2>Key Benefits</h2>
          <ul>
            <li>Reduced client-side JavaScript</li>
            <li>Improved initial page load</li>
            <li>Better SEO performance</li>
            <li>Automatic code splitting</li>
          </ul>

          <div className="not-prose my-8 grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Client Components</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Interactive features</li>
                <li>Client-side state</li>
                <li>Browser APIs</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Server Components</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Data fetching</li>
                <li>Backend resources</li>
                <li>Sensitive information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mt-12">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">React</Badge>
              <Badge variant="outline">Next.js</Badge>
              <Badge variant="outline">Web Development</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Share on Twitter</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Share on Facebook</span>
              </Button>
              <Button variant="ghost" size="icon">
                <Link2 className="h-4 w-4" />
                <span className="sr-only">Copy link</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Next article</p>
              <p className="text-xl font-semibold">Building Beautiful Animations with Framer Motion</p>
            </div>
            <Button className="sm:flex-none">Read Next</Button>
          </div>
        </div>
      </footer>
    </article>
  )
}

