/**
 * 短链分享页面
 * 
 * /s/[id]
 * 
 * 展示分享的海报和资产信息
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Share2, ExternalLink, ArrowLeft } from 'lucide-react'

interface SharePageProps {
  params: {
    id: string
  }
}

// 生成动态元数据（用于社交分享）
export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const share = await prisma.share.findUnique({
    where: { id: params.id },
    include: {
      asset: {
        select: {
          symbol: true,
          name: true,
        },
      },
    },
  })

  if (!share) {
    return {
      title: '分享不存在 | HotScan',
    }
  }

  return {
    title: `${share.title} | HotScan 热点雷达`,
    description: `查看 ${share.asset.name} (${share.asset.symbol}) 的实时分析`,
    openGraph: {
      title: share.title,
      description: `${share.asset.name} 热点分析`,
      images: [
        {
          url: share.imageUrl,
          width: 1080,
          height: 1920,
          alt: share.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: share.title,
      description: `${share.asset.name} 热点分析`,
      images: [share.imageUrl],
    },
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const share = await prisma.share.findUnique({
    where: { id: params.id },
    include: {
      asset: {
        select: {
          id: true,
          symbol: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  })

  // 分享不存在或已过期
  if (!share || (share.expiresAt && share.expiresAt < new Date())) {
    notFound()
  }

  const metrics = share.metrics as any

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 返回按钮 */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>

        {/* 海报 */}
        <div className="relative aspect-[9/16] w-full bg-slate-800 rounded-lg overflow-hidden shadow-2xl mb-6">
          {share.imageUrl.startsWith('data:image') ? (
            <img
              src={share.imageUrl}
              alt={share.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={share.imageUrl}
              alt={share.title}
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* 资产信息 */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {share.asset.name}
              </h1>
              <p className="text-slate-400 text-lg">
                {share.asset.symbol}
              </p>
            </div>
            {share.asset.imageUrl && (
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700">
                <Image
                  src={share.asset.imageUrl}
                  alt={share.asset.symbol}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* 指标 */}
          {metrics && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-1">涨跌幅</div>
                <div
                  className={`text-xl font-bold ${
                    metrics.priceChangePct >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {metrics.priceChangePct >= 0 ? '+' : ''}
                  {metrics.priceChangePct?.toFixed(2)}%
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-1">风险分</div>
                <div className="text-xl font-bold text-amber-500">
                  {metrics.riskScore}/100
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-1">窗口</div>
                <div className="text-xl font-bold text-blue-400">
                  {metrics.window}
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/asset/${share.asset.id}`} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                查看详情
              </Link>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: share.title,
                    text: `查看 ${share.asset.name} 的实时分析`,
                    url: window.location.href,
                  })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  alert('链接已复制到剪贴板')
                }
              }}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              分享
            </Button>
          </div>
        </div>

        {/* 免责声明 */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <p className="text-red-400 font-medium mb-1">⚠️ 非投资建议</p>
          <p className="text-slate-400 text-sm">
            本内容仅供参考，不构成任何投资建议。投资有风险，入市需谨慎。
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          <p>Powered by HotScan 热点雷达</p>
          <p className="mt-1">
            分享于 {new Date(share.createdAt).toLocaleDateString('zh-CN')}
          </p>
          {share.expiresAt && (
            <p className="mt-1 text-xs">
              链接将于 {new Date(share.expiresAt).toLocaleDateString('zh-CN')} 过期
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

