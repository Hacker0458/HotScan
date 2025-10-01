#!/usr/bin/env tsx

/**
 * Post-Deployment Health Check Script
 * 
 * 验证 HotScan 生产环境部署是否成功
 * 
 * Usage:
 *   PROD_URL=https://hotscan-xxx.vercel.app pnpm tsx scripts/post-deploy-check.ts
 */

interface CheckResult {
  name: string
  endpoint: string
  status: 'pass' | 'fail'
  statusCode?: number
  duration: number
  error?: string
  data?: any
}

async function checkEndpoint(
  name: string,
  url: string,
  validator: (data: any) => boolean
): Promise<CheckResult> {
  const startTime = Date.now()
  
  try {
    console.log(`\n🔍 Checking: ${name}`)
    console.log(`   URL: ${url}`)
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10s timeout
    })
    
    const duration = Date.now() - startTime
    const statusCode = response.status
    
    if (statusCode !== 200) {
      const text = await response.text()
      return {
        name,
        endpoint: url,
        status: 'fail',
        statusCode,
        duration,
        error: `HTTP ${statusCode}: ${text.substring(0, 200)}`,
      }
    }
    
    const data = await response.json()
    const isValid = validator(data)
    
    if (!isValid) {
      return {
        name,
        endpoint: url,
        status: 'fail',
        statusCode,
        duration,
        error: 'Response validation failed',
        data: JSON.stringify(data).substring(0, 200),
      }
    }
    
    console.log(`   ✅ PASS (${duration}ms)`)
    
    return {
      name,
      endpoint: url,
      status: 'pass',
      statusCode,
      duration,
      data,
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.log(`   ❌ FAIL (${duration}ms)`)
    console.log(`   Error: ${error.message}`)
    
    return {
      name,
      endpoint: url,
      status: 'fail',
      duration,
      error: error.message,
    }
  }
}

async function main() {
  const prodUrl = process.env.PROD_URL
  
  if (!prodUrl) {
    console.error('❌ Error: PROD_URL environment variable not set')
    console.error('Usage: PROD_URL=https://your-domain.vercel.app pnpm tsx scripts/post-deploy-check.ts')
    process.exit(1)
  }
  
  console.log('╔═══════════════════════════════════════════════════════════════════╗')
  console.log('║           🚀 HotScan Post-Deployment Health Check                 ║')
  console.log('╚═══════════════════════════════════════════════════════════════════╝')
  console.log(`\n🌐 Production URL: ${prodUrl}`)
  console.log(`⏰ Started at: ${new Date().toISOString()}\n`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const results: CheckResult[] = []
  
  // Check 1: API Signals
  results.push(
    await checkEndpoint(
      'Signals API',
      `${prodUrl}/api/signals?limit=3`,
      (data) => {
        return (
          data.success === true &&
          Array.isArray(data.data) &&
          data.data.length > 0 &&
          data.data[0].asset &&
          typeof data.data[0].riskScore === 'number'
        )
      }
    )
  )
  
  // Check 2: RAG Learn API
  results.push(
    await checkEndpoint(
      'Learn API (RAG)',
      `${prodUrl}/api/learn?q=滑点`,
      (data) => {
        return (
          data.success === true &&
          data.data &&
          typeof data.data.answer === 'string' &&
          data.data.answer.length > 0
        )
      }
    )
  )
  
  // Check 3: Homepage
  results.push(
    await checkEndpoint(
      'Homepage',
      `${prodUrl}/`,
      (data) => {
        const html = typeof data === 'string' ? data : JSON.stringify(data)
        return html.includes('热点雷达') || html.includes('今日热点') || html.includes('HotScan')
      }
    )
  )
  
  // Check 4: Analytics Page
  results.push(
    await checkEndpoint(
      'Analytics Page',
      `${prodUrl}/analytics`,
      (data) => {
        const html = typeof data === 'string' ? data : JSON.stringify(data)
        return html.includes('Analytics') || html.includes('Signals') || html.includes('统计')
      }
    )
  )
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Summary')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  const passed = results.filter((r) => r.status === 'pass').length
  const failed = results.filter((r) => r.status === 'fail').length
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)
  
  console.log(`✅ Passed: ${passed}/${results.length}`)
  console.log(`❌ Failed: ${failed}/${results.length}`)
  console.log(`⏱️  Total duration: ${totalDuration}ms`)
  console.log(`🕐 Completed at: ${new Date().toISOString()}\n`)
  
  // Detailed failures
  if (failed > 0) {
    console.log('❌ Failed Checks:\n')
    results
      .filter((r) => r.status === 'fail')
      .forEach((r) => {
        console.log(`   ${r.name}:`)
        console.log(`   - Endpoint: ${r.endpoint}`)
        console.log(`   - Status: ${r.statusCode || 'N/A'}`)
        console.log(`   - Error: ${r.error}`)
        if (r.data) {
          console.log(`   - Data: ${r.data}`)
        }
        console.log('')
      })
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  if (failed > 0) {
    console.log('💡 Troubleshooting:')
    console.log('   1. Check Vercel deployment logs')
    console.log('   2. Verify all environment variables are set')
    console.log('   3. Ensure database migrations are applied')
    console.log('   4. Run data fetching jobs manually')
    console.log('')
    process.exit(1)
  } else {
    console.log('✨ All checks passed! Deployment is healthy.')
    console.log('')
    process.exit(0)
  }
}

main().catch((error) => {
  console.error('\n💥 Fatal error:', error)
  process.exit(1)
})

