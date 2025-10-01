/**
 * 页脚免责声明组件
 */

import Link from 'next/link'

export function FooterDisclaimer() {
  return (
    <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* 免责声明 */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-red-400 font-bold mb-2">重要声明</h3>
              <p className="text-red-300/90 text-sm leading-relaxed">
                本平台<strong>仅提供信息展示服务</strong>，不提供任何买卖、交易功能。
                所有内容<strong>均非投资建议</strong>，不构成任何投资推荐，
                <strong>不做任何收益承诺</strong>。加密货币投资存在<strong>极高风险</strong>，
                您可能损失全部投资。数据可能存在延迟、错误或不完整。
                请您在充分了解风险的基础上，理性、谨慎地做出投资决策。
              </p>
            </div>
          </div>
        </div>

        {/* 链接区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* 关于我们 */}
          <div>
            <h4 className="text-white font-semibold mb-3">关于HotScan</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-white transition-colors">
                  服务条款
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-white transition-colors">
                  隐私政策
                </Link>
              </li>
            </ul>
          </div>

          {/* 功能特性 */}
          <div>
            <h4 className="text-white font-semibold mb-3">功能特性</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>信号分析（仅展示）</li>
              <li>RAG术语问答</li>
              <li>海报生成分享</li>
              <li>数据可视化</li>
            </ul>
          </div>

          {/* 联系我们 */}
          <div>
            <h4 className="text-white font-semibold mb-3">联系我们</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>邮箱：hello@hotscan.app</li>
              <li>法务：legal@hotscan.app</li>
              <li>
                <a 
                  href="https://github.com/hotscan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="pt-6 border-t border-slate-700 text-center text-sm text-slate-500">
          <p>© 2024 HotScan. All rights reserved.</p>
          <p className="mt-1">
            Made with ❤️ by HotScan Team | 
            <Link href="/legal/terms" className="hover:text-slate-400 ml-1">
              Terms
            </Link>
            {' | '}
            <Link href="/legal/privacy" className="hover:text-slate-400">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

