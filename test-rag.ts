/**
 * 测试 RAG 功能
 */

import { answerQuery } from './src/lib/rag'

async function test() {
  console.log('🧪 测试 RAG 功能...\n')
  
  try {
    console.log('查询: 流动性锁仓\n')
    const result = await answerQuery('流动性锁仓', 3)
    
    console.log('✅ 查询成功！\n')
    console.log('问题:', result.query)
    console.log('\n答案:', result.answer)
    console.log('\n相关术语:')
    result.sources.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.term} (相似度: ${s.similarity.toFixed(3)})`)
      console.log(`     ${s.definition.substring(0, 100)}...`)
    })
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

test()

