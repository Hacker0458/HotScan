import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function AssetCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        {/* 顶部 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>

        {/* 价格 */}
        <div className="flex items-baseline gap-3 mb-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* 成交量和热度 */}
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-2 w-16" />
        </div>

        {/* 底部 */}
        <div className="flex items-center justify-between pt-3 border-t">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function AssetListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <AssetCardSkeleton key={i} />
      ))}
    </div>
  )
}
