/**
 * 信号分析作业
 * 
 * 分析所有活跃资产，生成交易信号并写入数据库
 * 
 * 运行方式:
 * - pnpm jobs:analyze
 * - Vercel Cron
 * - GitHub Actions
 */

import { prisma } from '@/lib/prisma'
import { analyzeSignal } from '@/lib/quant/signal-analyzer'
import { calculateWalletPercentiles } from '@/lib/quant/candidate-filter'
import { makeSafeSummary } from '@/lib/quant/summary-generator'
import type { CandidateInput, RiskInput } from '@/lib/quant/types'

async function main() {
  console.log('🚀 Starting signal analysis job...')
  const startTime = Date.now()

  try {
    // 1. 获取所有活跃资产
    console.log('\n📊 Step 1: Fetching active assets...')
    const assets = await prisma.asset.findMany({
      where: { isActive: true },
      include: {
        pairs: {
          where: { isActive: true },
          take: 1,
          orderBy: { liquidityUSD: 'desc' },
        },
      },
      take: 50, // 限制数量
    })

    console.log(`✅ Found ${assets.length} active assets`)

    if (assets.length === 0) {
      console.log('⚠️  No active assets found')
      return
    }

    // 2. 获取缓存数据
    console.log('\n📊 Step 2: Loading cached metrics...')
    const cachedMetrics = await prisma.rawMetric.findMany({
      where: {
        assetId: { in: assets.map((a) => a.id) },
        expiresAt: { gt: new Date() },
      },
    })

    console.log(`✅ Loaded ${cachedMetrics.length} cached metrics`)

    // 3. 计算钱包活动百分位
    console.log('\n📊 Step 3: Calculating wallet percentiles...')
    const walletData = cachedMetrics
      .filter((m) => m.metricType === 'wallet')
      .map((m) => {
        const asset = assets.find((a) => a.id === m.assetId)
        const data = m.data as any
        return {
          symbol: asset?.symbol || '',
          newWalletNetBuy: data.newWalletNetBuyUSD || 0,
        }
      })
      .filter((d) => d.symbol)

    const percentiles = calculateWalletPercentiles(walletData)
    console.log(`✅ Calculated percentiles for ${Object.keys(percentiles).length} assets`)

    // 4. 分析每个资产
    console.log('\n📊 Step 4: Analyzing signals...')
    let successCount = 0
    let failCount = 0
    const generatedSignals = []

    for (const asset of assets) {
      try {
        // 获取资产的缓存数据
        const assetMetrics = cachedMetrics.filter((m) => m.assetId === asset.id)

        // 提取K线数据
        const candleData = assetMetrics.find((m) => m.metricType === 'candle' && m.window === '1h')
        const candles = candleData ? (candleData.data as any).candles : []

        if (candles.length < 2) {
          console.log(`  ⚠️  ${asset.symbol}: Insufficient candle data`)
          failCount++
          continue
        }

        // 计算价格变化
        const latestCandle = candles[candles.length - 1]
        const candle5mAgo = candles[candles.length - 2] || latestCandle
        const priceChange5m = ((latestCandle.close - candle5mAgo.close) / candle5mAgo.close) * 100

        // 计算成交量统计
        const volumes = candles.map((c: any) => c.volumeUSD || 0)
        const volume24hMean = volumes.reduce((a: number, b: number) => a + b, 0) / volumes.length
        const volume24hStdDev = Math.sqrt(
          volumes.reduce((sum: number, v: number) => sum + Math.pow(v - volume24hMean, 2), 0) / volumes.length
        )

        // 获取流动性数据
        const liquidityData = assetMetrics.find((m) => m.metricType === 'liquidity')
        const currentLiquidity = liquidityData ? (liquidityData.data as any).liquidityUSD : 0
        
        // 假设1小时前流动性（简化处理）
        const liquidity1hAgo = currentLiquidity * 0.95

        // 获取钱包数据
        const walletMetric = assetMetrics.find((m) => m.metricType === 'wallet')
        const walletInfo = walletMetric ? (walletMetric.data as any) : {}

        // 构建候选输入
        const candidateInput: CandidateInput = {
          symbol: asset.symbol,
          assetId: asset.id,
          priceChange5m,
          priceChange15m: priceChange5m * 1.2, // 简化
          currentPrice: latestCandle.close,
          volume1h: latestCandle.volumeUSD || 0,
          volume24hMean,
          volume24hStdDev,
          liquidityNow: currentLiquidity,
          liquidity1hAgo,
          newWalletNetBuy: walletInfo.newWalletNetBuyUSD || 0,
          newWalletNetBuyPercentile: percentiles[asset.symbol] || 0,
        }

        // 获取持仓数据
        const holderData = assetMetrics.find((m) => m.metricType === 'holder')
        const holderInfo = holderData ? (holderData.data as any) : {}

        // 构建风险输入
        const riskInput: RiskInput = {
          symbol: asset.symbol,
          contractAgeDays: Math.floor((Date.now() - asset.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
          top5HoldingPct: holderInfo.top5HoldingPct || 30,
          hasLiquidity: currentLiquidity > 0,
          isLiquidityLocked: Math.random() > 0.3, // Mock
          canRemoveLiquidity: Math.random() > 0.7, // Mock
          socialMentionSpike: Math.abs(priceChange5m) > 10, // 简化判断
          netInflowNegative: walletInfo.newWalletNetBuyUSD < 0,
          devAddressTrading: false, // Mock
        }

        // 分析信号
        const analysis = analyzeSignal(candidateInput, riskInput, '1h')

        // 生成AI摘要
        const aiSummaryJson = makeSafeSummary(
          {
            ...candidateInput,
            ...riskInput,
            window: '1h',
            riskScore: analysis.risk.totalScore,
            liqDeltaPct: ((currentLiquidity - liquidity1hAgo) / (liquidity1hAgo || 1)) * 100,
            currentPrice: latestCandle.close,
            volumeUSD: candidateInput.volume1h,
            totalLiquidityUSD: currentLiquidity,
            holderCount: holderInfo.totalHolders || 0,
            newWalletCount: walletInfo.newWalletCount || 0,
          } as any,
          { name: asset.name, symbol: asset.symbol }
        )

        // 写入数据库
        const signal = await prisma.signal.create({
          data: {
            assetId: asset.id,
            window: '1h',
            priceChangePct: priceChange5m,
            currentPrice: latestCandle.close,
            volZScore: (candidateInput.volume1h - volume24hMean) / (volume24hStdDev || 1),
            volumeUSD: candidateInput.volume1h,
            liqDeltaPct: ((currentLiquidity - liquidity1hAgo) / (liquidity1hAgo || 1)) * 100,
            totalLiquidityUSD: currentLiquidity,
            top5HoldPct: riskInput.top5HoldingPct,
            holderCount: holderInfo.totalHolders || 0,
            newWalletNetBuy: walletInfo.newWalletNetBuyUSD || 0,
            newWalletCount: walletInfo.newWalletCount || 0,
            riskScore: analysis.risk.totalScore,
            contractAgeDays: riskInput.contractAgeDays,
            sentiment: analysis.recommendation === 'strong_buy' || analysis.recommendation === 'buy' ? 'bullish' : 
                       analysis.recommendation === 'danger' || analysis.recommendation === 'avoid' ? 'bearish' : 'neutral',
            aiSummary: JSON.stringify(aiSummaryJson),
            alertLevel: analysis.risk.riskLevel === 'critical' ? 'critical' :
                        analysis.risk.riskLevel === 'high' ? 'high' :
                        analysis.risk.riskLevel === 'medium' ? 'medium' : 'low',
          },
        })

        generatedSignals.push(signal)
        successCount++
        
        console.log(`  ✅ ${asset.symbol}: ${analysis.recommendation} (risk: ${analysis.risk.totalScore})`)
      } catch (error) {
        failCount++
        console.error(`  ❌ ${asset.symbol}: Failed -`, error instanceof Error ? error.message : error)
      }
    }

    // 5. 统计
    console.log(`\n📊 Step 5: Summary`)
    console.log(`  Total analyzed: ${assets.length}`)
    console.log(`  Succeeded: ${successCount}`)
    console.log(`  Failed: ${failCount}`)
    console.log(`  Signals generated: ${generatedSignals.length}`)

    // 按推荐度分类
    const recommendations = {
      strong_buy: 0,
      buy: 0,
      hold: 0,
      avoid: 0,
      danger: 0,
    }

    for (const signal of generatedSignals) {
      if (signal.riskScore <= 14) recommendations.strong_buy++
      else if (signal.riskScore <= 24) recommendations.buy++
      else if (signal.riskScore <= 49) recommendations.hold++
      else if (signal.riskScore <= 74) recommendations.avoid++
      else recommendations.danger++
    }

    console.log(`\n  Recommendations:`)
    console.log(`    Strong Buy: ${recommendations.strong_buy}`)
    console.log(`    Buy: ${recommendations.buy}`)
    console.log(`    Hold: ${recommendations.hold}`)
    console.log(`    Avoid: ${recommendations.avoid}`)
    console.log(`    Danger: ${recommendations.danger}`)

    // 完成
    const duration = Date.now() - startTime
    console.log(`\n✨ Signal analysis completed in ${duration}ms`)

    // 记录任务
    await prisma.jobRun.create({
      data: {
        jobName: 'analyze-signals',
        status: 'success',
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration,
        processed: assets.length,
        succeeded: successCount,
        failed: failCount,
        metadata: {
          signalsGenerated: generatedSignals.length,
          recommendations,
        },
      },
    })
  } catch (error) {
    console.error('❌ Signal analysis failed:', error)

    await prisma.jobRun.create({
      data: {
        jobName: 'analyze-signals',
        status: 'failed',
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: Date.now() - startTime,
        processed: 0,
        succeeded: 0,
        failed: 1,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    })

    process.exit(1)
  }
}

function generateSummary(analysis: any): string {
  const { candidate, risk, recommendation } = analysis
  
  const parts = []
  
  // 候选条件
  if (candidate.qualified) {
    parts.push(`满足${candidate.score}/4个筛选条件`)
  }
  
  // 风险标志
  if (risk.flags.length > 0) {
    parts.push(`风险标志: ${risk.flags.join('、')}`)
  }
  
  // 推荐
  const recMap: Record<string, string> = {
    strong_buy: '强烈推荐',
    buy: '可以买入',
    hold: '建议观望',
    avoid: '建议避免',
    danger: '高危险性',
  }
  parts.push(recMap[recommendation] || '无建议')
  
  return parts.join('；')
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
