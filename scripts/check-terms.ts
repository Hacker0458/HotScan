import { prisma } from '../src/lib/prisma'

async function checkTerms() {
  try {
    const totalTerms = await prisma.term.count()
    
    const result = await prisma.$queryRaw<{count: bigint}[]>`
      SELECT COUNT(*) as count FROM "Term" WHERE embedding IS NOT NULL
    `
    const withEmb = Number(result[0]?.count || 0)
    
    console.log(`   总 Terms: ${totalTerms}`)
    console.log(`   有 embedding: ${withEmb}`)
    
    if (withEmb === 0 && totalTerms > 0) {
      console.log('   ⚠️  需要运行 jobs/embed-terms.ts')
    } else if (withEmb > 0) {
      console.log('   ✅ RAG 数据准备完成')
    } else if (totalTerms === 0) {
      console.log('   ⚠️  无 Term 数据，需要运行 seed')
    }
  } catch (error: any) {
    console.error('   ❌ 查询失败:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkTerms()


