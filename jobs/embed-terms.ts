import { prisma } from '../src/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
})

async function embedTerms() {
  const startTime = Date.now()
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔄 Embed Terms Started')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  try {
    // 获取所有没有 embedding 的术语
    const terms = await prisma.term.findMany({
      where: {
        // 由于 embedding 是 Unsupported 类型，我们需要用原始查询来检查
      },
    })

    console.log(`📚 找到 ${terms.length} 个术语`)

    let embedded = 0
    let failed = 0

    for (const term of terms) {
      try {
        console.log(`\n🔍 处理: ${term.term}`)

        // 组合术语和定义来生成更好的 embedding
        const text = `${term.term}: ${term.definition}`

        // 调用 OpenAI Embedding API
        const response = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: text,
        })

        const embedding = response.data[0].embedding

        // 使用原始查询更新 embedding
        await prisma.$executeRaw`
          UPDATE "Term"
          SET embedding = ${JSON.stringify(embedding)}::vector
          WHERE id = ${term.id}
        `

        embedded++
        console.log(`  ✅ embedding 已生成 (${embedding.length} 维)`)
      } catch (error: any) {
        failed++
        console.error(`  ❌ 失败: ${error.message}`)

        // 如果是 rate limit，等待一下
        if (error.status === 429) {
          console.log('  ⏳ 遇到限流，等待 5 秒...')
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      }

      // 添加小延迟避免过于频繁的请求
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    const duration = Date.now() - startTime
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Embed Terms Completed')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 统计:')
    console.log(`   - 总术语数: ${terms.length}`)
    console.log(`   - 成功: ${embedded}`)
    console.log(`   - 失败: ${failed}`)
    console.log(`⏱️  耗时: ${(duration / 1000).toFixed(2)}s`)

    return { total: terms.length, embedded, failed }
  } catch (error: any) {
    console.error('❌ Embed Terms 失败:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 如果直接运行这个脚本
if (require.main === module) {
  embedTerms()
    .then(() => {
      process.exit(0)
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

export { embedTerms }


