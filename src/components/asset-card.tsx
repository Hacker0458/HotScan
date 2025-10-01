import Link from 'next/link'
import { TrendingUp, TrendingDown, Volume2, AlertTriangle, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AssetCardProps {
  id: string
  symbol: string
  name: string
  type: 'stock' | 'crypto'
  price: number
  change24h: number
  volume24h?: number
  trendScore?: number
  riskLevel?: 'low' | 'medium' | 'high'
  sentiment?: 'bullish' | 'bearish' | 'neutral'
}

export function AssetCard({
  id,
  symbol,
  name,
  type,
  price,
  change24h,
  volume24h,
  trendScore = 50,
  riskLevel = 'medium',
  sentiment = 'neutral',
}: AssetCardProps) {
  const isPositive = change24h >= 0
  const volumeIntensity = getVolumeIntensity(volume24h)

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50">
      <CardContent className="p-4">
        {/* 顶部：名称和类型 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold truncate">{symbol}</h3>
              <Badge variant="outline" className="text-xs">
                {type === 'stock' ? '股票' : '加密'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{name}</p>
          </div>

          {/* 风险等级徽章 */}
          <Badge
            variant="outline"
            className={cn(
              'ml-2 flex-shrink-0',
              riskLevel === 'high' && 'border-red-500/50 text-red-600 dark:text-red-400',
              riskLevel === 'medium' && 'border-yellow-500/50 text-yellow-600 dark:text-yellow-400',
              riskLevel === 'low' && 'border-green-500/50 text-green-600 dark:text-green-400'
            )}
          >
            {riskLevel === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
            {riskLevel === 'high' ? '高风险' : riskLevel === 'medium' ? '中风险' : '低风险'}
          </Badge>
        </div>

        {/* 价格和涨跌幅 */}
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-2xl font-bold">${price.toLocaleString()}</span>
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-semibold',
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{isPositive ? '+' : ''}{change24h.toFixed(2)}%</span>
          </div>
        </div>

        {/* 成交量强度和热度 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">成交量</span>
            <Badge
              variant="secondary"
              className={cn(
                'text-xs',
                volumeIntensity === 'high' && 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                volumeIntensity === 'medium' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                volumeIntensity === 'low' && 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              )}
            >
              {volumeIntensity === 'high' ? '高' : volumeIntensity === 'medium' ? '中' : '低'}
            </Badge>
          </div>

          {/* 热度分数 */}
          <div className="flex items-center gap-1">
            <div className="flex h-1 w-12 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  'h-full transition-all',
                  trendScore >= 75 ? 'bg-red-500' : trendScore >= 50 ? 'bg-orange-500' : 'bg-yellow-500'
                )}
                style={{ width: `${trendScore}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{trendScore}</span>
          </div>
        </div>

        {/* 情绪指标 */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">市场情绪</span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                sentiment === 'bullish' && 'border-green-500/50 text-green-600 dark:text-green-400',
                sentiment === 'bearish' && 'border-red-500/50 text-red-600 dark:text-red-400',
                sentiment === 'neutral' && 'border-gray-500/50 text-gray-600 dark:text-gray-400'
              )}
            >
              {sentiment === 'bullish' ? '看涨' : sentiment === 'bearish' ? '看跌' : '中性'}
            </Badge>
          </div>

          {/* 进入详情按钮 */}
          <Button asChild size="sm" variant="ghost" className="group-hover:text-primary">
            <Link href={`/asset/${id}`}>
              详情
              <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// 计算成交量强度
function getVolumeIntensity(volume?: number): 'low' | 'medium' | 'high' {
  if (!volume) return 'low'
  if (volume > 1000000000) return 'high'
  if (volume > 100000000) return 'medium'
  return 'low'
}
