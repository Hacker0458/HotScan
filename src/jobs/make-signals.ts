/**
 * Job: Make Signals
 * 
 * 基于 DexScreener 真实数据生成交易信号
 * 支持多时间窗口：5m, 1h
 */

import { prisma } from '@/lib/prisma'
import { searchPairs } from '@/lib/datasources/dexscreener'
import { generateFallbackSummaryDual } from '@/lib/ai/summary'

const SIGNAL_WINDOWS = ['5m', '1h'] as const
type SignalWindow = typeof SIGNAL_WINDOWS[number]

export interface MakeSignalsResult {
  signalsCreated: number
  assetsProcessed: number
}

/**
 * 计算风险评分（0-100，越高越危险）
 */
function calculateRiskScore(data: {
  priceChange5m: number
  priceChange1h: number
  volume1h: number
  volume24h: number
  liquidityUSD: number
  contractAgeDays?: number
}): number {
  let score = 0

  // 1. 合约年龄 (+20)
  if (data.contractAgeDays !== undefined && data.contractAgeDays <= 7) {
    score += 20
  } else if (data.contractAgeDays && data.contractAgeDays <= 30) {
    score += 10
  }

  // 2. 价格波动 (+25)
  const volatility = Math.max(Math.abs(data.priceChange5m), Math.abs(data.priceChange1h))
  if (volatility > 50) {
    score += 25
  } else if (volatility > 30) {
    score += 15
  } else if (volatility > 15) {
    score += 10
  }

  // 3. 流动性 (+20)
  if (data.liquidityUSD < 100000) {
    score += 20
  } else if (data.liquidityUSD < 500000) {
    score += 10
  } else if (data.liquidityUSD < 1000000) {
    score += 5
  }

  // 4. 成交量异常 (+15)
  const volRatio = data.volume1h / (data.volume24h / 24 || 1)
  if (volRatio > 5) {
    score += 15
  } else if (volRatio > 3) {
    score += 10
  } else if (volRatio > 2) {
    score += 5
  }

  // 5. 急速下跌 (+20)
  if (data.priceChange5m < -10 || data.priceChange1h < -20) {
    score += 20
  } else if (data.priceChange5m < -5 || data.priceChange1h < -10) {
    score += 10
  }

  return Math.min(score, 100)
}

/**
 * 计算成交量 Z-Score（简化版）
 */
function calculateVolZScore(volume1h: number, volume24h: number): number {
  const avgVol = volume24h / 24
  if (avgVol === 0) return 0

  // 简化的 Z-Score：(当前值 - 平均值) / 标准差
  // 这里假设标准差约为平均值的 30%
  const stdDev = avgVol * 0.3
  const zScore = (volume1h - avgVol) / stdDev
  return Number(zScore.toFixed(2))
}

/**
 * 生成交易信号
 */
export async function makeSignals(): Promise<MakeSignalsResult> {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Make Signals Started')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const startTime = Date.now()
  let signalsCreated = 0
  let assetsProcessed = 0

  // 获取所有 Assets
  const assets = await prisma.asset.findMany({
    include: {
      pairs: {
        orderBy: { liquidityUSD: 'desc' },
        take: 1 // 只取流动性最高的 pair
      }
    }
  })

  console.log(`📋 待处理资产: ${assets.length}\n`)

  for (const asset of assets) {
    if (asset.pairs.length === 0) {
      console.log(`⏭️  跳过 ${asset.symbol} (无交易对)`)
      continue
    }

    assetsProcessed++
    const pair = asset.pairs[0]
    console.log(`🔍 处理: ${asset.symbol} (${asset.chain})`)

    // 从 DexScreener 获取最新数据
    const pairs = await searchPairs(asset.symbol)
    const livePair = pairs.find(p => 
      p.chainId === asset.chain && 
      p.baseToken.symbol.toUpperCase() === asset.symbol.toUpperCase()
    )

    if (!livePair) {
      console.log(`  ⚠️  未找到实时数据，使用默认值`)
    }

    // 提取指标（缺失字段置 0）
    const priceChange5m = livePair?.priceChange?.m5 || 0
    const priceChange1h = livePair?.priceChange?.h1 || 0
    const volume1h = livePair?.volume?.h1 || 0
    const volume24h = livePair?.volume?.h24 || 1 // 避免除零
    const liquidityUSD = livePair?.liquidity?.usd || pair.liquidityUSD || 0
    const currentPrice = parseFloat(livePair?.priceUsd || '0')

    // 计算合约年龄（如果有 pairCreatedAt）
    let contractAgeDays: number | undefined
    if (livePair?.pairCreatedAt) {
      const ageMs = Date.now() - livePair.pairCreatedAt
      contractAgeDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
    }

    // 计算风险评分
    const riskScore = calculateRiskScore({
      priceChange5m,
      priceChange1h,
      volume1h,
      volume24h,
      liquidityUSD,
      contractAgeDays
    })

    // 计算成交量 Z-Score
    const volZScore = calculateVolZScore(volume1h, volume24h)

    // 流动性变化百分比（暂无历史数据，置 0）
    const liqDeltaPct = 0

    console.log(`  📈 价格变化: 5m=${priceChange5m.toFixed(2)}%, 1h=${priceChange1h.toFixed(2)}%`)
    console.log(`  📊 成交量 Z-Score: ${volZScore}`)
    console.log(`  ⚠️  风险评分: ${riskScore}/100`)

    // 为每个时间窗口生成信号
    for (const window of SIGNAL_WINDOWS) {
      const priceChangePct = window === '5m' ? priceChange5m : priceChange1h

      // 简单的 AI 摘要
      const sentiment = priceChangePct > 5 ? 'bullish' : priceChangePct < -5 ? 'bearish' : 'neutral'
      const alertLevel = riskScore >= 70 ? 'high' : riskScore >= 50 ? 'medium' : 'low'

      // 生成双语摘要
      const summaries = generateFallbackSummaryDual({
        symbol: asset.symbol,
        priceChange1h: priceChange1h,
        priceChange24h: pair.priceChange?.h24 || null,
        volumeZScore: volZScore,
        liquidityDeltaPct: liqDeltaPct,
        riskScore: riskScore
      })

      await prisma.signal.create({
        data: {
          assetId: asset.id,
          window,
          priceChangePct,
          currentPrice,
          volZScore,
          volumeUSD: volume1h,
          liqDeltaPct,
          totalLiquidityUSD: liquidityUSD,
          top5HoldPct: 0, // 暂无数据
          holderCount: 0,
          newWalletNetBuy: 0,
          newWalletCount: 0,
          riskScore,
          contractAgeDays: contractAgeDays || 0,
          sentiment,
          aiSummary: summaries.zh,
          summaryZh: summaries.zh,
          summaryEn: summaries.en,
          alertLevel
        }
      })

      signalsCreated++
    }

    console.log(`  ✅ 生成 ${SIGNAL_WINDOWS.length} 条信号\n`)
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Make Signals Completed')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 统计:`)
  console.log(`   - 资产处理: ${assetsProcessed}`)
  console.log(`   - 信号生成: ${signalsCreated}`)
  console.log(`⏱️  耗时: ${duration}s\n`)

  return {
    signalsCreated,
    assetsProcessed
  }
}

// 如果直接运行此文件
if (require.main === module) {
  makeSignals()
    .then(result => {
      console.log('✅ 完成:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('❌ 失败:', error)
      process.exit(1)
    })
}
