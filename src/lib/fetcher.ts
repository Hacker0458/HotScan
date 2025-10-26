/**
 * API 请求封装
 * 自动透传当前 URL 的查询参数（包含 lang）
 */
export async function apiGet(path: string) {
  const base = path.startsWith('http') ? path : path
  const hasQuery = base.includes('?')
  
  // 带上当前 URL 的查询字符串（包含 lang）
  const extra = typeof window !== 'undefined' 
    ? window.location.search.replace(/^\?/, '') 
    : ''
  
  const url = extra ? `${base}${hasQuery?'&':'?'}${extra}` : base
  
  const res = await fetch(url, { 
    next: { revalidate: 0 },
    cache: 'no-store' 
  })
  
  if (!res.ok) {
    const text = await res.text().catch(()=>res.statusText)
    throw new Error(`${res.status} ${text}`)
  }
  
  return res.json()
}
