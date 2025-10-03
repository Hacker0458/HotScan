'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

interface Signal {
  id: string
  assetId: string
  window: string
  priceChangePct: number
  currentPrice: number
  totalLiquidityUSD: number
  riskScore: number
  sentiment: string
  createdAt: string
  asset: {
    id: string
    symbol: string
    name: string
    chain: string
    logo?: string | null
  }
  pair?: {
    id: string
    priceUsd?: number | null
    priceChange1h?: number | null
    priceChange24h?: number | null
    liquidityUSD: number
    volumeH24?: number | null
    fdv?: number | null
    dexId: string
    chainId?: string | null
  } | null
}

interface SignalCardProps {
  signal: Signal
  sparklineData?: number[]
}

function formatLiquidity(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

function formatPrice(value?: number | null): string {
  if (!value) return 'N/A'
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`
  }
  if (value >= 1) {
    return `$${value.toFixed(4)}`
  }
  if (value >= 0.0001) {
    return `$${value.toFixed(6)}`
  }
  return `$${value.toExponential(2)}`
}

function getRiskBadge(score: number): { label: string; className: string } {
  if (score >= 60) {
    return { label: 'High', className: 'bg-red-500/10 text-red-500 border-red-500/20' }
  }
  if (score >= 40) {
    return { label: 'Med', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' }
  }
  return { label: 'Low', className: 'bg-green-500/10 text-green-500 border-green-500/20' }
}

function getPriceChangeIcon(pct: number) {
  if (pct > 0.5) return TrendingUp
  if (pct < -0.5) return TrendingDown
  return Minus
}

export default function SignalCard({ signal, sparklineData }: SignalCardProps) {
  const { asset, pair, priceChangePct, totalLiquidityUSD, riskScore, window } = signal
  const risk = getRiskBadge(riskScore)
  const PriceIcon = getPriceChangeIcon(priceChangePct)
  
  // Generate sparkline data from priceChangePct history
  const chartData = sparklineData
    ? sparklineData.map((v, i) => ({ i, v }))
    : [{ i: 0, v: 0 }]
  
  const priceColor = priceChangePct > 0 ? 'text-green-500' : priceChangePct < 0 ? 'text-red-500' : 'text-muted-foreground'
  
  // Use pair data if available
  const displayPrice = pair?.priceUsd
  const priceChange1h = pair?.priceChange1h
  const priceChange24h = pair?.priceChange24h
  const liquidity = pair?.liquidityUSD || totalLiquidityUSD
  
  const get1hColor = (val?: number | null) => val && val > 0 ? 'text-green-500' : val && val < 0 ? 'text-red-500' : 'text-muted-foreground'
  const get24hColor = (val?: number | null) => val && val > 0 ? 'text-green-500' : val && val < 0 ? 'text-red-500' : 'text-muted-foreground'
  
  return (
    <Link
      href={`/asset/${asset.id}`}
      className="block border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all group"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                {asset.symbol}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${risk.className}`}
                aria-label={`Risk: ${risk.label}`}
              >
                {risk.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {asset.name} · {asset.chain}
            </p>
            {displayPrice && (
              <p className="text-base font-semibold text-primary mt-1">
                {formatPrice(displayPrice)}
              </p>
            )}
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Δ 1h / 24h</div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${get1hColor(priceChange1h)}`}>
                {priceChange1h !== null && priceChange1h !== undefined 
                  ? `${priceChange1h > 0 ? '+' : ''}${priceChange1h.toFixed(2)}%`
                  : 'N/A'}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className={`text-xs ${get24hColor(priceChange24h)}`}>
                {priceChange24h !== null && priceChange24h !== undefined
                  ? `${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Liquidity</div>
            <div className="font-semibold">{formatLiquidity(liquidity)}</div>
          </div>
        </div>
        
        {/* Sparkline */}
        <div className="h-16 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={priceChangePct > 0 ? '#22c55e' : priceChangePct < 0 ? '#ef4444' : '#71717a'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Link>
  )
}

