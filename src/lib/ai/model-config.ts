/**
 * AI Model Configuration
 * 
 * 三层智能降级策略：
 * - Layer 1: DeepSeek (极快 + 极便宜)
 * - Layer 2: GPT-4o-mini (质量好 + 成本适中)
 * - Layer 3: Claude Haiku (高质量备份)
 */

export interface AIProvider {
  name: string
  baseURL: string
  apiKey: string
  timeout: number
  priority: number
}

export interface ModelConfig {
  provider: keyof typeof AI_PROVIDERS
  model: string
}

export interface UseCaseConfig {
  primary: ModelConfig
  fallback?: ModelConfig
  backup?: ModelConfig
  reasoning?: ModelConfig
}

// AI提供商配置
export const AI_PROVIDERS = {
  probex: {
    name: 'Probex',
    baseURL: 'https://api.probex.top/v1',
    apiKey: process.env.PROBEX_API_KEY || 'sk-JaLWJy75i0t0gzrY41V7uMAjI2TcEga4Ojg6mF96nhFzQLyo',
    timeout: 10000,
    priority: 1, // 最高优先级（最快+最便宜）
  },
  aium: {
    name: 'AIUM',
    baseURL: 'https://aium.cc/v1',
    apiKey: process.env.AIUM_API_KEY || 'sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU',
    timeout: 15000,
    priority: 2,
  },
  chataiapi: {
    name: 'ChatAI API',
    baseURL: 'https://www.chataiapi.com/v1',
    apiKey: process.env.CHATAIAPI_KEY || 'sk-dXYiVkp3MihKRdWcQoBOsA5ZP3GYZPEoVjUJG0hAzPaSXK06',
    timeout: 15000,
    priority: 3,
  }
} as const

// 不同场景的模型配置
export const AI_MODELS: Record<string, UseCaseConfig> = {
  // 主力：信号摘要生成
  summary: {
    primary: { provider: 'probex', model: 'deepseek-chat' },
    fallback: { provider: 'aium', model: 'gpt-4o-mini' },
    backup: { provider: 'aium', model: 'claude-3-5-haiku-20241022' }
  },
  
  // 快速：实时快讯处理
  news: {
    primary: { provider: 'probex', model: 'deepseek-chat' },
    fallback: { provider: 'probex', model: 'Qwen2.5-72B-Instruct' }
  },
  
  // 深度：市场分析
  analysis: {
    primary: { provider: 'aium', model: 'gpt-4o-mini' },
    fallback: { provider: 'probex', model: 'deepseek-v3' },
    reasoning: { provider: 'probex', model: 'deepseek-r1' }
  },
  
  // 问答：用户交互
  qa: {
    primary: { provider: 'aium', model: 'gpt-4o-mini' },
    fallback: { provider: 'probex', model: 'Qwen2.5-72B-Instruct' }
  },
  
  // 嵌入：向量化
  embedding: {
    primary: { provider: 'aium', model: 'text-embedding-3-small' }
  },
  
  // 多模态：图像分析（可选）
  vision: {
    primary: { provider: 'chataiapi', model: 'gemini-2.0-flash' },
    fallback: { provider: 'aium', model: 'gpt-4o' }
  }
}

// AI配置
export const AI_CONFIG = {
  maxTokens: 200,
  temperature: 0.3,
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  
  // 缓存策略
  cache: {
    enabled: true,
    ttl: 86400, // 24小时
    keyPrefix: 'ai:cache:'
  },
  
  // 成本控制
  rateLimit: {
    dailyLimit: 10000,    // 每日最多10000次调用
    perSecond: 10,        // 每秒最多10次
    perMinute: 300        // 每分钟最多300次
  },
  
  // 降级策略
  fallback: {
    enableAutoFallback: true,
    useLocalTemplate: true, // 全部失败时使用本地模板
    maxFallbackAttempts: 3
  }
}

// 使用场景类型
export type AIUseCase = 'summary' | 'news' | 'analysis' | 'qa' | 'embedding' | 'vision'

