'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Zap, 
  Share2,
  AlertCircle,
  TrendingDown,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssetDetailInfoProps {
  asset: {
    symbol: string
    name: string
    type: string
    price: number
    change24h: number
    volume24h?: number
    marketCap?: number
  }
  signal?: {
    title: string
    summary: string
    content: string
    sentiment: string
    confidence: number
    impact: string
    keyPoints: string[]
  }
}

export function AssetDetailInfo({ asset, signal }: AssetDetailInfoProps) {
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false)
  const isPositive = asset.change24h >= 0

  const handleGeneratePoster = async () => {
    setIsGeneratingPoster(true)
    // TODO: 实现海报生成逻辑
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGeneratingPoster(false)
  }

  return (
    <div className="space-y-4">
      {/* 关键指标栅格 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            关键指标
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* 当前价格 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>当前价格</span>
              </div>
              <div className="text-2xl font-bold">
                ${asset.price.toLocaleString()}
              </div>
            </div>

            {/* 24h 涨跌幅 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>24h 涨跌</span>
              </div>
              <div
                className={cn(
                  'text-2xl font-bold',
                  isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                {isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%
              </div>
            </div>

            {/* 24h 成交量 */}
            {asset.volume24h && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  <span>24h 成交量</span>
                </div>
                <div className="text-lg font-semibold">
                  ${formatLargeNumber(asset.volume24h)}
                </div>
              </div>
            )}

            {/* 市值 */}
            {asset.marketCap && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  <span>市值</span>
                </div>
                <div className="text-lg font-semibold">
                  ${formatLargeNumber(asset.marketCap)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI 摘要和分析 */}
      {signal && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                AI 智能解读
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    signal.sentiment === 'bullish' && 'border-green-500/50 text-green-600 dark:text-green-400',
                    signal.sentiment === 'bearish' && 'border-red-500/50 text-red-600 dark:text-red-400',
                    signal.sentiment === 'neutral' && 'border-gray-500/50'
                  )}
                >
                  {signal.sentiment === 'bullish' ? '看涨' : signal.sentiment === 'bearish' ? '看跌' : '中性'}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  信心 {(signal.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 标题 */}
            <div>
              <h3 className="text-xl font-bold mb-2">{signal.title}</h3>
              <p className="text-muted-foreground">{signal.summary}</p>
            </div>

            <Separator />

            {/* 中英文切换 Tabs */}
            <Tabs defaultValue="zh" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="zh">中文</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              
              <TabsContent value="zh" className="space-y-4 mt-4">
                {/* 详细分析 */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed">{signal.content}</p>
                </div>

                {/* 关键要点 */}
                {signal.keyPoints.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">关键要点</h4>
                    <ul className="space-y-2">
                      {signal.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {index + 1}
                          </span>
                          <span className="flex-1">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="en" className="space-y-4 mt-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    English translation coming soon...
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />

            {/* 风险提示 */}
            <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                以上分析仅供参考，不构成投资建议。投资有风险，决策需谨慎。
              </p>
            </div>

            {/* 生成海报按钮 */}
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleGeneratePoster}
                disabled={isGeneratingPoster}
              >
                <Share2 className="mr-2 h-4 w-4" />
                {isGeneratingPoster ? '生成中...' : '生成分享海报'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// 格式化大数字
function formatLargeNumber(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T'
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
  return num.toFixed(2)
}
