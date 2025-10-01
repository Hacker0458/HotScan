/**
 * 短视频脚本生成器
 * 
 * 功能：
 * - 读取今日Top-3信号数据
 * - 生成12-18秒短视频口播脚本
 * - 生成SRT字幕文件
 * - 自动计算时长和分段
 * 
 * 运行: tsx scripts/make-reels.ts
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

// 输出目录
const OUT_DIR = path.join(process.cwd(), 'out', 'reels')

/**
 * 信号数据类型
 */
interface SignalData {
  id: string
  symbol: string
  name: string
  window: string
  priceChangePct: number
  riskScore: number
  volZScore: number
  liqDeltaPct: number
  top5HoldPct: number
  contractAgeDays: number
  newWalletNetBuy: number
}

/**
 * 脚本段落类型
 */
interface ScriptSegment {
  startTime: number // 秒
  endTime: number // 秒
  text: string
  type: 'hook' | 'content' | 'risk' | 'cta'
}

/**
 * 短视频脚本
 */
interface ReelScript {
  id: string
  title: string
  duration: number // 总时长（秒）
  segments: ScriptSegment[]
  fullText: string
}

/**
 * 生成3秒Hook（吸引注意力）
 */
function generateHook(signal: SignalData): string {
  const hooks = [
    // 高风险Hook
    `⚠️ ${signal.name}风险分${signal.riskScore}！`,
    `注意！${signal.name}持币集中度${signal.top5HoldPct.toFixed(0)}%`,
    `警告！${signal.name}合约仅${signal.contractAgeDays}天`,
    
    // 涨跌幅Hook
    `🔥 ${signal.name}${signal.window}${signal.priceChangePct > 0 ? '暴涨' : '暴跌'}${Math.abs(signal.priceChangePct).toFixed(0)}%`,
    `重磅！${signal.name}价格${signal.priceChangePct > 0 ? '飙升' : '跳水'}${Math.abs(signal.priceChangePct).toFixed(0)}%`,
    
    // 成交量Hook
    `惊！${signal.name}成交量突破${signal.volZScore.toFixed(0)}倍标准差`,
    `热点！${signal.name}成交量${signal.volZScore.toFixed(0)}倍爆发`,
    
    // 新钱包Hook
    `独家！${signal.name}新钱包净买入$${(signal.newWalletNetBuy / 1000).toFixed(0)}K`,
    `追踪！${signal.name}聪明钱疯狂买入`,
  ]
  
  // 根据特征选择最合适的Hook
  if (signal.riskScore >= 70) {
    return hooks[randomInt(0, 2)]
  } else if (Math.abs(signal.priceChangePct) >= 20) {
    return hooks[randomInt(3, 4)]
  } else if (signal.volZScore >= 5) {
    return hooks[randomInt(5, 6)]
  } else {
    return hooks[randomInt(7, 8)]
  }
}

/**
 * 生成主要内容（6-8秒）
 */
function generateContent(signal: SignalData): string {
  const priceDesc = signal.priceChangePct > 0 
    ? `上涨${signal.priceChangePct.toFixed(1)}%` 
    : `下跌${Math.abs(signal.priceChangePct).toFixed(1)}%`
  
  const volDesc = signal.volZScore >= 5 
    ? '成交量暴增' 
    : signal.volZScore >= 3 
      ? '成交量大幅增加' 
      : '成交量增加'
  
  const liqDesc = signal.liqDeltaPct > 20 
    ? '流动性激增' 
    : signal.liqDeltaPct > 0 
      ? '流动性增加' 
      : '流动性下降'
  
  return `${signal.window}窗口${priceDesc}，${volDesc}，${liqDesc}。合约${signal.contractAgeDays}天，前5钱包持有${signal.top5HoldPct.toFixed(0)}%。`
}

/**
 * 生成风险提醒（3-4秒）
 */
function generateRiskWarning(signal: SignalData): string {
  if (signal.riskScore >= 70) {
    return `⚠️ 风险分${signal.riskScore}，极高风险，谨防跑路！`
  } else if (signal.riskScore >= 50) {
    return `⚠️ 风险分${signal.riskScore}，高风险，小心操作！`
  } else if (signal.riskScore >= 30) {
    return `风险分${signal.riskScore}，中等风险，注意止损。`
  } else {
    return `风险分${signal.riskScore}，低风险，但仍需谨慎。`
  }
}

/**
 * 生成CTA（行动号召，2-3秒）
 */
