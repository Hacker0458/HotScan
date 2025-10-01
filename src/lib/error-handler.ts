/**
 * 统一错误处理器
 * 
 * 处理各种类型的错误并返回标准化的响应
 */

import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

/**
 * 自定义API错误
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 统一错误处理函数
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Zod验证错误
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        message: '请求参数验证失败',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      },
      { status: 400 }
    )
  }

  // Prisma已知错误
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error)
  }

  // Prisma验证错误
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        error: 'Database validation error',
        message: '数据库验证失败',
      },
      { status: 400 }
    )
  }

  // 自定义API错误
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.name,
        message: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    )
  }

  // OpenAI错误
  if (error && typeof error === 'object' && 'status' in error) {
    return handleOpenAIError(error as any)
  }

  // 网络超时
  if (error instanceof Error && error.name === 'AbortError') {
    return NextResponse.json(
      {
        error: 'Request timeout',
        message: '请求超时，请稍后重试',
      },
      { status: 408 }
    )
  }

  // 未知错误
  return NextResponse.json(
    {
      error: 'Internal server error',
      message:
        error instanceof Error
          ? error.message
          : '服务器内部错误，请稍后重试',
    },
    { status: 500 }
  )
}

/**
 * 处理Prisma错误
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError
): NextResponse {
  switch (error.code) {
    case 'P2002':
      return NextResponse.json(
        {
          error: 'Unique constraint violation',
          message: '记录已存在',
          field: (error.meta?.target as string[]) || [],
        },
        { status: 409 }
      )

    case 'P2025':
      return NextResponse.json(
        {
          error: 'Record not found',
          message: '记录不存在',
        },
        { status: 404 }
      )

    case 'P2003':
      return NextResponse.json(
        {
          error: 'Foreign key constraint failed',
          message: '关联记录不存在',
        },
        { status: 400 }
      )

    case 'P2014':
      return NextResponse.json(
        {
          error: 'Invalid relation',
          message: '无效的关联关系',
        },
        { status: 400 }
      )

    case 'P2021':
      return NextResponse.json(
        {
          error: 'Table does not exist',
          message: '数据表不存在',
        },
        { status: 500 }
      )

    case 'P2024':
      return NextResponse.json(
        {
          error: 'Connection timeout',
          message: '数据库连接超时',
        },
        { status: 503 }
      )

    default:
      return NextResponse.json(
        {
          error: 'Database error',
          message: '数据库操作失败',
          code: error.code,
        },
        { status: 500 }
      )
  }
}

/**
 * 处理OpenAI错误
 */
function handleOpenAIError(error: any): NextResponse {
  const status = error.status || 500

  // 速率限制
  if (status === 429) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'AI服务请求过于频繁，请稍后再试',
      },
      { status: 429 }
    )
  }

  // 无效的API密钥
  if (status === 401) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'AI服务认证失败',
      },
      { status: 500 } // 对外隐藏内部错误
    )
  }

  // 配额不足
  if (status === 402) {
    return NextResponse.json(
      {
        error: 'Insufficient quota',
        message: 'AI服务配额不足，请稍后重试',
      },
      { status: 503 }
    )
  }

  // 内容过滤
  if (status === 400 && error.code === 'content_filter') {
    return NextResponse.json(
      {
        error: 'Content filtered',
        message: '请求内容不符合使用政策',
      },
      { status: 400 }
    )
  }

  // 模型不可用
  if (status === 503) {
    return NextResponse.json(
      {
        error: 'Service unavailable',
        message: 'AI服务暂时不可用，请稍后重试',
      },
      { status: 503 }
    )
  }

  // 其他错误
  return NextResponse.json(
    {
      error: 'AI service error',
      message: 'AI服务出现错误，请稍后重试',
    },
    { status: 500 }
  )
}

/**
 * 错误日志记录
 */
export function logError(error: unknown, context?: Record<string, any>) {
  const timestamp = new Date().toISOString()
  const errorInfo = {
    timestamp,
    context,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
  }

  console.error('Error Log:', JSON.stringify(errorInfo, null, 2))

  // 这里可以集成第三方错误追踪服务
  // 例如: Sentry.captureException(error, { extra: context })
}

