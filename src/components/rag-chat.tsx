'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Send, Sparkles, BookOpen, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{
    term: string
    definition: string
    category: string
  }>
  relatedTerms?: string[]
}

const SUGGESTED_QUESTIONS = [
  '什么是市盈率？',
  'P/E Ratio 如何计算？',
  '支撑位是什么意思？',
  '如何理解相对强弱指数？',
  'DeFi 和传统金融有什么区别？',
]

export function RAGChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (question?: string) => {
    const messageText = question || input.trim()
    if (!messageText || isLoading) return

    // 添加用户消息
    const userMessage: Message = { role: 'user', content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // 调用 API
    setIsLoading(true)
    try {
      const response = await fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageText }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.data.answer,
          sources: data.data.sources,
          relatedTerms: data.data.relatedTerms,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || '问答失败')
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: '抱歉，问答服务暂时不可用，请稍后再试。',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px]">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI 术语问答助手
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            基于 RAG 技术的金融术语智能问答
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">开始学习金融术语</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  问我任何金融相关的问题，我会基于术语库为你提供专业解答
                </p>

                {/* 建议问题 */}
                <div className="space-y-2 w-full max-w-md">
                  <p className="text-xs text-muted-foreground mb-3">试试这些问题：</p>
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => handleSendMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>正在思考...</span>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="flex-shrink-0 border-t p-4">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题... (Enter 发送, Shift+Enter 换行)"
                className="flex-1 min-h-[44px] max-h-32 px-3 py-2 text-sm rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={1}
              />
              <Button
                size="icon"
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              由 GPT-4 驱动 · 基于术语向量数据库
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 space-y-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {/* 消息内容 */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {/* 知识来源 */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <p className="text-xs font-semibold opacity-70">知识来源</p>
            <div className="space-y-2">
              {message.sources.slice(0, 3).map((source, index) => (
                <div
                  key={index}
                  className="text-xs p-2 rounded-lg bg-background/50 border border-border/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{source.term}</span>
                    <Badge variant="secondary" className="text-xs">
                      {source.category}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">
                    {source.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 相关术语 */}
        {!isUser && message.relatedTerms && message.relatedTerms.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            <span className="text-xs opacity-70 mr-1">相关术语:</span>
            {message.relatedTerms.map((term, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {term}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
