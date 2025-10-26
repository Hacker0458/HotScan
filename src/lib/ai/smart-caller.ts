/**
 * Smart AI Caller with Intelligent Fallback
 * 
 * 智能降级调用器：
 * 1. 检查缓存
 * 2. 尝试主力模型
 * 3. 失败则尝试备用模型
 * 4. 全部失败则使用本地模板
 */

import { AI_PROVIDERS, AI_MODELS, AI_CONFIG, type AIUseCase, type ModelConfig } from './model-config'
import { generateFallbackSummaryDual } from './summary'
import crypto from 'crypto'

// 简单的内存缓存（生产环境应使用Redis）
const cache = new Map<string, { data: string; expires: number }>()

// 速率限制计数器
const rateLimitCounters = {
  perSecond: new Map<number, number>(),
  perMinute: new Map<number, number>(),
  daily: { count: 0, date: new Date().toDateString() }
}

/**
 * 生成缓存键
 */
function hashPrompt(prompt: string): string {
  return crypto.createHash('md5').update(prompt).digest('hex')
}

/**
 * 获取缓存
 */
async function getCache(key: string): Promise<string | null> {
  if (!AI_CONFIG.cache.enabled) return null
  
  const cached = cache.get(key)
  if (!cached) return null
  
  if (Date.now() > cached.expires) {
    cache.delete(key)
    return null
  }
  
  return cached.data
}

/**
 * 设置缓存
 */
async function setCache(key: string, data: string, ttl: number): Promise<void> {
  if (!AI_CONFIG.cache.enabled) return
  
  cache.set(key, {
    data,
    expires: Date.now() + ttl * 1000
  })
}

/**
 * 检查速率限制
 */
async function checkRateLimit(): Promise<void> {
  const now = Date.now()
  const currentSecond = Math.floor(now / 1000)
  const currentMinute = Math.floor(now / 60000)
  const today = new Date().toDateString()
  
  // 检查每日限制
  if (rateLimitCounters.daily.date !== today) {
    rateLimitCounters.daily = { count: 0, date: today }
  }
  
  if (rateLimitCounters.daily.count >= AI_CONFIG.rateLimit.dailyLimit) {
    throw new Error('Daily rate limit exceeded')
  }
  
  // 检查每秒限制
  const secondCount = rateLimitCounters.perSecond.get(currentSecond) || 0
  if (secondCount >= AI_CONFIG.rateLimit.perSecond) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // 检查每分钟限制
  const minuteCount = rateLimitCounters.perMinute.get(currentMinute) || 0
  if (minuteCount >= AI_CONFIG.rateLimit.perMinute) {
    throw new Error('Per-minute rate limit exceeded')
  }
  
  // 更新计数器
  rateLimitCounters.perSecond.set(currentSecond, secondCount + 1)
  rateLimitCounters.perMinute.set(currentMinute, minuteCount + 1)
  rateLimitCounters.daily.count++
  
  // 清理过期的计数器
  for (const [second] of rateLimitCounters.perSecond.entries()) {
    if (second < currentSecond - 10) {
      rateLimitCounters.perSecond.delete(second)
    }
  }
  for (const [minute] of rateLimitCounters.perMinute.entries()) {
    if (minute < currentMinute - 5) {
      rateLimitCounters.perMinute.delete(minute)
    }
  }
}

/**
 * 调用AI模型
 */
