import { prisma } from '../src/lib/prisma'

async function checkDbStatus() {
  try {
    // Signal 统计
    const signalsTotal = await prisma.signal.count()
    
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000)
    const signals12h = await prisma.signal.count({
      where: {
        createdAt: {
          gte: twelveHoursAgo
        }
      }
    })
    
    const latestSignal = await prisma.signal.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    })
    
    // Asset 统计
    const assetsTotal = await prisma.asset.count()
    
    // Term 统计（带 embedding） - 使用原始查询
    const termsWithEmbResult = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM "Term" WHERE embedding IS NOT NULL
    `
    const termsWithEmb = Number(termsWithEmbResult[0]?.count || 0)
    
    console.log('┌────────────┬─────────────┬──────────┬─────────────────────┬────────┬───────────┐')
    console.log('│ Environment│ Signals(总) │ 近12h    │ 最新时间            │ Assets │ Terms(emb)│')
    console.log('├────────────┼─────────────┼──────────┼─────────────────────┼────────┼───────────┤')
    console.log(`│ 本地       │ ${signalsTotal.toString().padEnd(11)} │ ${signals12h.toString().padEnd(8)} │ ${latestSignal ? latestSignal.createdAt.toISOString().slice(0, 19).replace('T', ' ') : 'N/A'.padEnd(19)} │ ${assetsTotal.toString().padEnd(6)} │ ${termsWithEmb.toString().padEnd(9)} │`)
    console.log('└────────────┴─────────────┴──────────┴─────────────────────┴────────┴───────────┘')
    
  } catch (error: any) {
    console.error('❌ 数据库查询失败:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDbStatus()

