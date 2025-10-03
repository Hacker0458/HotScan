import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 步骤 7.3: 验证数据并回显示例')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log()

  // 1. 统计数据
  const totalSignals = await prisma.signal.count()
  const signalsWithPrice = await prisma.signal.count({
    where: {
      asset: {
        pairs: {
          some: {
            priceUsd: {
              not: null
            }
          }
        }
      }
    }
  })
  const signalsWithSummary = await prisma.signal.count({
    where: {
      aiSummary: {
        not: null
      }
    }
  })

  console.log('📈 总体统计:')
  console.log(`   - 总信号数: ${totalSignals}`)
  console.log(`   - 有价格数据: ${signalsWithPrice} (${Math.round(signalsWithPrice / totalSignals * 100)}%)`)
  console.log(`   - 有 AI 摘要: ${signalsWithSummary} (${Math.round(signalsWithSummary / totalSignals * 100)}%)`)
  console.log()

  // 2. 获取示例数据（最新 3 条）
  const signals = await prisma.signal.findMany({
    include: {
      asset: {
        include: {
          pairs: {
            orderBy: {
              liquidityUSD: 'desc'
            },
            take: 1
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 3
  })

  console.log('🔍 示例数据（最新 3 条信号）:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  signals.forEach((signal, i) => {
    const pair = signal.asset.pairs[0]
    console.log()
    console.log(`[${i + 1}] ${signal.asset.symbol} (${signal.asset.chain})`)
    console.log(`   Price: $${pair?.priceUsd?.toFixed(6) || 'N/A'}`)
    console.log(`   Δ 1h:  ${pair?.priceChange1h !== null && pair?.priceChange1h !== undefined ? (pair.priceChange1h > 0 ? '+' : '') + pair.priceChange1h.toFixed(2) + '%' : 'N/A'}`)
    console.log(`   Δ 24h: ${pair?.priceChange24h !== null && pair?.priceChange24h !== undefined ? (pair.priceChange24h > 0 ? '+' : '') + pair.priceChange24h.toFixed(2) + '%' : 'N/A'}`)
    console.log(`   Summary: ${signal.aiSummary?.substring(0, 60) || 'N/A'}${signal.aiSummary && signal.aiSummary.length > 60 ? '...' : ''}`)
    console.log(`   Risk: ${signal.riskScore}/100`)
    console.log(`   Window: ${signal.window}`)
  })

  console.log()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
