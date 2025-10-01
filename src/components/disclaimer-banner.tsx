/**
 * 免责声明横幅组件
 * 
 * 在首页和关键位置显示投资风险提示
 */

'use client'

import { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export function DisclaimerBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 检查用户是否已关闭横幅
    const dismissed = localStorage.getItem('disclaimer-dismissed')
    if (!dismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    // 记住用户已关闭（24小时后重新显示）
    localStorage.setItem('disclaimer-dismissed', Date.now().toString())
    setTimeout(() => {
      localStorage.removeItem('disclaimer-dismissed')
    }, 24 * 60 * 60 * 1000)
  }

  if (!isVisible) return null

  return (
    <div className="bg-red-500/10 border-t border-b border-red-500/30 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 text-sm">
            <p className="text-red-300 font-medium mb-1">
              <strong>⚠️ 投资风险警告</strong>
            </p>
            <p className="text-red-200/90">
              本平台<strong>仅提供信息展示</strong>，不提供买卖功能，所有内容<strong>均非投资建议</strong>，
              不做任何收益承诺。加密货币投资存在<strong>极高风险</strong>，您可能损失全部投资。
              请在充分了解风险的基础上，理性、谨慎地做出决策。
              {' '}
              <Link href="/legal/terms" className="underline hover:text-white">
                查看完整条款
              </Link>
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
            aria-label="关闭提示"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

