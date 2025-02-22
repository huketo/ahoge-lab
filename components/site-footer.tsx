import Image from "next/image"
import Link from "next/link"
import { Github } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">© 2024 Ahoge Lab. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link
              href="https://bsky.app/profile/ahoge.moe"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <span className="sr-only">Bluesky</span>
              <Image src="/bluesky.svg" alt="Bluesky" width={20} height={20} className="h-5 w-5" />
            </Link>
            <Link
              href="https://github.com/huketo"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <span className="sr-only">GitHub</span>
              <Github className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

