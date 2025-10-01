import { NextRequest, NextResponse } from 'next/server'
import { fetchTickers } from '@/jobs/fetch-tickers'
import { makeSignals } from '@/jobs/make-signals'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

/**
 * Protected Job Runner API
 * 
 * 用于 Vercel Cron Jobs 触发定时任务
 * 需要 JOB_TOKEN 环境变量进行身份验证
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 1. 验证 JOB_TOKEN
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.JOB_TOKEN
    
    if (!expectedToken) {
      console.error('[Job Runner] JOB_TOKEN not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    
    const providedToken = authHeader?.replace('Bearer ', '')
    
    if (providedToken !== expectedToken) {
      console.error('[Job Runner] Invalid token')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔄 Job Runner Started')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // 2. 运行 fetch-tickers
    console.log('\n📡 Step 1: Fetching tickers...')
    const fetchResult = await fetchTickers()
    console.log(`✅ Fetch completed:`, {
      assetsCreated: fetchResult.assetsCreated,
      assetsUpdated: fetchResult.assetsUpdated,
      pairsCreated: fetchResult.pairsCreated,
    })
    
    // 3. 运行 make-signals
    console.log('\n📊 Step 2: Making signals...')
    const signalsResult = await makeSignals()
    console.log(`✅ Signals completed:`, {
      signalsCreated: signalsResult.signalsCreated,
    })
    
    const duration = Date.now() - startTime
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Job Runner Completed')
    console.log(`⏱️  Total duration: ${(duration / 1000).toFixed(2)}s`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // 4. 返回结果
    return NextResponse.json({
      success: true,
      duration,
      results: {
        fetch: {
          assetsCreated: fetchResult.assetsCreated,
          assetsUpdated: fetchResult.assetsUpdated,
          pairsCreated: fetchResult.pairsCreated,
        },
        signals: {
          signalsCreated: signalsResult.signalsCreated,
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    const duration = Date.now() - startTime
    
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ Job Runner Failed')
    console.error(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`)
    console.error('Error:', error.message)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'Job runner is ready. Use POST with JOB_TOKEN to execute jobs.',
  })
}

