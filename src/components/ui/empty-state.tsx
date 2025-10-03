import { LucideIcon, Inbox, AlertCircle, RefreshCcw } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export function NoSignalsState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={Inbox}
      title="No signals available"
      description="There are no market signals matching your filters. Try adjusting your search or come back later."
      action={{
        label: 'Retry',
        onClick: onRetry,
      }}
    />
  )
}

export function ErrorState({ onRetry, message }: { onRetry: () => void; message?: string }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="Failed to load signals"
      description={message || 'An error occurred while fetching data. Please try again.'}
      action={{
        label: 'Retry',
        onClick: onRetry,
      }}
    />
  )
}

