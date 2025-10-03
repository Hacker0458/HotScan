'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface Signal {
  id: string
  assetId: string
  window: string
  priceChangePct: number
  riskScore: number
  totalLiquidityUSD: number
  volumeUSD: number
  aiSummary: string
  createdAt: string
  asset: {
    id: string
    symbol: string
    name: string
    chain: string
    logo?: string
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
    generatedAt: string
  }
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

const REFRESH_INTERVAL = parseInt(process.env.NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS || '30000')
const SIGNAL_WINDOW = process.env.NEXT_PUBLIC_SIGNAL_WINDOW_DEFAULT || '1h'

export default function HomePage() {
  const [offset, setOffset] = useState(0)
  const limit = 20

  const { data, error, isLoading, mutate } = useSWR<SignalsResponse>(
    `/api/signals?limit=${limit}&offset=${offset}&window=${SIGNAL_WINDOW}`,
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: true,
      revalidateOnReconnect: true
    }
  )

  const signals = data?.data || []
  const meta = data?.meta

  const formatLiquidity = (usd: number) => {
    if (usd >= 1_000_000_000) return `$${(usd / 1_000_000_000).toFixed(1)}B`
    if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`
    if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`
    return `$${usd.toFixed(0)}`
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 生成迷你趋势线数据（模拟）
  const generateSparklineData = (priceChange: number) => {
    const points = 20
    const data = []
    const step = priceChange / points
    let current = 0
    
    for (let i = 0; i < points; i++) {
      current += step + (Math.random() - 0.5) * 0.5
      data.push({ value: current })
    }
    
    return data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-900">🔥 热点雷达</h1>
              <nav className="flex gap-4">
                <Link href="/" className="text-gray-900 font-medium">
                  今日热点
                </Link>
                <Link href="/learn" className="text-gray-600 hover:text-gray-900">
                  术语百科
                </Link>
                <Link href="/analytics" className="text-gray-600 hover:text-gray-900">
                  数据统计
                </Link>
              </nav>
            </div>
            <Button 
              onClick={() => mutate()} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              🔄 刷新
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 状态栏 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {meta ? (
              <span>
                上次更新: <span className="font-medium">{formatTime(meta.generatedAt)}</span>
                {' · '}
                共 <span className="font-bold text-gray-900">{meta.total}</span> 条信号
                {' · '}
                <Badge variant="outline" className="ml-2">
                  {SIGNAL_WINDOW} 窗口
                </Badge>
              </span>
            ) : (
              <Skeleton className="h-5 w-64" />
            )}
          </div>
          <div className="text-xs text-gray-500">
            自动刷新: {REFRESH_INTERVAL / 1000}s
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">❌ 加载失败</p>
            <p className="text-red-600 text-sm mt-1">{error.message || '网络错误，请稍后重试'}</p>
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && signals.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              当前无信号
            </h3>
            <p className="text-gray-600 mb-4">
              可能受限流/网络影响，或数据正在生成中
            </p>
            <Button onClick={() => mutate()} variant="outline">
              重新加载
            </Button>
          </div>
        )}

        {/* 信号卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading && !data ? (
            // 加载骨架屏
            Array.from({ length: limit }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-3" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            signals.map((signal) => {
              const isPositive = signal.priceChangePct >= 0
              const riskColor = 
                signal.riskScore >= 70 ? 'bg-red-500 text-white' :
                signal.riskScore >= 50 ? 'bg-orange-500 text-white' :
                'bg-green-500 text-white'
              
              const sparklineData = generateSparklineData(signal.priceChangePct)
              const strokeColor = isPositive ? '#10b981' : '#ef4444'

              return (
                <Link 
                  key={signal.id} 
                  href={`/asset/${signal.asset.id}`}
                  className="block transition-transform hover:scale-105"
                >
                  <Card className="h-full cursor-pointer hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                          {signal.asset.symbol}
                          <Badge variant="outline" className="text-xs font-normal">
                            {signal.asset.chain}
                          </Badge>
                        </CardTitle>
                        <Badge
                          className={cn(
                            "text-sm font-bold",
                            isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          )}
                        >
                          {isPositive ? '+' : ''}{signal.priceChangePct.toFixed(2)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{signal.asset.name}</p>
                    </CardHeader>
                    
                    <CardContent>
                      {/* 迷你趋势图 */}
                      <div className="h-16 mb-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sparklineData}>
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={strokeColor}
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* 关键指标 */}
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div>
                          <span className="text-gray-500">流动性</span>
                          <p className="font-bold text-gray-900">
                            {formatLiquidity(signal.totalLiquidityUSD)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">风险评分</span>
                          <p className="font-bold">
                            <Badge className={riskColor}>
                              {signal.riskScore.toFixed(0)}/100
                            </Badge>
                          </p>
                        </div>
                      </div>

                      {/* AI 摘要 */}
                      {signal.aiSummary && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          💡 {signal.aiSummary}
                        </p>
                      )}

                      {/* 更新时间 */}
                      <div className="text-xs text-gray-400 flex items-center justify-between">
                        <span>{new Date(signal.createdAt).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        <span className="text-blue-600 hover:underline">
                          查看详情 →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          )}
        </div>

        {/* 分页 */}
        {meta && meta.hasMore && (
          <div className="mt-8 text-center">
            <Button 
              onClick={() => setOffset(offset + limit)}
              variant="outline"
              disabled={isLoading}
            >
              加载更多
            </Button>
          </div>
        )}

        {/* 底部免责声明 */}
        <div className="mt-12 text-center text-xs text-gray-500">
          <p>⚠️ 非投资建议 · 仅供参考 · 高风险市场请谨慎</p>
          <div className="mt-2">
            <Link href="/legal/terms" className="hover:underline">
              使用条款
            </Link>
            {' · '}
            <Link href="/legal/privacy" className="hover:underline">
              隐私政策
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