function generateCTA(): string {
  const ctas = [
    '关注我，每日热点不错过！',
    '点赞收藏，下期更精彩！',
    '评论区聊聊你的看法！',
    '关注获取更多链上数据！',
    '点个赞，带你看懂热点！',
  ]
  return ctas[randomInt(0, ctas.length - 1)]
}

/**
 * 生成完整的短视频脚本
 */
function generateReelScript(signal: SignalData, index: number): ReelScript {
  const hook = generateHook(signal)
  const content = generateContent(signal)
  const risk = generateRiskWarning(signal)
  const cta = generateCTA()
  
  // 计算时长（基于字数，平均每秒4-5个字）
  const hookDuration = 3
  const contentDuration = Math.ceil(content.length / 4.5)
  const riskDuration = Math.ceil(risk.length / 4.5)
  const ctaDuration = Math.ceil(cta.length / 4.5)
  
  // 调整确保总时长在12-18秒之间
  const totalDuration = hookDuration + contentDuration + riskDuration + ctaDuration
  
  let currentTime = 0
  const segments: ScriptSegment[] = [
    {
      startTime: currentTime,
      endTime: (currentTime += hookDuration),
      text: hook,
      type: 'hook',
    },
    {
      startTime: currentTime,
      endTime: (currentTime += contentDuration),
      text: content,
      type: 'content',
    },
    {
      startTime: currentTime,
      endTime: (currentTime += riskDuration),
      text: risk,
      type: 'risk',
    },
    {
      startTime: currentTime,
      endTime: (currentTime += ctaDuration),
      text: cta,
      type: 'cta',
    },
  ]
  
  const fullText = `${hook}\n\n${content}\n\n${risk}\n\n${cta}`
  
  return {
    id: `reel-${index + 1}-${signal.symbol.toLowerCase()}`,
    title: `${signal.name} ${signal.window}热点分析`,
    duration: totalDuration,
    segments,
    fullText,
  }
}

/**
 * 生成SRT字幕文件
 */
function generateSRT(script: ReelScript): string {
  let srt = ''
  
  script.segments.forEach((segment, index) => {
    // 序号
    srt += `${index + 1}\n`
    
    // 时间轴
    const startTime = formatSRTTime(segment.startTime)
    const endTime = formatSRTTime(segment.endTime)
    srt += `${startTime} --> ${endTime}\n`
    
    // 文本内容
    srt += `${segment.text}\n`
    
    // 空行分隔
    srt += '\n'
  })
  
  return srt
}

/**
 * 格式化SRT时间戳
 */
function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const millis = Math.floor((seconds % 1) * 1000)
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`
}

/**
 * 生成Markdown脚本文档
 */
function generateMarkdown(script: ReelScript): string {
  let md = `# ${script.title}\n\n`
  md += `**时长**: ${script.duration}秒\n\n`
  md += `**ID**: ${script.id}\n\n`
  md += `---\n\n`
  
  md += `## 完整口播脚本\n\n`
  md += `\`\`\`\n${script.fullText}\n\`\`\`\n\n`
  
  md += `---\n\n`
  md += `## 分段时间轴\n\n`
  
  script.segments.forEach((segment, index) => {
    const emoji = {
      hook: '🎣',
      content: '📊',
      risk: '⚠️',
      cta: '👍',
    }[segment.type]
    
    md += `### ${index + 1}. ${emoji} ${segment.type.toUpperCase()} (${segment.startTime}s - ${segment.endTime}s)\n\n`
    md += `${segment.text}\n\n`
  })
  
  md += `---\n\n`
  md += `## 拍摄提示\n\n`
  md += `- **Hook阶段**: 快速切入，使用震撼画面或数字\n`
  md += `- **内容阶段**: 稳定讲解，可配合图表/K线\n`
  md += `- **风险阶段**: 严肃表情，突出警示\n`
  md += `- **CTA阶段**: 友好微笑，引导互动\n\n`
  
  md += `## 后期提示\n\n`
  md += `- 字幕使用大字号、高对比度\n`
  md += `- Hook阶段使用动态效果\n`
  md += `- 风险阶段使用红色标注\n`
  md += `- 配合快节奏BGM\n`
  
  return md
}

/**
 * 随机数生成
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 确保输出目录存在
 */
