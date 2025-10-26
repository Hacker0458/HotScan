'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function LangSwitch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') || 'zh'

  const switchLang = (newLang: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('lang', newLang)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button 
        onClick={() => switchLang('zh')} 
        className={`transition-all ${lang === 'zh' ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        中文
      </button>
      <span className="text-muted-foreground">/</span>
      <button 
        onClick={() => switchLang('en')} 
        className={`transition-all ${lang === 'en' ? 'font-bold text-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        EN
      </button>
    </div>
  )
}

