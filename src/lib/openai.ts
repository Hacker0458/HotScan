import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
  timeout: 20000, // 20 seconds timeout
  maxRetries: 2,   // Retry up to 2 times with exponential backoff
})

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

export async function analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是一个情感分析专家。分析给定文本的情感倾向，只返回 positive、negative 或 neutral 其中之一。',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0,
    })

    const result = response.choices[0]?.message?.content?.toLowerCase().trim()
    
    if (result?.includes('positive')) return 'positive'
    if (result?.includes('negative')) return 'negative'
    return 'neutral'
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    return 'neutral'
  }
}

export async function extractKeywords(text: string, maxKeywords = 5): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `你是一个关键词提取专家。从给定文本中提取最多 ${maxKeywords} 个最重要的关键词，以 JSON 数组格式返回。`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(response.choices[0]?.message?.content || '{"keywords":[]}')
    return result.keywords || []
  } catch (error) {
    console.error('Error extracting keywords:', error)
    return []
  }
}

export async function generateSummary(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是一个文本摘要专家。用简洁的语言总结给定文本的核心内容，不超过 200 字。',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
    })

    return response.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error generating summary:', error)
    return ''
  }
}
