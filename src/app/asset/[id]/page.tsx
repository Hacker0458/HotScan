import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AssetSparkline from './sparkline'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function AssetDetailPage({ params }: PageProps) {
  const id = params.id

  // 获取资产信息
  const asset = await prisma.asset.findUnique({
    where: { id }
  })

  if (!asset) {
    return notFound()
  }

  // 获取最近 50 条信号
  const signals = await prisma.signal.findMany({
    where: { assetId: id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      createdAt: true,
      priceChangePct: true,
      riskScore: true,
      window: true,
      sentiment: true,
      aiSummary: true,
      currentPrice: true,
      totalLiquidityUSD: true
    }
  })

  // 准备图表数据
  const chartData = signals.map(s => ({
    t: s.createdAt.toISOString(),
    v: s.priceChangePct,
    r: s.riskScore
  }))

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← 返回首页
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* 资产信息 */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">{asset.symbol}</h1>
            <Badge variant="outline">{asset.chain}</Badge>
          </div>
          <p className="text-gray-600 mt-2">{asset.name}</p>
        </div>

        {/* 价格趋势图 */}
        {chartData.length > 0 ? (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">价格变化趋势（最近 {signals.length} 条信号）</h2>
            <AssetSparkline data={chartData} />
          </section>
        ) : (
          <div className="text-center py-12 text-gray-500">
            暂无信号数据
          </div>
        )}

        {/* 最近信号列表 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">最近 10 条信号</h2>
          
          {signals.length > 0 ? (
            <div className="space-y-3">
              {signals.slice(0, 10).map((signal) => {
                const isPositive = signal.priceChangePct >= 0
                const riskColor = 
                  signal.riskScore >= 70 ? 'destructive' :
                  signal.riskScore >= 50 ? 'default' :
                  'secondary'

                return (
                  <div 
                    key={signal.id} 
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {signal.window}
                        </Badge>
                        <span className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{signal.priceChangePct.toFixed(2)}%
                        </span>
                        <Badge variant={riskColor}>
                          风险: {signal.riskScore.toFixed(0)}/100
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(signal.createdAt).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    {signal.aiSummary && (
                      <p className="text-sm text-gray-700 mt-2">
                        💡 {signal.aiSummary}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      {signal.currentPrice > 0 && (
                        <span>价格: ${signal.currentPrice}</span>
                      )}
                      {signal.totalLiquidityUSD > 0 && (
                        <span>
                          流动性: ${(signal.totalLiquidityUSD / 1000000).toFixed(2)}M
                        </span>
                      )}
                      <span>情绪: {signal.sentiment}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              暂无信号数据
            </div>
          )}
        </section>

        {/* 底部操作 */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline" size="lg">
              返回首页查看更多资产
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
