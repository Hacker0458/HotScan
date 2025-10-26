'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface VolumeChartProps {
  data: Array<{
    timestamp: string | Date
    volume: number
    price?: number
  }>
  symbol?: string
}

export function VolumeChart({ data, symbol = 'Asset' }: VolumeChartProps) {
  const chartData = useMemo(() => {
    const avgVolume = data.reduce((sum, item) => sum + item.volume, 0) / data.length
    
    return data.map((item, index) => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      volume: item.volume,
      isAboveAvg: item.volume > avgVolume,
      priceChange: index > 0 ? item.price && data[index - 1].price 
        ? item.price > data[index - 1].price! 
        : true : true
    }))
  }, [data])

  const totalVolume = useMemo(() => 
    data.reduce((sum, item) => sum + item.volume, 0),
    [data]
  )

  const avgVolume = useMemo(() => 
    totalVolume / data.length,
    [totalVolume, data.length]
  )

  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
    return value.toFixed(2)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{symbol} Volume</h3>
          <p className="text-sm text-muted-foreground">
            Total: ${formatVolume(totalVolume)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">
            ${formatVolume(avgVolume)}
          </div>
          <div className="text-xs text-muted-foreground">Average</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            opacity={0.5}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={formatVolume}
            stroke="currentColor"
            opacity={0.5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`$${formatVolume(value)}`, 'Volume']}
          />
          <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.priceChange 
                  ? 'rgb(16, 185, 129)' 
                  : 'rgb(244, 63, 94)'
                }
                opacity={entry.isAboveAvg ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: 'rgb(16, 185, 129)' }} />
          <span>Price Up</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: 'rgb(244, 63, 94)' }} />
          <span>Price Down</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-current opacity-60" />
          <span>Below Average</span>
        </div>
      </div>
    </div>
  )
}