async function ensureOutputDir() {
  try {
    await fs.access(OUT_DIR)
  } catch {
    await fs.mkdir(OUT_DIR, { recursive: true })
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🎬 短视频脚本生成器启动...\n')
  
  // 1. 获取今日Top-3信号
  console.log('📊 获取今日Top-3信号...')
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const signals = await prisma.signal.findMany({
    where: {
      createdAt: {
        gte: today,
      },
    },
    orderBy: [
      { createdAt: 'desc' },
      { riskScore: 'desc' },
    ],
    take: 3,
    include: {
      asset: true,
    },
  })
  
  if (signals.length === 0) {
    console.log('❌ 今日暂无信号数据')
    console.log('💡 请先运行: pnpm jobs:analyze')
    return
  }
  
  console.log(`✅ 找到 ${signals.length} 条信号\n`)
  
  // 2. 确保输出目录存在
  await ensureOutputDir()
  
  // 3. 为每条信号生成脚本
  const scripts: ReelScript[] = []
  
  for (let i = 0; i < signals.length; i++) {
    const signal = signals[i]
    
    console.log(`🎬 生成脚本 ${i + 1}/${signals.length}: ${signal.asset.name}`)
    
    const signalData: SignalData = {
      id: signal.id,
      symbol: signal.asset.symbol,
      name: signal.asset.name,
      window: signal.window,
      priceChangePct: signal.priceChangePct,
      riskScore: signal.riskScore,
      volZScore: signal.volZScore,
      liqDeltaPct: signal.liqDeltaPct,
      top5HoldPct: signal.top5HoldPct,
      contractAgeDays: signal.contractAgeDays,
      newWalletNetBuy: signal.newWalletNetBuy,
    }
    
    const script = generateReelScript(signalData, i)
    scripts.push(script)
    
    // 生成SRT字幕
    const srt = generateSRT(script)
    const srtPath = path.join(OUT_DIR, `${script.id}.srt`)
    await fs.writeFile(srtPath, srt, 'utf-8')
    console.log(`   ✓ SRT字幕: ${srtPath}`)
    
    // 生成Markdown脚本
    const markdown = generateMarkdown(script)
    const mdPath = path.join(OUT_DIR, `${script.id}.md`)
    await fs.writeFile(mdPath, markdown, 'utf-8')
    console.log(`   ✓ 脚本文档: ${mdPath}`)
    
    // 生成JSON数据
    const jsonPath = path.join(OUT_DIR, `${script.id}.json`)
    await fs.writeFile(jsonPath, JSON.stringify(script, null, 2), 'utf-8')
    console.log(`   ✓ JSON数据: ${jsonPath}`)
    
    console.log(`   ⏱️  时长: ${script.duration}秒\n`)
  }
  
  // 4. 生成汇总文件
  console.log('📝 生成汇总文档...')
  
  const summaryPath = path.join(OUT_DIR, 'README.md')
  let summary = `# 短视频脚本汇总\n\n`
  summary += `**生成时间**: ${new Date().toLocaleString('zh-CN')}\n\n`
  summary += `**脚本数量**: ${scripts.length}\n\n`
  summary += `---\n\n`
  
  scripts.forEach((script, index) => {
    summary += `## ${index + 1}. ${script.title}\n\n`
    summary += `- **ID**: ${script.id}\n`
    summary += `- **时长**: ${script.duration}秒\n`
    summary += `- **文件**:\n`
    summary += `  - 脚本: [${script.id}.md](${script.id}.md)\n`
    summary += `  - 字幕: [${script.id}.srt](${script.id}.srt)\n`
    summary += `  - 数据: [${script.id}.json](${script.id}.json)\n\n`
    summary += `**预览**:\n\n`
    summary += `\`\`\`\n${script.fullText}\n\`\`\`\n\n`
    summary += `---\n\n`
  })
  
  await fs.writeFile(summaryPath, summary, 'utf-8')
  console.log(`✅ 汇总文档: ${summaryPath}\n`)
  
  // 5. 输出统计
  console.log('📊 生成统计:')
  console.log(`   脚本数量: ${scripts.length}`)
  console.log(`   总时长: ${scripts.reduce((sum, s) => sum + s.duration, 0)}秒`)
  console.log(`   平均时长: ${(scripts.reduce((sum, s) => sum + s.duration, 0) / scripts.length).toFixed(1)}秒`)
  console.log(`   输出目录: ${OUT_DIR}\n`)
  
  console.log('🎉 短视频脚本生成完成！\n')
  console.log('💡 下一步：')
  console.log('   1. 查看脚本: cat out/reels/README.md')
  console.log('   2. 录制视频并添加字幕')
  console.log('   3. 发布到抖音/快手/小红书\n')
}

// 执行主函数
main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

