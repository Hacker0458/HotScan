import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const jobToken = process.env.JOB_TOKEN
  
  return NextResponse.json({
    hasJobToken: !!jobToken,
    tokenLength: jobToken?.length || 0,
    tokenPrefix: jobToken?.substring(0, 8) || 'none',
    allEnvKeys: Object.keys(process.env).filter(k => 
      k.includes('JOB') || k.includes('TOKEN') || k.includes('NEXTAUTH')
    )
  })
}


