/**
 * 分享不存在页面
 */

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function ShareNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🔗❌</div>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          分享不存在或已过期
        </h1>
        
        <p className="text-slate-400 mb-8">
          此分享链接可能已被删除或超过30天有效期。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" />
              返回首页
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/learn" className="gap-2">
              <Search className="w-4 h-4" />
              术语学习
            </Link>
          </Button>
        </div>

        <p className="text-slate-500 text-sm mt-8">
          HotScan 热点雷达
        </p>
      </div>
    </div>
  )
}

