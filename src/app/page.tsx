'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import type { Metadata } from 'next'
import SignalCard from '@/components/SignalCard'
import FilterBar, { FilterState } from '@/components/FilterBar'
import StatusBar from '@/components/StatusBar'
import { SignalListSkeleton } from '@/components/ui/skeleton'
import { NoSignalsState, ErrorState } from '@/components/ui/empty-state'
import { ChevronDown } from 'lucide-react'

interface Signal {
  id: string
  assetId: string
  window: string
  priceChangePct: number
  riskScore: number
  totalLiquidityUSD: number
  volumeUSD: number
  currentPrice: number
  sentiment: string
  aiSummary: string
  createdAt: string
  asset: {
    id: string
    symbol: string
    name: string
    chain: string
    logo?: string | null
  }
}

interface SignalsResponse {
  success: boolean
  data: Signal[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
    generatedAt?: string
  }
}

const fetcher = async (url: string): Promise<SignalsResponse> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout
  
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    
    return res.json()
  } catch (error: any) {
    clearTimeout(timeout)
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

const REFRESH_INTERVAL = parseInt(process.env.NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS || '30000')
const DEFAULT_LIMIT = 18

export default function HomePage() {
  const [offset, setOffset] = useState(0)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    window: 'all',
    minLiquidity: 0,
    minRisk: 0,
    sortBy: 'risk',
    sortOrder: 'desc',
  })

  // Build API URL based on filters
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams({
      limit: DEFAULT_LIMIT.toString(),
      offset: offset.toString(),
    })
    
    if (filters.window !== 'all') {
      params.set('window', filters.window)
    }
    
    return `/api/signals?${params.toString()}`
  }, [offset, filters.window])

  const { data, error, isLoading, isValidating, mutate } = useSWR<SignalsResponse>(
    apiUrl,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 2000,
    }
  )

  // Client-side filtering and sorting
  const filteredSignals = useMemo(() => {
    let signals = data?.data || []
    
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      signals = signals.filter(
        (s) =>
          s.asset.symbol.toLowerCase().startsWith(search) ||
          s.asset.name.toLowerCase().includes(search)
      )
    }
    
    // Liquidity filter
    if (filters.minLiquidity > 0) {
      signals = signals.filter((s) => s.totalLiquidityUSD >= filters.minLiquidity)
    }
    
    // Risk filter
    if (filters.minRisk > 0) {
      signals = signals.filter((s) => s.riskScore >= filters.minRisk)
    }
    
    // Sort
    signals = [...signals].sort((a, b) => {
      let aVal = 0
      let bVal = 0
      
      switch (filters.sortBy) {
        case 'risk':
          aVal = a.riskScore
          bVal = b.riskScore
          break
        case 'price':
          aVal = Math.abs(a.priceChangePct)
          bVal = Math.abs(b.priceChangePct)
          break
        case 'liquidity':
          aVal = a.totalLiquidityUSD
          bVal = b.totalLiquidityUSD
          break
      }
      
      return filters.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
    
    return signals
  }, [data, filters])

  const handleLoadMore = () => {
    setOffset((prev) => prev + DEFAULT_LIMIT)
  }

  const handleRetry = () => {
    setOffset(0)
    mutate()
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setOffset(0)
  }

  return (
    <div className="min-h-screen">
      {/* Status Bar */}
      <StatusBar
        total={data?.meta?.total || 0}
        lastUpdate={data?.meta?.generatedAt || null}
        isRefreshing={isValidating}
        error={error?.message || null}
        onRetry={handleRetry}
      />

      <div className="container max-w-screen-2xl py-6 px-4 space-y-6">
        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          resultCount={filteredSignals.length}
        />

        {/* Signals Grid */}
        {isLoading && !data ? (
          <SignalListSkeleton count={DEFAULT_LIMIT} />
        ) : error ? (
          <ErrorState onRetry={handleRetry} message={error.message} />
        ) : filteredSignals.length === 0 ? (
          <NoSignalsState onRetry={handleRetry} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSignals.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  sparklineData={[signal.priceChangePct, signal.priceChangePct * 1.1, signal.priceChangePct * 0.9]}
                />
              ))}
            </div>

            {/* Load More */}
            {data?.meta?.hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading || isValidating}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Load more signals"
                >
                  {isLoading || isValidating ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      <span>Load More</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
