/**
 * 法律文档布局组件
 */

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface LegalLayoutProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-400">最后更新：{lastUpdated}</p>
        </div>

        {/* 内容 */}
        <div className="prose prose-invert prose-slate max-w-none">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700">
            {children}
          </div>
        </div>

        {/* 底部链接 */}
        <div className="mt-8 pt-8 border-t border-slate-700 flex justify-center gap-6 text-sm">
          <Link href="/legal/terms" className="text-slate-400 hover:text-white transition-colors">
            服务条款
          </Link>
          <Link href="/legal/privacy" className="text-slate-400 hover:text-white transition-colors">
            隐私政策
          </Link>
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}

