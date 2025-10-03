import Link from 'next/link'
import { Home, Search } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="container max-w-screen-2xl min-h-[60vh] flex items-center justify-center py-12">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-accent transition-colors"
          >
            <Search className="h-4 w-4" />
            Learn More
          </Link>
        </div>
      </div>
    </div>
  )
}
