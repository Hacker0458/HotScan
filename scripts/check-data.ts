import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('0️⃣ 快速探针 - 检查最新 3 条 signals 的价格和摘要')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log()

  const rows = await prisma.signal.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      asset: {
        include: {
          pairs: {
            orderBy: { liquidityUSD: 'desc' },
            take: 1
          }
        }
      }
    }
  })

  console.log('📊 最新 3 条 Signal 数据:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  rows.forEach((r, i) => {
    const pair = r.asset?.pairs?.[0]
    console.log(`[${i + 1}] Symbol: ${r.asset?.symbol || 'N/A'}`)
    console.log(`    Price: ${pair?.priceUsd ?? 'NULL'}`)
    console.log(`    Δ 1h: ${pair?.priceChange1h ?? 'NULL'}`)
    console.log(`    Δ 24h: ${pair?.priceChange24h ?? 'NULL'}`)
    console.log(`    Has Summary: ${r.aiSummary ? 'YES' : 'NO'}`)
    console.log(`    Summary Preview: ${(r.aiSummary || 'N/A').slice(0, 50)}`)
    console.log(`    Created: ${r.createdAt}`)
    console.log('')
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  await prisma.$disconnect()
}

main().catch(console.error)

