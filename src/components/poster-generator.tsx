'use client'

/**
 * 9:16 竖版海报生成器
 * 
 * 使用Canvas绘制专业的金融资产海报
 */

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Share2, Loader2 } from 'lucide-react'

export interface PosterData {
  // 基础信息
  symbol: string
  name: string
  
  // 英文短标题
  englishTitle: string
  
  // 核心指标
  priceChangePct: number
  riskScore: number
  window: string
  currentPrice: number
  
  // 可选：K线数据
  candleData?: Array<{
    timestamp: Date
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
  
  // 风险等级
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}

interface PosterGeneratorProps {
  data: PosterData
  onShare?: (imageUrl: string) => void
}

export function PosterGenerator({ data, onShare }: PosterGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')

  useEffect(() => {
    generatePoster()
  }, [data])

  /**
   * 生成海报
   */
  const generatePoster = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 9:16 比例
    const width = 1080
    const height = 1920
    canvas.width = width
    canvas.height = height

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制渐变背景
    drawGradientBackground(ctx, width, height)

    // 绘制内容
    await drawPosterContent(ctx, width, height, data)

    // 生成图片URL
    const url = canvas.toDataURL('image/png', 1.0)
    setImageUrl(url)
  }

  /**
   * 绘制渐变背景
   */
  const drawGradientBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // 深色渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#0f172a')  // slate-900
    gradient.addColorStop(0.5, '#1e293b') // slate-800
    gradient.addColorStop(1, '#0f172a')  // slate-900

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  /**
   * 绘制海报内容
   */
  const drawPosterContent = async (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    data: PosterData
  ) => {
    const padding = 60

    // 1. 顶部Logo和品牌
    drawHeader(ctx, width, padding)

    // 2. 英文短标题
    drawEnglishTitle(ctx, width, padding, data.englishTitle)

    // 3. 资产名称和符号
    drawAssetName(ctx, width, padding, data)

    // 4. 核心指标卡片
    drawMetricsCard(ctx, width, padding, data)

    // 5. K线图占位
    drawCandleChart(ctx, width, padding, data)

    // 6. 底部水印
    drawWatermark(ctx, width, height, padding)
  }

  /**
   * 绘制顶部Logo和品牌
   */
  const drawHeader = (
    ctx: CanvasRenderingContext2D,
    width: number,
    padding: number
  ) => {
    // HotScan Logo文字
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('🔥 HotScan', padding, padding + 50)

    // 副标题
    ctx.fillStyle = '#94a3b8' // slate-400
    ctx.font = '24px system-ui, -apple-system, sans-serif'
    ctx.fillText('热点雷达 | Hotspot Radar', padding, padding + 90)
  }

  /**
   * 绘制英文短标题
   */
  const drawEnglishTitle = (
    ctx: CanvasRenderingContext2D,
    width: number,
    padding: number,
    title: string
  ) => {
    const y = 240

    ctx.fillStyle = '#e2e8f0' // slate-200
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    
    // 自动换行
    const maxWidth = width - padding * 2
    wrapText(ctx, title.toUpperCase(), width / 2, y, maxWidth, 70)
  }

  /**
   * 绘制资产名称
   */
  const drawAssetName = (
    ctx: CanvasRenderingContext2D,
    width: number,
    padding: number,
    data: PosterData
  ) => {
    const y = 400

    // 符号
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(data.symbol, width / 2, y)

    // 名称
    ctx.fillStyle = '#94a3b8' // slate-400
    ctx.font = '32px system-ui, -apple-system, sans-serif'
    ctx.fillText(data.name, width / 2, y + 50)
  }

  /**
   * 绘制核心指标卡片
   */
  const drawMetricsCard = (
    ctx: CanvasRenderingContext2D,
    width: number,
    padding: number,
    data: PosterData
  ) => {
    const y = 550
    const cardWidth = width - padding * 2
    const cardHeight = 400

    // 卡片背景
    ctx.fillStyle = 'rgba(30, 41, 59, 0.8)' // slate-800 with opacity
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)' // slate-400 border
    ctx.lineWidth = 2
    
    roundRect(ctx, padding, y, cardWidth, cardHeight, 20)
    ctx.fill()
    ctx.stroke()

    // 价格变化
    const priceY = y + 80
    const isPositive = data.priceChangePct >= 0
    
