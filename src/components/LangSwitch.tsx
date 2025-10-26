'use client'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useI18n } from './LangProvider'

export default function LangSwitch() {
  const { lang } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const go = (l:'zh'|'en')=>{
    const p = new URLSearchParams(sp.toString())
    p.set('lang', l)
    router.push(`${pathname}?${p.toString()}`)
  }
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <button 
        onClick={()=>go('zh')} 
        className={lang==='zh' ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'}
      >
        中文
      </button>
      <span className="text-muted-foreground">/</span>
      <button 
        onClick={()=>go('en')} 
        className={lang==='en' ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-foreground'}
      >
        EN
      </button>
    </div>
  )
}
