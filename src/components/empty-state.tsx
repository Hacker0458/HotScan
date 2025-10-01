import { TrendingUp, Search, BookOpen, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  type: 'assets' | 'signals' | 'terms' | 'bookmarks'
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const config = getEmptyStateConfig(type)

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 rounded-full bg-muted p-6">
        <config.icon className="h-12 w-12 text-muted-foreground" />
      </div>
      
      <h3 className="mb-2 text-lg font-semibold">
        {title || config.title}
      </h3>
      
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description || config.description}
      </p>

      {(actionLabel || config.actionLabel) && (
        <Button onClick={onAction || config.onAction}>
          {actionLabel || config.actionLabel}
        </Button>
      )}
    </div>
  )
}

function getEmptyStateConfig(type: EmptyStateProps['type']) {
  const configs = {
    assets: {
      icon: TrendingUp,
      title: '暂无资产数据',
      description: '还没有资产数据，请稍后再试或运行数据抓取任务',
      actionLabel: '刷新页面',
      onAction: () => window.location.reload(),
    },
    signals: {
      icon: Search,
      title: '暂无信号',
      description: '还没有 AI 生成的信号，请等待系统分析或手动触发',
      actionLabel: '查看资产',
      onAction: () => (window.location.href = '/'),
    },
    terms: {
      icon: BookOpen,
      title: '术语库为空',
      description: '还没有术语数据，请先运行术语嵌入任务',
      actionLabel: '了解更多',
      onAction: () => {},
    },
    bookmarks: {
      icon: Inbox,
      title: '还没有订阅',
      description: '浏览热点资产并订阅感兴趣的内容，方便随时查看',
      actionLabel: '浏览热点',
      onAction: () => (window.location.href = '/'),
    },
  }

  return configs[type]
}
