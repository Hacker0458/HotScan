'use client'

import { RefreshCcw, AlertCircle, CheckCircle, Database } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface StatusBarProps {
  total: number
  lastUpdate: string | Date | null
  isRefreshing?: boolean
  error?: string | null
  onRetry?: () => void
}

export default function StatusBar({
  total,
  lastUpdate,
  isRefreshing = false,
  error = null,
  onRetry,
}: StatusBarProps) {
  const updateTime = lastUpdate
    ? formatDistanceToNow(new Date(lastUpdate), { addSuffix: true })
    : 'Never'
  
  return (
    <div className="border-b bg-muted/30">
      <div className="container max-w-screen-2xl py-3 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Left side - Status */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {isRefreshing ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-muted-foreground">Refreshing...</span>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">Failed to load</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">
                    Updated {updateTime}
                  </span>
                </>
              )}
            </div>
            
            <div className="h-4 w-px bg-border" aria-hidden="true" />
            
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{total}</span>
              <span className="text-muted-foreground">signals</span>
            </div>
          </div>
          
          {/* Right side - Data source */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              Data from{' '}
              <a
                href="https://dexscreener.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                DexScreener
              </a>
            </span>
            {error && onRetry && (
              <button
                onClick={onRetry}
                className="text-primary hover:underline font-medium"
                aria-label="Retry loading data"
              >
                Retry
              </button>
            )}
          </div>
        </div>
        
        {/* Error banner */}
        {error && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm">
            <p className="text-destructive font-medium">Error: {error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-destructive hover:underline text-xs"
              >
                Click to retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

