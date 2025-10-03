/**
 * AI Summary Generation with Fallback and Caching
 * 加速 + 兜底 + 缓存策略
 */

interface SignalMetrics {
  symbol: string
  priceChange1h?: number | null
  priceChange24h?: number | null
  volumeZScore: number
  liquidityDeltaPct: number
  riskScore: number
  sentiment?: string | null
}

// 规则模板生成短评（兜底方案）
export function generateFallbackSummary(metrics: SignalMetrics): string {
  const { symbol, priceChange1h, priceChange24h, volumeZScore, liquidityDeltaPct, riskScore } = metrics
  
  // 判断方向和变化
  const price1h = priceChange1h !== null && priceChange1h !== undefined ? priceChange1h : 0
  const direction = price1h > 0.5 ? '上涨' : price1h < -0.5 ? '下跌' : '横盘'
  const change1h = Math.abs(price1h).toFixed(2) + '%'
  const change24h = priceChange24h !== null && priceChange24h !== undefined
    ? `，24h ${priceChange24h > 0 ? '+' : ''}${priceChange24h.toFixed(2)}%` 
    : ''
  
  // 判断成交量强度
  let volumeStrength = '正常'
  if (volumeZScore > 2) volumeStrength = '异常放大'
  else if (volumeZScore > 1) volumeStrength = '增强'
  else if (volumeZScore < -1) volumeStrength = '萎缩'
  
  // 判断流动性变化
  let liquidityTrend = '→'
  if (liquidityDeltaPct > 2) liquidityTrend = '↑'
  else if (liquidityDeltaPct < -2) liquidityTrend = '↓'
  
  // 判断风险等级
  let riskLevel = '低'
  if (riskScore >= 60) riskLevel = '高'
  else if (riskScore >= 40) riskLevel = '中'
  
  return `${symbol}${direction}${change1h}${change24h}；成交量${volumeStrength}；流动性${liquidityTrend}；风险${riskLevel}。`
}

// AI 生成摘要（轻量模型）
export async function generateAISummary(metrics: SignalMetrics): Promise<{
  success: boolean
  summary: string
  isFallback: boolean
  duration: number
}> {
  const startTime = Date.now()
  
  // 检查是否启用 AI（通过环境变量控制）
  const enableAI = process.env.ENABLE_AI_SUMMARY === 'true'
  const mockAI = process.env.MOCK_AI === 'true'
  
  if (!enableAI || mockAI) {
    // 使用兜底方案
    return {
      success: false,
      summary: generateFallbackSummary(metrics),
      isFallback: true,
      duration: Date.now() - startTime
    }
  }
  
  try {
    // TODO: 这里应该调用实际的 AI API
    // 例如：OpenAI GPT-4o-mini, Claude Haiku, 或自家 proxy v2-mini
    // 参数：max_tokens=128, temperature=0.3, timeout=8s
    
    // 示例 prompt
    const prompt = `分析加密资产交易信号（限50字内中文）：
${metrics.symbol}: 
- 1h变化: ${metrics.priceChange1h?.toFixed(2)}%
- 24h变化: ${metrics.priceChange24h?.toFixed(2)}%
- 成交量Z值: ${metrics.volumeZScore.toFixed(2)}
- 流动性变化: ${metrics.liquidityDeltaPct.toFixed(2)}%
- 风险分数: ${metrics.riskScore}/100
请给出简洁的市场分析。`

    // 模拟 AI 调用失败（超时）
    throw new Error('AI service not configured')
    
  } catch (error: any) {
    console.warn(`AI summary failed for ${metrics.symbol}, using fallback:`, error.message)
    return {
      success: false,
      summary: generateFallbackSummary(metrics),
      isFallback: true,
      duration: Date.now() - startTime
    }
  }
}

// 批量生成摘要（并发控制）
export async function generateSummariesBatch(
  metricsList: SignalMetrics[],
  concurrency = 5
): Promise<Array<{
  symbol: string
  summary: string
  isFallback: boolean
  duration: number
}>> {
  const results: Array<{
    symbol: string
    summary: string
    isFallback: boolean
    duration: number
  }> = []
  
  // 简单的并发控制
  for (let i = 0; i < metricsList.length; i += concurrency) {
    const batch = metricsList.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(async (metrics) => {
        const result = await generateAISummary(metrics)
        return {
          symbol: metrics.symbol,
          ...result
        }
      })
    )
    results.push(...batchResults)
  }
  
  return results
}

