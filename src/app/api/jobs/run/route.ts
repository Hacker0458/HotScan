import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') || ''
  const JOB_TOKEN = process.env.JOB_TOKEN || ''
  
  if (!JOB_TOKEN) {
    return NextResponse.json({ ok: false, error: 'JOB_TOKEN not set' }, { status: 500 })
  }
  
  if (token !== JOB_TOKEN) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  
  const started = Date.now()
  
  try {
    // 动态导入并执行 fetch-tickers
    const { fetchTickers } = await import('@/jobs/fetch-tickers')
    const r1 = await fetchTickers()
    
    // 动态导入并执行 make-signals
    const { makeSignals } = await import('@/jobs/make-signals')
    const r2 = await makeSignals()
    
    return NextResponse.json({ 
      ok: true, 
      tookMs: Date.now() - started, 
      fetch: r1, 
      make: r2 
    })
  } catch (e: any) {
    console.error('Job execution error:', e)
    return NextResponse.json({ 
      ok: false, 
      error: e?.message || String(e) 
    }, { status: 500 })
  }
}
