'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface AssetData {
  symbol: string
  color: string
  data: Array<{
    timestamp: string | Date
    price: number
  }>
}

interface MultiAssetCompareProps {
  assets: AssetData[]
}

const COLORS = [
  'rgb(59, 130, 246)',  // blue
  'rgb(16, 185, 129)',  // green
  'rgb(244, 63, 94)',   // rose
  'rgb(251, 191, 36)',  // yellow
  'rgb(168, 85, 247)',  // purple
  'rgb(236, 72, 153)',  // pink
]

export function MultiAssetCompare({ assets }: MultiAssetCompareProps) {
  // Normalize prices to percentage change from first data point
  const chartData = useMemo(() => {
    if (assets.length === 0) return []
    
    // Get all unique timestamps
    const timestamps = new Set<number>()
    assets.forEach(asset => {
      asset.data.forEach(point => {
        timestamps.add(new Date(point.timestamp).getTime())
      })
    })
    
    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b)
    
    // Build chart data
    return sortedTimestamps.map(ts => {
      const dataPoint: any = {
        time: new Date(ts).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      
      assets.forEach(asset => {
        // Find closest data point
        const closestPoint = asset.data.reduce((prev, curr) => {
          const prevDiff = Math.abs(new Date(prev.timestamp).getTime() - ts)
          const currDiff = Math.abs(new Date(curr.timestamp).getTime() - ts)
          return currDiff < prevDiff ? curr : prev
        })
        
        // Calculate percentage change from first price
        const firstPrice = asset.data[0].price
        const pctChange = ((closestPoint.price - firstPrice) / firstPrice) * 100
        
        dataPoint[asset.symbol] = pctChange
      })
      
      return dataPoint
    })
  }, [assets])

  // Calculate performance stats
  const stats = useMemo(() => {
    return assets.map(asset => {
      if (asset.data.length < 2) {
        return { symbol: asset.symbol, change: 0, color: asset.color }
      }
      
      const firstPrice = asset.data[0].price
      const lastPrice = asset.data[asset.data.length - 1].price
      const change = ((lastPrice - firstPrice) / firstPrice) * 100
      
      return {
        symbol: asset.symbol,
        change,
        color: asset.color
      }
    }).sort((a, b) => b.change - a.change)
  }, [assets])

  if (assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No assets to compare
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Multi-Asset Comparison</h3>
        <p className="text-sm text-muted-foreground">
          Percentage change from initial price
        </p>
      </div>

      {/* Performance Leaderboard */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div
            key={stat.symbol}
            className="rounded-lg border p-3 relative overflow-hidden"
          >
            {/* Rank Badge */}
            {index < 3 && (
              <div className={`absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-yellow-500 text-white' :
                index === 1 ? 'bg-gray-400 text-white' :
                'bg-amber-700 text-white'
              }`}>
                {index + 1}
              </div>
            )}
            
            {/* Symbol */}
            <div className="text-sm font-semibold mb-1">{stat.symbol}</div>
            
            {/* Change */}
            <div className={`text-2xl font-bold ${
              stat.change >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(2)}%
            </div>
            
            {/* Color Indicator */}
            <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: stat.color }} />
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            opacity={0.5}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`}
            stroke="currentColor"
            opacity={0.5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value.toFixed(2)}%`, '']}
          />
          <Legend />
          {assets.map((asset, index) => (
            <Line
              key={asset.symbol}
              type="monotone"
              dataKey={asset.symbol}
              stroke={asset.color || COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              name={asset.symbol}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="text-xs text-muted-foreground text-center">
        💡 All assets normalized to 0% at start for easy comparison
      </div>
    </div>
  )
}

