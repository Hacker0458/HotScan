'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface PriceTrendChartProps {
  data: Array<{
    timestamp: string | Date
    price: number
    volume?: number
  }>
  symbol?: string
  showVolume?: boolean
}

export function PriceTrendChart({ data, symbol = 'Asset', showVolume = false }: PriceTrendChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      price: item.price,
      volume: item.volume || 0
    }))
  }, [data])

  const minPrice = useMemo(() => Math.min(...data.map(d => d.price)), [data])
  const maxPrice = useMemo(() => Math.max(...data.map(d => d.price)), [data])
  const priceChange = data.length >= 2 
    ? ((data[data.length - 1].price - data[0].price) / data[0].price) * 100 
    : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{symbol} Price Trend</h3>
          <p className="text-sm text-muted-foreground">
            Range: ${minPrice.toFixed(6)} - ${maxPrice.toFixed(6)}
          </p>
        </div>
        <div className={`text-right ${priceChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          <div className="text-2xl font-bold">
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
          <div className="text-xs text-muted-foreground">Period Change</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            opacity={0.5}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(6)}`}
            stroke="currentColor"
            opacity={0.5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [
              name === 'price' ? `$${value.toFixed(6)}` : value.toLocaleString(),
              name === 'price' ? 'Price' : 'Volume'
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke={priceChange >= 0 ? 'rgb(16, 185, 129)' : 'rgb(244, 63, 94)'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            name="Price"
          />
          {showVolume && (
            <Line
              type="monotone"
              dataKey="volume"
              stroke="rgb(59, 130, 246)"
              strokeWidth={2}
              dot={false}
              name="Volume"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

