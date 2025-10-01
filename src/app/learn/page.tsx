'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, BookOpen, Loader2 } from 'lucide-react'

interface LearnResponse {
  success: boolean
  data?: {
    query: string
    answer: string
    sources: Array<{
      term: string
      definition: string
      similarity: number
    }>
  }
  error?: string
}

export default function LearnPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LearnResponse | null>(null)
  const [inputError, setInputError] = useState('')

  const handleSearch = async (e?: React.FormEvent) => {
    // 阻止表单默认行为
    e?.preventDefault()
    
    // 验证输入
    const trimmedQuery = query.trim()
    if (!trimmedQuery) {
      setInputError('请输入术语')
      return
    }
    
    if (trimmedQuery.length > 50) {
      setInputError('输入过长（最多50字符）')
      return
    }
    
    setInputError('')
    setLoading(true)
    setResult(null)

    // 创建 AbortController 用于超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000) // 20秒超时

    try {
      const response = await fetch(
        `/api/learn?q=${encodeURIComponent(trimmedQuery)}`,
        { signal: controller.signal }
      )
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setResult({
            success: false,
            error: '查询超时，请稍后重试',
          })
        } else {
          setResult({
            success: false,
            error: error.message || '网络错误，请稍后重试',
          })
        }
      } else {
        setResult({
          success: false,
          error: '网络错误，请稍后重试',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickQuery = (term: string) => {
    setQuery(term)
    setInputError('')
    setResult(null)
    // 自动触发搜索
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent
      handleSearch(fakeEvent)
    }, 100)
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">术语百科</h1>
          </div>
          <p className="text-muted-foreground">
            使用 AI 驱动的智能问答，快速了解加密货币和 DeFi 相关术语
          </p>
        </div>

        {/* 搜索框 */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="输入术语或问题，如：流动性锁仓、Rug Pull..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setInputError('')
                  }}
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading || !query.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {inputError && (
                <div className="text-sm text-red-500">{inputError}</div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* 快捷查询 */}
        {!result && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">热门术语</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  '流动性锁仓',
                  'AMM',
                  'Rug Pull',
                  '无常损失',
                  '滑点',
                  '做市商',
                  '质押',
                  'TVL',
                  '闪电贷',
                  '鲸鱼地址',
                ].map((term) => (
                  <Badge
                    key={term}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleQuickQuery(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 查询结果 */}
        {result && (
          <>
            {result.success && result.data ? (
              <div className="space-y-4">
                {/* AI 解答 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI 解答</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="leading-relaxed whitespace-pre-wrap">{result.data.answer}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* 相关术语 */}
                {result.data.sources && result.data.sources.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">相关术语</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.data.sources.map((source, idx) => (
                          <div key={idx} className="space-y-2 pb-4 border-b last:border-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{source.term}</h3>
                              <Badge variant="outline" className="text-xs">
                                相似度 {(source.similarity * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{source.definition}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-red-500">
                    {result.error || '查询失败，请稍后重试'}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* 免责声明 */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            ⚠️ 术语解释仅供学习参考，不构成投资建议。请独立思考，谨慎决策。
          </p>
        </div>
      </div>
    </div>
  )
}