    ctx.fillStyle = isPositive ? '#10b981' : '#ef4444' // green-500 : red-500
    ctx.font = 'bold 96px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(
      `${isPositive ? '+' : ''}${data.priceChangePct.toFixed(2)}%`,
      width / 2,
      priceY
    )

    // 标签
    ctx.fillStyle = '#94a3b8'
    ctx.font = '28px system-ui, -apple-system, sans-serif'
    ctx.fillText(`${formatWindow(data.window)} 涨跌幅`, width / 2, priceY + 50)

    // 分隔线
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding + 60, priceY + 90)
    ctx.lineTo(width - padding - 60, priceY + 90)
    ctx.stroke()

    // 其他指标（两列）
    const metricsY = priceY + 150
    const leftX = padding + cardWidth / 4
    const rightX = padding + (cardWidth * 3) / 4

    // 风险分数
    const riskColor = getRiskColor(data.riskLevel)
    drawMetricItem(ctx, leftX, metricsY, '风险评分', `${data.riskScore}/100`, riskColor)

    // 时间窗口
    drawMetricItem(ctx, rightX, metricsY, '时间窗口', formatWindow(data.window), '#60a5fa')
  }

  /**
   * 绘制单个指标项
   */
  const drawMetricItem = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    label: string,
    value: string,
    color: string
  ) => {
    ctx.fillStyle = '#94a3b8'
    ctx.font = '24px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, x, y)

    ctx.fillStyle = color
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    ctx.fillText(value, x, y + 60)
  }

  /**
   * 绘制K线图占位
   */
  const drawCandleChart = (
    ctx: CanvasRenderingContext2D,
    width: number,
    padding: number,
    data: PosterData
  ) => {
    const y = 1050
    const chartWidth = width - padding * 2
    const chartHeight = 500

    // 图表背景
    ctx.fillStyle = 'rgba(30, 41, 59, 0.5)'
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)'
    ctx.lineWidth = 2
    roundRect(ctx, padding, y, chartWidth, chartHeight, 20)
    ctx.fill()
    ctx.stroke()

    // 标题
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('价格走势', padding + 30, y + 50)

    // 绘制简化K线
    if (data.candleData && data.candleData.length > 0) {
      drawSimpleCandlesticks(ctx, padding + 30, y + 80, chartWidth - 60, chartHeight - 120, data.candleData)
    } else {
      // 占位文本
      ctx.fillStyle = '#64748b'
      ctx.font = '28px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('暂无K线数据', width / 2, y + chartHeight / 2)
    }
  }

  /**
   * 绘制简化K线图
   */
  const drawSimpleCandlesticks = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    candles: PosterData['candleData']
  ) => {
    if (!candles || candles.length === 0) return

    const candleWidth = width / candles.length
    const prices = candles.flatMap(c => [c.high, c.low])
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice || 1

    candles.forEach((candle, i) => {
      const centerX = x + i * candleWidth + candleWidth / 2
      const isGreen = candle.close >= candle.open

      // 价格转换为Y坐标
      const openY = y + height - ((candle.open - minPrice) / priceRange) * height
      const closeY = y + height - ((candle.close - minPrice) / priceRange) * height
      const highY = y + height - ((candle.high - minPrice) / priceRange) * height
      const lowY = y + height - ((candle.low - minPrice) / priceRange) * height

      // 影线
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX, highY)
      ctx.lineTo(centerX, lowY)
      ctx.stroke()

      // 实体
      const bodyTop = Math.min(openY, closeY)
      const bodyHeight = Math.abs(closeY - openY) || 2
      const bodyWidth = candleWidth * 0.6

      ctx.fillStyle = isGreen ? '#10b981' : '#ef4444'
      ctx.fillRect(centerX - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight)
    })
  }

  /**
   * 绘制底部水印
   */
  const drawWatermark = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    padding: number
  ) => {
    const y = height - padding - 100

    // 主要水印
    ctx.fillStyle = '#ef4444' // red-500
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('⚠️ 非投资建议', width / 2, y)

    // 副标题
    ctx.fillStyle = '#94a3b8'
    ctx.font = '24px system-ui, -apple-system, sans-serif'
    ctx.fillText('Not Financial Advice', width / 2, y + 40)

    // 网站
    ctx.fillStyle = '#64748b'
    ctx.font = '20px system-ui, -apple-system, sans-serif'
    ctx.fillText('hotscan.app', width / 2, y + 80)
  }

  /**
   * 下载海报
   */
  const handleDownload = () => {
    if (!imageUrl) return

    const link = document.createElement('a')
    link.download = `hotscan-${data.symbol}-${Date.now()}.png`
    link.href = imageUrl
    link.click()
  }

  /**
   * 分享海报
   */
  const handleShare = async () => {
    if (!imageUrl) return

    setIsGenerating(true)
    try {
      // 调用API创建分享记录
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: data.symbol, // 实际应该传入assetId
          title: data.englishTitle,
          imageUrl: imageUrl,
          metrics: {
            priceChangePct: data.priceChangePct,
            riskScore: data.riskScore,
            window: data.window,
          },
        }),
      })

      const result = await response.json()

      if (result.success && result.data.shareId) {
        const shareUrl = `${window.location.origin}/s/${result.data.shareId}`
        
        // 复制到剪贴板
        await navigator.clipboard.writeText(shareUrl)
        alert(`分享链接已复制到剪贴板：\n${shareUrl}`)
        
        onShare?.(shareUrl)
      }
    } catch (error) {
      console.error('Failed to create share:', error)
      alert('分享失败，请稍后重试')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Canvas（隐藏） */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* 预览图 */}
      {imageUrl && (
        <div className="relative aspect-[9/16] max-w-md mx-auto bg-slate-900 rounded-lg overflow-hidden shadow-2xl">
          <img
            src={imageUrl}
            alt="Poster Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2 justify-center">
        <Button
          onClick={handleDownload}
          disabled={!imageUrl}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          下载海报
        </Button>
        
        <Button
          onClick={handleShare}
          disabled={!imageUrl || isGenerating}
          variant="outline"
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          分享海报
        </Button>
      </div>
    </div>
  )
}

// ============================================
// 辅助函数
// ============================================

/**
 * 绘制圆角矩形
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * 文本自动换行
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY)
      line = words[i] + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, currentY)
}

/**
 * 格式化时间窗口
 */
function formatWindow(window: string): string {
  const map: Record<string, string> = {
    '5m': '5分钟',
    '15m': '15分钟',
    '30m': '30分钟',
    '1h': '1小时',
    '4h': '4小时',
    '1d': '24小时',
  }
  return map[window] || window
}

/**
 * 获取风险颜色
 */
function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    low: '#10b981',      // green-500
    medium: '#f59e0b',   // amber-500
    high: '#ef4444',     // red-500
    critical: '#dc2626', // red-600
  }
  return colors[level] || '#94a3b8'
}

