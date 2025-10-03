'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface SparklineData {
  t: string  // timestamp
  v: number  // priceChangePct
  r: number  // riskScore
}

interface AssetSparklineProps {
  data: SparklineData[]
}

export default function AssetSparkline({ data }: AssetSparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 w-full rounded-lg border bg-white flex items-center justify-center text-gray-400">
        暂无图表数据
      </div>
    )
  }

  // 反转数据（从旧到新）
  const chartData = [...data].reverse().map((d, index) => ({
    index: index + 1,
    time: new Date(d.t).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    priceChangePct: d.v,
    riskScore: d.r
  }))

  return (
    <div className="h-96 w-full rounded-lg border bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="index"
            label={{ value: '信号序号', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            yAxisId="left"
            label={{ value: '价格变化 %', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: '风险评分', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="text-sm font-medium">{payload[0].payload.time}</p>
                    <p className="text-sm text-green-600">
                      价格变化: {Number(payload[0].value).toFixed(2)}%
                    </p>
                    <p className="text-sm text-orange-600">
                      风险评分: {Number(payload[1].value).toFixed(0)}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="priceChangePct"
            stroke="#10b981"
            name="价格变化 %"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="riskScore"
            stroke="#f97316"
            name="风险评分"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


