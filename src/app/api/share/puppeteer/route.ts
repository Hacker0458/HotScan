/**
 * Puppeteer 截图 API（可选）
 * 
 * POST /api/share/puppeteer
 * 
 * 使用无头浏览器截取海报
 * 
 * 注意：需要安装 puppeteer
 * npm install puppeteer
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const screenshotSchema = z.object({
  url: z.string().url(),
  width: z.number().int().min(100).max(4000).default(1080),
  height: z.number().int().min(100).max(8000).default(1920),
})

export async function POST(request: NextRequest) {
  try {
    // 检查是否安装了puppeteer
    let puppeteer: any
    try {
      puppeteer = await import('puppeteer')
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Puppeteer not installed',
          message: 'Please install puppeteer: npm install puppeteer',
        },
        { status: 501 }
      )
    }

    const body = await request.json()
    const validation = screenshotSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }
    
    const { url, width, height } = validation.data
    
    // 启动浏览器
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    
    try {
      const page = await browser.newPage()
      
      // 设置视口
      await page.setViewport({
        width,
        height,
        deviceScaleFactor: 2, // 高清截图
      })
      
      // 访问页面
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 10000,
      })
      
      // 截图
      const screenshot = await page.screenshot({
        type: 'png',
        encoding: 'base64',
      })
      
      return NextResponse.json({
        success: true,
        data: {
          imageUrl: `data:image/png;base64,${screenshot}`,
          width,
          height,
        },
      })
    } finally {
      await browser.close()
    }
  } catch (error) {
    console.error('Puppeteer screenshot error:', error)
    
    return NextResponse.json(
      {
        error: 'Screenshot failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // Vercel: 最长30秒

