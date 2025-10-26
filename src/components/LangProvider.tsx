'use client'
import React, {createContext, useContext, useMemo} from 'react'
import {dict, pickLang, type Lang} from '@/lib/i18n'
import {useSearchParams} from 'next/navigation'

type Ctx = { lang: Lang; t: (k: keyof typeof dict['zh']) => string }
const C = createContext<Ctx>({ lang: 'zh', t: (k) => dict.zh[k] })

export function useI18n(){ return useContext(C) }

export default function LangProvider({children}:{children:React.ReactNode}){
  const sp = useSearchParams()
  const lang = useMemo(()=> pickLang(sp.get('lang') || (typeof navigator!=='undefined'?navigator.language:'zh')), [sp])
  const value = useMemo(()=>({ lang, t:(k:keyof typeof dict['zh']) => dict[lang][k] }),[lang])
  return <C.Provider value={value}>{children}</C.Provider>
}
