'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface RiskRadarChartProps {
  data: {
    volatility: number // 0-100
    liquidity: number // 0-100
    volume: number // 0-100
    priceStability: number // 0-100
    marketCap: number // 0-100
  }
  symbol?: string
}

export function RiskRadarChart({ data, symbol = 'Asset' }: RiskRadarChartProps) {
  const chartData = [
    { metric: 'Volatility', value: data.volatility, fullMark: 100 },
    { metric: 'Liquidity', value: data.liquidity, fullMark: 100 },
    { metric: 'Volume', value: data.volume, fullMark: 100 },
    { metric: 'Price Stability', value: data.priceStability, fullMark: 100 },
    { metric: 'Market Cap', value: data.marketCap, fullMark: 100 },
  ]

  // Calculate overall risk score (inverse of average)
  const avgScore = Object.values(data).reduce((sum, val) => sum + val, 0) / Object.values(data).length
  const riskScore = 100 - avgScore
  const riskLevel = riskScore >= 60 ? 'High Risk' : riskScore >= 40 ? 'Medium Risk' : 'Low Risk'
  const riskColor = riskScore >= 60 ? 'text-rose-600' : riskScore >= 40 ? 'text-yellow-600' : 'text-emerald-600'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{symbol} Risk Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Multi-dimensional risk assessment
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${riskColor}`}>
            {riskScore.toFixed(0)}/100
          </div>
          <div className="text-xs text-muted-foreground">{riskLevel}</div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="currentColor" opacity={0.2} />
          <PolarAngleAxis 
            dataKey="metric" 
            tick={{ fontSize: 12, fill: 'currentColor' }}
            stroke="currentColor"
            opacity={0.5}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
            stroke="currentColor"
            opacity={0.5}
          />
          <Radar
            name={symbol}
            dataKey="value"
            stroke="rgb(59, 130, 246)"
            fill="rgb(59, 130, 246)"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value}/100`, 'Score']}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>

      {/* Risk Factors Breakdown */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {Object.entries(data).map(([key, value]) => {
          const displayName = key.replace(/([A-Z])/g, ' $1').trim()
          const displayNameCapitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1)
          const barColor = value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-yellow-500' : 'bg-rose-500'
          
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{displayNameCapitalized}</span>
                <span className="font-semibold">{value}/100</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-500`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Risk Interpretation */}
      <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
        <p className="font-semibold mb-1">Risk Assessment Guide:</p>
        <ul className="space-y-1">
          <li>• <span className="text-emerald-600">Low Risk (0-39)</span>: Stable, high liquidity, low volatility</li>
          <li>• <span className="text-yellow-600">Medium Risk (40-59)</span>: Moderate fluctuation, acceptable liquidity</li>
          <li>• <span className="text-rose-600">High Risk (60-100)</span>: High volatility, low liquidity, risky</li>
        </ul>
      </div>
    </div>
  )
}

