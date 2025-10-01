/**
 * 分享海报 API
 * 
 * POST /api/share
 * 
 * 创建分享记录，返回短链ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const shareSchema = z.object({
  assetId: z.string(),
  title: z.string().min(1).max(200),
  imageUrl: z.string().url().or(z.string().startsWith('data:image')),
  metrics: z.object({
    priceChangePct: z.number(),
    riskScore: z.number().int().min(0).max(100),
    window: z.string(),
  }).optional(),
  template: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = shareSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: validation.error.errors,
        },
        { status: 400 }
      )
    }
    
    const { assetId, title, imageUrl, metrics, template } = validation.data
    
    // 生成短链ID（8字符）
    const shareId = nanoid(8)
    
    // 创建分享记录
    const share = await prisma.share.create({
      data: {
        id: shareId,
        assetId,
        title,
        imageUrl,
        metrics: metrics || {},
        template: template || 'default',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
      },
    })
    
    return NextResponse.json({
      success: true,
      data: {
        shareId: share.id,
        shareUrl: `/s/${share.id}`,
        expiresAt: share.expiresAt,
      },
    })
  } catch (error) {
    console.error('Share API error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

