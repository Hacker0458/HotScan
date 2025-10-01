/**
 * Job: Make Signals
 * 
 * 功能：基于 DexScreener 数据生成交易信号
 * 运行频率：每 30 分钟（在 fetch-tickers 之后）
 */

import { prisma } from '@/lib/prisma'
import { getDataSource } from '@/lib/datasources/dexscreener'

// 主流代币列表（与 fetch-tickers 保持一致）
const TRACKED_SYMBOLS = [
  'BTC', 'ETH', 'SOL', 'BNB', 'DOGE',
  'PEPE', 'SHIB', 'MATIC', 'AVAX', 'LINK',
]

/**
 * 计算风险评分（0-100，越高越危险）
 */
function calculateRiskScore(data: {
  priceChange: { m5: number; h1: number; h24: number }
  liquidity: number
  contractAgeDays?: number
  volume: { h1: number; h24: number }
}): number {
  let score = 0
  
  // 1. 合约年龄（最多 +20 分）
  if (data.contractAgeDays !== undefined) {
    if (data.contractAgeDays <= 7) {
      score += 20
    } else if (data.contractAgeDays <= 30) {
      score += 10
    } else if (data.contractAgeDays <= 90) {
      score += 5
    }
  }
  
  // 2. 价格波动（最多 +25 分）
  const volatility = Math.abs(data.priceChange.h1)
  if (volatility > 50) {
    score += 25
  } else if (volatility > 30) {
    score += 15
  } else if (volatility > 15) {
    score += 10
  }
  
  // 3. 流动性（最多 +20 分）
  if (data.liquidity < 100000) {
    score += 20  // 低流动性高风险
  } else if (data.liquidity < 500000) {
    score += 10
  } else if (data.liquidity < 1000000) {
    score += 5
  }
  
  // 4. 成交量异常（最多 +15 分）
  const volRatio = data.volume.h1 / (data.volume.h24 / 24)
  if (volRatio > 5) {
    score += 15  // 短期成交量激增
  } else if (volRatio > 3) {
    score += 10
  } else if (volRatio > 2) {
    score += 5
  }
  
  // 5. 急速下跌风险（最多 +20 分）
  if (data.priceChange.m5 < -10 || data.priceChange.h1 < -20) {
    score += 20
  } else if (data.priceChange.m5 < -5 || data.priceChange.h1 < -10) {
    score += 10
  }
  
  return Math.min(score, 100)
}

/**
 * 生成 AI 摘要（简化版）
 */
function generateSimpleSummary(
  symbol: string,
  data: {
    priceChange: { m5: number; h1: number; h24: number }
    liquidity: number
    contractAgeDays?: number
    riskScore: number
  }
): { cn: string; en: string } {
  const priceDir = data.priceChange.h1 > 0 ? '上涨' : data.priceChange.h1 < 0 ? '下跌' : '持平'
  const priceChange = Math.abs(data.priceChange.h1).toFixed(1)
  
  const riskLevel =
    data.riskScore >= 70
      ? '极高风险'
      : data.riskScore >= 50
      ? '高风险'
      : data.riskScore >= 30
      ? '中风险'
      : '低风险'
  
  const cn = `${symbol} 1小时${priceDir}${priceChange}%，流动性$${(data.liquidity / 1000000).toFixed(2)}M，${
    data.contractAgeDays ? `合约${data.contractAgeDays}天` : '合约数据缺失'
  }。风险评分${data.riskScore}/100（${riskLevel}）。`
  
  const en = `${symbol} ${data.priceChange.h1 > 0 ? '+' : ''}${data.priceChange.h1.toFixed(1)}% in 1h, ${riskLevel}`
  
  return { cn, en }
}

/**
 * 判断情绪
 */
function determineSentiment(priceChange: number): 'bullish' | 'bearish' | 'neutral' {
  if (priceChange > 5) return 'bullish'
  if (priceChange < -5) return 'bearish'
  return 'neutral'
}

/**
 * 判断警报级别
 */
function determineAlertLevel(riskScore: number): 'low' | 'medium' | 'high' {
  if (riskScore >= 70) return 'high'
  if (riskScore >= 40) return 'medium'
  return 'low'
}

/**
 * Main job function
 */
export async function makeSignals() {
  const startTime = Date.now()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📡 Make Signals Job Started')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // 获取数据源
    const dataSource = getDataSource()
    
    // 拉取最新数据
    console.log(`\n📊 Fetching latest data for ${TRACKED_SYMBOLS.length} tokens...`)
    const tokenData = await dataSource.fetchRecent(TRACKED_SYMBOLS)
    
    console.log(`✅ Fetched ${tokenData.length} tokens\n`)
    
    // 生成信号
    let signalsCreated = 0
    
    for (const token of tokenData) {
      try {
        // 查找对应的 Asset
        const asset = await prisma.asset.findUnique({
          where: { symbol: token.symbol },
        })
        
        if (!asset) {
          console.warn(`⚠️  Asset not found for ${token.symbol}, skipping...`)
          continue
        }
        
        // 计算指标
        const volZScore = token.volume.h1 / (token.volume.h24 / 24) // 简化的 Z-score
        const liqDeltaPct = 0 // DexScreener 不提供流动性变化
        const top5HoldPct = 0 // DexScreener 不提供持仓数据
        const newWalletNetBuy = 0 // DexScreener 不提供钱包数据
        
        const riskScore = calculateRiskScore({
          priceChange: token.priceChange,
          liquidity: token.liquidity,
          contractAgeDays: token.contractAgeDays,
          volume: token.volume,
        })
        
        const summary = generateSimpleSummary(token.symbol, {
          priceChange: token.priceChange,
          liquidity: token.liquidity,
          contractAgeDays: token.contractAgeDays,
          riskScore,
        })
        
        const sentiment = determineSentiment(token.priceChange.h1)
        const alertLevel = determineAlertLevel(riskScore)
        
        // 创建信号（按不同时间窗口）
        for (const window of ['5m', '1h', '1d'] as const) {
          const priceChange =
            window === '5m'
              ? token.priceChange.m5
              : window === '1h'
              ? token.priceChange.h1
              : token.priceChange.h24
          
          await prisma.signal.create({
            data: {
              assetId: asset.id,
              window,
              priceChangePct: priceChange,
              currentPrice: token.price,
              volZScore,
              volumeUSD: window === '1h' ? token.volume.h1 : token.volume.h24,
              liqDeltaPct,
              totalLiquidityUSD: token.liquidity,
              top5HoldPct,
              holderCount: 0,
              newWalletNetBuy,
              newWalletCount: 0,
              riskScore,
              contractAgeDays: token.contractAgeDays || 0,
              sentiment,
              aiSummary: summary.cn,
              aiSummaryEn: summary.en,
              alertLevel,
            },
          })
          
          signalsCreated++
        }
        
        console.log(
          `  ✓ ${token.symbol}: ${token.priceChange.h1 > 0 ? '+' : ''}${token.priceChange.h1.toFixed(2)}%, ` +
          `Risk: ${riskScore}/100, Signals: 3`
        )
      } catch (error) {
        console.error(`  ✗ Error generating signal for ${token.symbol}:`, error)
      }
    }
    
    const duration = Date.now() - startTime
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Make Signals Job Completed')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📡 Signals created: ${signalsCreated}`)
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`)
    console.log('')

    return {
      success: true,
      signalsCreated,
      duration,
    }
  } catch (error: any) {
    console.error('\n❌ Make Signals Job Failed:', error.message)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  makeSignals()
    .then(() => {
      console.log('✨ Job finished successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Job failed with error:', error)
      process.exit(1)
    })
}