async function callModel(
  config: ModelConfig,
  prompt: string,
  options?: {
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }
): Promise<string> {
  const provider = AI_PROVIDERS[config.provider]
  
  const response = await fetch(`${provider.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        ...(options?.systemPrompt ? [{
          role: 'system',
          content: options.systemPrompt
        }] : []),
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: options?.maxTokens || AI_CONFIG.maxTokens,
      temperature: options?.temperature || AI_CONFIG.temperature,
    }),
    signal: AbortSignal.timeout(provider.timeout)
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`${provider.name} API error: ${response.status} - ${error}`)
  }
  
  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

/**
 * 智能AI调用器
 */
export async function callAI(
  useCase: AIUseCase,
  prompt: string,
  options?: {
    useReasoning?: boolean
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
    bypassCache?: boolean
  }
): Promise<string> {
  const config = AI_MODELS[useCase]
  
  // 1. 检查缓存
  if (!options?.bypassCache) {
    const cacheKey = `${AI_CONFIG.cache.keyPrefix}${useCase}:${hashPrompt(prompt)}`
    const cached = await getCache(cacheKey)
    if (cached) {
      console.log(`[AI] Cache hit for ${useCase}`)
      return cached
    }
  }
  
  // 2. 检查速率限制
  try {
    await checkRateLimit()
  } catch (error: any) {
    console.warn(`[AI] Rate limit: ${error.message}, using fallback template`)
    return generateFallbackForUseCase(useCase, prompt)
  }
  
  // 3. 尝试推理模型（如果需要）
  if (options?.useReasoning && config.reasoning) {
    try {
      console.log(`[AI] Trying reasoning model: ${config.reasoning.model}`)
      const result = await callModel(config.reasoning, prompt, options)
      const cacheKey = `${AI_CONFIG.cache.keyPrefix}${useCase}:${hashPrompt(prompt)}`
      await setCache(cacheKey, result, AI_CONFIG.cache.ttl)
      return result
    } catch (error: any) {
      console.warn(`[AI] Reasoning model failed: ${error.message}`)
    }
  }
  
  // 4. 尝试主力模型
  try {
    console.log(`[AI] Trying primary model: ${config.primary.model}`)
    const result = await callModel(config.primary, prompt, options)
    const cacheKey = `${AI_CONFIG.cache.keyPrefix}${useCase}:${hashPrompt(prompt)}`
    await setCache(cacheKey, result, AI_CONFIG.cache.ttl)
    return result
  } catch (error: any) {
    console.warn(`[AI] Primary model failed: ${error.message}`)
  }
  
  // 5. 尝试备用模型
  if (config.fallback) {
    try {
      console.log(`[AI] Trying fallback model: ${config.fallback.model}`)
      const result = await callModel(config.fallback, prompt, options)
      const cacheKey = `${AI_CONFIG.cache.keyPrefix}${useCase}:${hashPrompt(prompt)}`
      await setCache(cacheKey, result, AI_CONFIG.cache.ttl)
      return result
    } catch (error: any) {
      console.warn(`[AI] Fallback model failed: ${error.message}`)
    }
  }
  
  // 6. 尝试最后备份
  if (config.backup) {
    try {
      console.log(`[AI] Trying backup model: ${config.backup.model}`)
      const result = await callModel(config.backup, prompt, options)
      return result
    } catch (error: any) {
      console.error(`[AI] All models failed: ${error.message}`)
    }
  }
  
  // 7. 使用本地规则模板
  console.log(`[AI] Using local fallback template for ${useCase}`)
  return generateFallbackForUseCase(useCase, prompt)
}

/**
 * 根据使用场景生成兜底内容
 */
function generateFallbackForUseCase(useCase: AIUseCase, prompt: string): string {
  switch (useCase) {
    case 'summary':
      // 从prompt中提取指标数据生成摘要
      return '数据处理中，请稍后刷新查看最新分析。'
    
    case 'news':
      return '快讯摘要生成中...'
    
    case 'analysis':
      return '市场分析功能暂时不可用，请稍后重试。'
    
    case 'qa':
      return '抱歉，AI问答服务暂时不可用。请查看文档或稍后重试。'
    
    default:
      return '服务暂时不可用，请稍后重试。'
  }
}

/**
 * 批量调用AI（并发控制）
 */
export async function callAIBatch(
  useCase: AIUseCase,
  prompts: string[],
  options?: {
    concurrency?: number
    maxTokens?: number
  }
): Promise<string[]> {
  const concurrency = options?.concurrency || 5
  const results: string[] = []
  
  for (let i = 0; i < prompts.length; i += concurrency) {
    const batch = prompts.slice(i, i + concurrency)
    const batchResults = await Promise.all(
      batch.map(prompt => callAI(useCase, prompt, options))
    )
    results.push(...batchResults)
  }
  
  return results
}

/**
 * 清理缓存
 */
export function clearAICache(): void {
  cache.clear()
  console.log('[AI] Cache cleared')
}

/**
 * 获取缓存统计
 */
export function getAICacheStats(): {
  size: number
  dailyCount: number
} {
  return {
    size: cache.size,
    dailyCount: rateLimitCounters.daily.count
  }
}

