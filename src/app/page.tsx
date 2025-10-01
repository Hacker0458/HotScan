import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, AlertTriangle, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'

async function getRecentSignals() {
  const signals = await prisma.signal.findMany({
    orderBy: [
      { createdAt: 'desc' },
      { riskScore: 'desc' },
    ],
    take: 12,
    include: {
      asset: {
        select: {
          id: true,
          symbol: true,
          name: true,
          chain: true,
        },
      },
    },
  })

  return signals
}

function getRiskColor(score: number) {
  if (score >= 70) return 'bg-red-500 text-white'
  if (score >= 50) return 'bg-orange-500 text-white'
  if (score >= 30) return 'bg-yellow-500 text-black'
  return 'bg-green-500 text-white'
}

function getRiskLabel(score: number) {
  if (score >= 70) return '极高风险'
  if (score >= 50) return '高风险'
  if (score >= 30) return '中风险'
  return '低风险'
}

export default async function HomePage() {
  const signals = await getRecentSignals()

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">HotScan｜热点雷达</h1>
        </div>
        <p className="text-muted-foreground">
          AI驱动的加密资产热点分析平台，实时追踪交易信号与风险指标
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {signals.map((signal) => (
          <Card key={signal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {signal.asset.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span className="font-mono font-semibold">{signal.asset.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {signal.asset.chain}
                    </Badge>
                  </div>
                </div>
                <Badge className={getRiskColor(signal.riskScore)}>
                  {getRiskLabel(signal.riskScore)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 价格变化 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">价格变化</span>
                <span className={`font-semibold ${
                  signal.priceChangePct > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {signal.priceChangePct > 0 ? '+' : ''}{signal.priceChangePct.toFixed(2)}%
                </span>
              </div>

              {/* 成交量异常 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">成交量Z值</span>
                <span className="font-semibold">{signal.volZScore.toFixed(1)}σ</span>
              </div>

              {/* 流动性变化 */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">流动性变化</span>
                <span className={`font-semibold ${
                  signal.liqDeltaPct > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {signal.liqDeltaPct > 0 ? '+' : ''}{signal.liqDeltaPct.toFixed(1)}%
                </span>
              </div>

              {/* 风险指标 */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    窗口: {signal.window} | 合约: {signal.contractAgeDays}天
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    前5持有: {signal.top5HoldPct.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    新钱包净买: ${(signal.newWalletNetBuy / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>

              {/* AI摘要（如果有） */}
              {signal.aiSummary && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {typeof signal.aiSummary === 'string' 
                      ? signal.aiSummary 
                      : (signal.aiSummary as any).cn || JSON.stringify(signal.aiSummary)
                    }
                  </p>
                </div>
              )}

              {/* 详情按钮 */}
              <Button asChild className="w-full mt-4">
                <Link href={`/asset/${signal.asset.id}`}>
                  查看详情
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {signals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无交易信号数据</p>
          <p className="text-sm text-muted-foreground mt-2">
            请稍后再试，或运行种子脚本导入示例数据
          </p>
        </div>
      )}
    </div>
  )
}
