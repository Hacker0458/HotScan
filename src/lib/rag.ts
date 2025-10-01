/**
 * RAG (Retrieval Augmented Generation) 核心库
 * 
 * 提供术语检索和智能问答功能
 */

import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai'

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
  timeout: 20000, // 20 seconds timeout
  maxRetries: 2,   // Retry up to 2 times with exponential backoff
})

export interface RetrievedTerm {
  term: string
  definition: string
  similarity: number
}

export interface LearnResponse {
  answer: string
  sources: RetrievedTerm[]
  query: string
}

/**
 * 生成查询文本的嵌入向量
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  
  return response.data[0].embedding
}

/**
 * 向量相似度搜索 - 检索最相关的术语
 * 
 * @param query - 用户查询
 * @param topK - 返回前K个结果
 * @returns 相关术语列表
 */
export async function searchSimilarTerms(
  query: string,
  topK: number = 3
): Promise<RetrievedTerm[]> {
  // 生成查询向量
  const queryEmbedding = await generateQueryEmbedding(query)
  
  // 使用pgvector的余弦相似度搜索
  const results = await prisma.$queryRaw<Array<{
    term: string
    definition: string
    similarity: number
  }>>`
    SELECT 
      term,
      definition,
      1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector(1536)) as similarity
    FROM "Term"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector(1536)
    LIMIT ${topK}
  `
  
  return results.map(r => ({
    term: r.term,
    definition: r.definition,
    similarity: Number(r.similarity),
  }))
}

/**
 * 生成新手友好的解释
 * 
 * @param query - 用户问题
 * @param retrievedTerms - 检索到的相关术语
 * @returns AI生成的解释
 */
export async function generateFriendlyExplanation(
  query: string,
  retrievedTerms: RetrievedTerm[]
): Promise<string> {
  // 构建上下文
  const context = retrievedTerms
    .map((t, i) => `[术语${i + 1}] ${t.term}: ${t.definition}`)
    .join('\n\n')
  
  // 构建提示词
  const systemPrompt = `你是一位耐心的加密货币和DeFi教育者。

你的任务：
1. 用60-80字简明扼要地解释概念，使用新手能理解的语言
2. 提供1个生活化的类比或例子帮助理解
3. 客观描述，不提供投资建议
4. 不做收益承诺，不劝诱投资

格式：
解释：[60-80字的清晰解释]
例子：[1个生活化的类比]

禁止：
❌ "建议购买"、"推荐投资"、"稳赚不赔"
❌ "必涨"、"暴富"、"财富密码"
❌ 任何收益承诺或投资劝诱`
  
  const userPrompt = `问题：${query}

参考资料：
${context}

请基于上述资料回答问题，确保新手友好且合规。`
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    })
    
    const answer = completion.choices[0]?.message?.content || '抱歉，无法生成解释。'
    
    // 检查合规性（防止模型输出不当内容）
    if (containsInappropriateContent(answer)) {
      return '抱歉，无法提供该问题的解释。请换个方式提问。'
    }
    
    return answer.trim()
  } catch (error) {
    console.error('Failed to generate explanation:', error)
    throw new Error('生成解释失败，请稍后重试。')
  }
}

/**
 * 检查内容是否包含不当劝诱
 */
function containsInappropriateContent(text: string): boolean {
  const inappropriateWords = [
    '建议买', '建议购买', '推荐买', '推荐购买',
    '稳赚', '必涨', '暴富', '财富密码',
    '抄底', '梭哈', '冲', '起飞',
    '保证收益', '承诺收益', '固定收益',
  ]
  
  return inappropriateWords.some(word => text.includes(word))
}

/**
 * 完整的RAG问答流程
 * 
 * @param query - 用户问题
 * @param topK - 检索数量
 * @returns 完整的问答响应
 */
export async function answerQuery(
  query: string,
  topK: number = 3
): Promise<LearnResponse> {
  // 1. 检索相关术语
  const sources = await searchSimilarTerms(query, topK)
  
  if (sources.length === 0) {
    return {
      query,
      answer: '抱歉，没有找到相关的术语解释。请尝试使用其他关键词，如"DeFi"、"流动性"、"智能合约"等。',
      sources: [],
    }
  }
  
  // 2. 生成友好解释
  const answer = await generateFriendlyExplanation(query, sources)
  
  return {
    query,
    answer,
    sources,
  }
}

/**
 * 批量搜索术语（用于自动补全或相关推荐）
 * 
 * @param prefix - 搜索前缀
 * @param limit - 返回数量
 * @returns 术语列表
 */
export async function searchTermsByPrefix(
  prefix: string,
  limit: number = 10
): Promise<Array<{ term: string; definition: string }>> {
  const results = await prisma.term.findMany({
    where: {
      term: {
        contains: prefix,
        mode: 'insensitive',
      },
    },
    select: {
      term: true,
      definition: true,
    },
    take: limit,
    orderBy: {
      term: 'asc',
    },
  })
  
  return results
}

/**
 * 获取所有术语（用于术语库页面）
 * 
 * @returns 术语列表
 */
export async function getAllTerms(): Promise<Array<{
  term: string
  definition: string
  createdAt: Date
}>> {
  const results = await prisma.term.findMany({
    select: {
      term: true,
      definition: true,
      createdAt: true,
    },
    orderBy: {
      term: 'asc',
    },
  })
  
  return results
}

/**
 * 获取随机术语（用于"每日一词"功能）
 * 
 * @param count - 返回数量
 * @returns 随机术语列表
 */
export async function getRandomTerms(count: number = 1): Promise<Array<{
  term: string
  definition: string
}>> {
  const totalCount = await prisma.term.count()
  
  if (totalCount === 0) {
    return []
  }
  
  // 随机跳过一些记录
  const skip = Math.floor(Math.random() * Math.max(0, totalCount - count))
  
  const results = await prisma.term.findMany({
    select: {
      term: true,
      definition: true,
    },
    skip,
    take: count,
  })
  
  return results
}