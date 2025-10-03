'use client'

import { useEffect } from 'react'
import { AlertCircle, Home, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="container max-w-screen-2xl min-h-[60vh] flex items-center justify-center py-12">
      <div className="text-center space-y-6 max-w-lg">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Something went wrong!</h1>
          <p className="text-muted-foreground">
            We're sorry, but something unexpected happened. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error details (dev only)
              </summary>
              <pre className="mt-2 text-xs bg-muted p-4 rounded-md overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-accent transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

