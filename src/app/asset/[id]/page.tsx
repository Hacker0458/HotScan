import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: {
    id: string
  }
}

async function getAssetDetails(id: string) {
  try {
    const signal = await prisma.signal.findFirst({
      where: { assetId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        asset: true,
      },
    })

    return signal
  } catch (error) {
    console.error('Error fetching asset:', error)
    return null
  }
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

export default async function AssetDetailPage({ params }: PageProps) {
  const signal = await getAssetDetails(params.id)

  if (!signal) {
    return (
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto" />
            <h1 className="text-3xl font-bold">暂未找到该资产</h1>
            <p className="text-muted-foreground">
              该资产可能尚未被追踪，或信号数据正在生成中。
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回首页
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 解析 AI 摘要
  let aiSummary = { cn: '', en: '' }
  try {
    aiSummary = JSON.parse(signal.aiSummary || '{}')
  } catch (e) {
    aiSummary = { cn: '暂无AI解读', en: 'No AI summary available' }
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* 资产标题 */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{signal.asset.name}</h1>
            <Badge className={getRiskColor(signal.riskScore)}>
              {getRiskLabel(signal.riskScore)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="font-mono text-lg font-semibold">{signal.asset.symbol}</span>
            <Badge variant="outline">{signal.asset.chain}</Badge>
            <Badge variant="outline">{signal.window}</Badge>
          </div>
        </div>

        {/* 关键指标 */}
        <Card>
          <CardHeader>
            <CardTitle>关键指标</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricItem 
                label="价格变化" 
                value={`${signal.priceChangePct > 0 ? '+' : ''}${signal.priceChangePct.toFixed(2)}%`}
                color={signal.priceChangePct > 0 ? 'text-green-500' : 'text-red-500'}
              />
              <MetricItem 
                label="成交量Z值" 
                value={`${signal.volZScore.toFixed(1)}σ`}
              />
              <MetricItem 
                label="流动性变化" 
                value={`${signal.liqDeltaPct > 0 ? '+' : ''}${signal.liqDeltaPct.toFixed(1)}%`}
              />
              <MetricItem 
                label="前5持仓占比" 
                value={`${signal.top5HoldPct.toFixed(1)}%`}
              />
              <MetricItem 
                label="合约年龄" 
                value={`${signal.contractAgeDays}天`}
              />
              <MetricItem 
                label="风险评分" 
                value={`${signal.riskScore}/100`}
                color={signal.riskScore >= 50 ? 'text-red-500' : 'text-green-500'}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI 解读 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI 解读
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">中文解读</div>
              <p className="text-base leading-relaxed">{aiSummary.cn}</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">English Summary</div>
              <p className="text-base leading-relaxed text-muted-foreground">{aiSummary.en}</p>
            </div>
          </CardContent>
        </Card>

        {/* 免责声明 */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            ⚠️ 本页面仅展示链上数据分析结果，不构成投资建议。加密货币投资存在极高风险，请谨慎决策。
          </p>
        </div>
      </div>
    </div>
  )
}

function MetricItem({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold ${color || ''}`}>{value}</div>
    </div>
  )
}

