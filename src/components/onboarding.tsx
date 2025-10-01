/**
 * 新手引导组件
 * 
 * 3步引导流程：
 * 1. 浏览列表页
 * 2. 查看详情
 * 3. 生成海报
 */

'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OnboardingStep {
  id: string
  title: {
    cn: string
    en: string
  }
  description: {
    cn: string
    en: string
  }
  action?: {
    text: string
    onClick: () => void
  }
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'step-1-list',
    title: {
      cn: '📊 发现市场热点',
      en: '📊 Discover Market Hotspots',
    },
    description: {
      cn: '这是今日的热点信号列表。每张卡片展示资产名称、价格变化、成交量强度和风险评分。点击任意卡片查看详细分析。',
      en: "Today's hotspot signals. Each card shows asset name, price change, volume strength, and risk score. Tap any card for detailed analysis.",
    },
  },
  {
    id: 'step-2-detail',
    title: {
      cn: '🔍 深入分析资产',
      en: '🔍 Deep Dive Analysis',
    },
    description: {
      cn: '详情页包含关键指标网格、AI双语解读、风险因素分析。所有内容仅供参考，不构成投资建议。',
      en: 'Detail page includes key metrics, bilingual AI summary, and risk analysis. For reference only, not financial advice.',
    },
  },
  {
    id: 'step-3-poster',
    title: {
      cn: '🎨 分享你的发现',
      en: '🎨 Share Your Findings',
    },
    description: {
      cn: '点击"生成海报"按钮，生成9:16竖版海报分享到社交媒体。海报包含关键指标、AI摘要和风险提示。',
      en: 'Tap "Generate Poster" to create 9:16 vertical poster for social sharing. Includes key metrics, AI summary, and risk warnings.',
    },
  },
]

interface OnboardingProps {
  currentStep?: number
  onComplete?: () => void
  onSkip?: () => void
}

export function Onboarding({ currentStep = 0, onComplete, onSkip }: OnboardingProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [activeStep, setActiveStep] = useState(currentStep)
  const [language, setLanguage] = useState<'cn' | 'en'>('cn')

  useEffect(() => {
    // 检查用户是否已完成引导
    const hasCompletedOnboarding = localStorage.getItem('onboarding-completed')
    if (!hasCompletedOnboarding) {
      setIsVisible(true)
    }
  }, [])

  const handleNext = () => {
    if (activeStep < ONBOARDING_STEPS.length - 1) {
      setActiveStep(activeStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    localStorage.setItem('onboarding-completed', 'true')
    setIsVisible(false)
    onComplete?.()
  }

  const handleSkip = () => {
    localStorage.setItem('onboarding-completed', 'true')
    setIsVisible(false)
    onSkip?.()
  }

  if (!isVisible) return null

  const step = ONBOARDING_STEPS[activeStep]
  const isLastStep = activeStep === ONBOARDING_STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-slate-800 rounded-lg border border-slate-700 shadow-xl">
        {/* 关闭按钮 */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="关闭引导"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 内容 */}
        <div className="p-6">
          {/* 步骤指示器 */}
          <div className="flex items-center gap-2 mb-6">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index <= activeStep ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* 标题 */}
          <h2 className="text-2xl font-bold text-white mb-4">
            {step.title[language]}
          </h2>

          {/* 描述 */}
          <p className="text-slate-300 leading-relaxed mb-6">
            {step.description[language]}
          </p>

          {/* 最后一步的完成提示 */}
          {isLastStep && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                {language === 'cn'
                  ? '💡 记住：理性投资，风险自担'
                  : '💡 Remember: Invest rationally, risks are yours'}
              </p>
            </div>
          )}

          {/* 按钮组 */}
          <div className="flex items-center gap-3">
            {/* 语言切换 */}
            <button
              onClick={() => setLanguage(language === 'cn' ? 'en' : 'cn')}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {language === 'cn' ? 'English' : '中文'}
            </button>

            <div className="flex-1" />

            {/* 跳过 */}
            {!isLastStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-slate-400 hover:text-white"
              >
                {language === 'cn' ? '跳过' : 'Skip'}
              </Button>
            )}

            {/* 下一步/完成 */}
            <Button onClick={handleNext} className="gap-2">
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  {language === 'cn' ? '开始探索' : 'Start Exploring'}
                </>
              ) : (
                <>
                  {language === 'cn' ? '下一步' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* 步骤计数 */}
        <div className="px-6 py-3 bg-slate-900 rounded-b-lg border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            {language === 'cn' ? '步骤' : 'Step'} {activeStep + 1} / {ONBOARDING_STEPS.length}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * 使用示例：
 * 
 * // 在首页
 * <Onboarding 
 *   currentStep={0}
 *   onComplete={() => console.log('Onboarding completed')}
 *   onSkip={() => console.log('Onboarding skipped')}
 * />
 * 
 * // 在详情页
 * <Onboarding currentStep={1} />
 * 
 * // 在海报生成时
 * <Onboarding currentStep={2} />
 */

