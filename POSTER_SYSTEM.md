# 🎨 9:16 海报生成系统文档

HotScan - 专业金融资产海报生成与分享

---

## 🎯 系统概述

基于Canvas的9:16竖版海报生成系统，支持前端导出和短链分享。

### 核心功能

1. **Canvas海报生成** - 专业设计，品牌统一
2. **前端导出** - toDataURL() 高清下载
3. **短链分享** - /s/{id} 30天有效期
4. **社交优化** - Open Graph + Twitter Card
5. **可选Puppeteer** - 后端截图备选方案

---

## 🎨 海报设计规范

### 尺寸规格

```
宽度: 1080px
高度: 1920px
比例: 9:16 (竖版)
格式: PNG
质量: 1.0 (无损)
```

### 布局结构

```
┌─────────────────────────────────┐
│  1. Header (Logo + 品牌)         │  0-150px
├─────────────────────────────────┤
│  2. 英文短标题                    │  150-350px
├─────────────────────────────────┤
│  3. 资产名称 + 符号               │  350-500px
├─────────────────────────────────┤
│  4. 核心指标卡片                  │  500-1000px
│     • 涨跌幅 (大号)               │
│     • 风险分 | 时间窗口           │
├─────────────────────────────────┤
│  5. K线图                        │  1000-1600px
│     • 价格走势                    │
│     • 简化蜡烛图                  │
├─────────────────────────────────┤
│  6. 底部水印                      │  1600-1920px
│     • "非投资建议"                │
│     • 品牌信息                    │
└─────────────────────────────────┘
```

### 颜色方案

```typescript
背景渐变:
  - 顶部: #0f172a (slate-900)
  - 中部: #1e293b (slate-800)
  - 底部: #0f172a (slate-900)

文字颜色:
  - 主标题: #ffffff (白色)
  - 副标题: #e2e8f0 (slate-200)
  - 说明文字: #94a3b8 (slate-400)
  - 辅助文字: #64748b (slate-500)

数据颜色:
  - 上涨: #10b981 (green-500)
  - 下跌: #ef4444 (red-500)
  - 低风险: #10b981 (green-500)
  - 中风险: #f59e0b (amber-500)
  - 高风险: #ef4444 (red-500)
  - 极高风险: #dc2626 (red-600)
  - 警告: #ef4444 (red-500)

卡片样式:
  - 背景: rgba(30, 41, 59, 0.8) (半透明)
  - 边框: rgba(148, 163, 184, 0.2)
  - 圆角: 20px
```

---

## 📊 组件详解

### 1. Header 区域

```typescript
功能: 品牌标识和产品名称
内容:
  - Logo: 🔥 HotScan
  - 副标题: 热点雷达 | Hotspot Radar
字体:
  - Logo: bold 48px
  - 副标题: 24px
位置: 左上角 (padding: 60px)
```

### 2. 英文短标题

```typescript
功能: 吸引眼球的主标题
内容: 英文短标题（大写）
字体: bold 56px
位置: 水平居中
特性: 自动换行（maxWidth: 960px）
```

### 3. 资产信息

```typescript
功能: 显示资产名称和符号
内容:
  - 符号: BTC, ETH, etc. (bold 72px)
  - 名称: Bitcoin, Ethereum, etc. (32px)
位置: 水平居中
颜色:
  - 符号: 白色
  - 名称: slate-400
```

### 4. 核心指标卡片

```typescript
功能: 展示关键交易指标
尺寸: 960 × 400px
内容:
  - 涨跌幅: ±XX.XX% (bold 96px)
    • 上涨: 绿色 + 加号
    • 下跌: 红色 + 减号
  - 标签: "{窗口} 涨跌幅" (28px)
  - 分隔线
  - 左列: 风险评分 XX/100
  - 右列: 时间窗口 XX
背景: 半透明卡片 + 边框
圆角: 20px
```

### 5. K线图区域

```typescript
功能: 显示价格走势
尺寸: 960 × 500px
内容:
  - 标题: "价格走势" (32px)
  - K线图: 简化蜡烛图
    • 绿色K线: 收盘 ≥ 开盘
    • 红色K线: 收盘 < 开盘
    • 影线: 高低价
    • 实体: 开收价
占位: "暂无K线数据" (无数据时)
背景: 半透明 + 边框
```

### 6. 底部水印

```typescript
功能: 合规声明和品牌
内容:
  - 主水印: "⚠️ 非投资建议" (bold 36px, 红色)
  - 英文: "Not Financial Advice" (24px)
  - 网站: "hotscan.app" (20px)
位置: 底部居中 (padding-bottom: 100px)
强调: 红色 + emoji 警告
```

---

## 🔧 技术实现

### Canvas 绘制流程

```typescript
1. 创建Canvas (1080 × 1920)
   ↓
2. 绘制渐变背景
   ↓
3. 绘制内容层
   ├─ drawHeader()
   ├─ drawEnglishTitle()
   ├─ drawAssetName()
   ├─ drawMetricsCard()
   ├─ drawCandleChart()
   └─ drawWatermark()
   ↓
4. 生成DataURL (PNG)
   ↓
5. 显示预览 + 提供下载
```

### 核心方法

#### toDataURL() 导出

```typescript
const canvas = canvasRef.current
const imageUrl = canvas.toDataURL('image/png', 1.0)

// 下载
const link = document.createElement('a')
link.download = `hotscan-${symbol}-${timestamp}.png`
link.href = imageUrl
link.click()
```

#### 圆角矩形绘制

```typescript
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  // ... 绘制四个圆角
  ctx.closePath()
}
```

#### 文本自动换行

```typescript
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ')
  let line = ''
  // ... 逐词检测宽度，自动换行
}
```

#### 简化K线图

```typescript
function drawSimpleCandlesticks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  candles: Candle[]
) {
  // 1. 计算价格范围
  // 2. 绘制影线（高低价）
  // 3. 绘制实体（开收价）
  // 4. 根据涨跌着色
}
```

---

## 🔗 短链分享系统

### 流程图

```
用户生成海报
    ↓
点击"分享海报"
    ↓
POST /api/share
  • assetId
  • title
  • imageUrl (data URI)
  • metrics
    ↓
生成8位短链ID (nanoid)
    ↓
存储到Share表
  • 30天有效期
    ↓
返回短链: /s/{id}
    ↓
复制到剪贴板
```

### Share 表结构

```prisma
model Share {
  id        String    @id (nanoid 8位)
  assetId   String
  imageUrl  String    // data URI or URL
  title     String
  metrics   Json      // 指标数据
  template  String?
  
  createdAt DateTime  @default(now())
  expiresAt DateTime? // 30天后
  
  asset     Asset     @relation(...)
}
```

### 短链页面 /s/[id]

#### 功能
- 展示海报图片
- 显示资产信息
- 核心指标展示
- 跳转详情页
- 社交分享
- 免责声明

#### Open Graph 元数据

```typescript
export async function generateMetadata({ params }) {
  const share = await getShare(params.id)
  
  return {
    title: share.title,
    description: `${share.asset.name} 热点分析`,
    openGraph: {
      title: share.title,
      images: [
        {
          url: share.imageUrl,
          width: 1080,
          height: 1920,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [share.imageUrl],
    },
  }
}
```

---

## 🎭 Puppeteer 备选方案（可选）

### 安装

```bash
npm install puppeteer
```

### API 端点

**Endpoint**: `POST /api/share/puppeteer`

**请求**:
```json
{
  "url": "https://hotscan.app/poster/...",
  "width": 1080,
  "height": 1920
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "imageUrl": "data:image/png;base64,...",
    "width": 1080,
    "height": 1920
  }
}
```

### 实现

```typescript
import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox'],
})

const page = await browser.newPage()
await page.setViewport({
  width: 1080,
  height: 1920,
  deviceScaleFactor: 2, // 高清
})

await page.goto(url, {
  waitUntil: 'networkidle2',
})

const screenshot = await page.screenshot({
  type: 'png',
  encoding: 'base64',
})

await browser.close()
```

### 优缺点

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Canvas前端** | 快速、无服务器成本、实时预览 | 浏览器兼容性 |
| **Puppeteer后端** | 完美渲染、服务端控制 | 慢、占用资源、成本高 |

**推荐**: 优先使用Canvas前端方案，Puppeteer作为备选。

---

## 📱 使用方法

### 1. 组件集成

```typescript
import { PosterGenerator } from '@/components/poster-generator'

const posterData = {
  symbol: 'BTC',
  name: 'Bitcoin',
  englishTitle: 'Bitcoin Price Surge',
  priceChangePct: 5.23,
  riskScore: 25,
  window: '1h',
  currentPrice: 67234.5,
  riskLevel: 'medium',
  candleData: [...], // 可选
}

<PosterGenerator 
  data={posterData}
  onShare={(url) => console.log('分享链接:', url)}
/>
```

### 2. 下载海报

```typescript
// 用户点击"下载海报"按钮
// 自动下载: hotscan-BTC-{timestamp}.png
```

### 3. 分享海报

```typescript
// 用户点击"分享海报"按钮
// 1. 调用 POST /api/share
// 2. 生成短链 /s/{id}
// 3. 复制到剪贴板
// 4. 提示用户
```

### 4. 访问短链

```typescript
// 访问 https://hotscan.app/s/{id}
// 1. 显示海报
// 2. 显示资产信息
// 3. 提供"查看详情"按钮
// 4. 支持社交分享
```

---

## 🎨 设计细节

### 字体系统

```css
主字体: system-ui, -apple-system, sans-serif
粗体: bold (600-700)
字号层级:
  - 超大标题: 96px (涨跌幅)
  - 大标题: 72px (符号)
  - 标题: 56px (英文标题)
  - 副标题: 48px (Logo/指标值)
  - 正文: 32px (名称)
  - 小字: 24-28px (标签/说明)
  - 细节: 20px (网站)
```

### 间距系统

```typescript
外边距: 60px (左右上下)
卡片间距: 50-100px
内边距: 30px (卡片内)
行高: 1.2-1.5
元素间距: 10-20px
```

### 阴影和特效

```css
卡片阴影: 无（使用边框）
文字阴影: 无（高对比度）
圆角: 20px (卡片)
透明度: 0.8 (卡片背景)
边框: rgba(148, 163, 184, 0.2)
```

---

## 🔒 安全和合规

### 数据安全

```typescript
✅ Data URI 安全（base64编码）
✅ 30天自动过期
✅ 无敏感用户信息
✅ 短链ID随机生成（nanoid）
```

### 合规要求

```typescript
✅ 显著标注"非投资建议"
✅ 红色警告色 + Emoji
✅ 双语声明（中英文）
✅ 底部免责说明
✅ 链接过期机制
```

---

## 📊 性能优化

### Canvas 优化

```typescript
// 1. 使用离屏Canvas预渲染
const offscreen = new OffscreenCanvas(1080, 1920)

// 2. 避免频繁重绘
useEffect(() => {
  generatePoster()
}, [data]) // 仅当data变化时重绘

// 3. 懒加载图片
if (imageUrl) {
  <img src={imageUrl} loading="lazy" />
}
```

### 数据库优化

```sql
-- 定期清理过期分享
DELETE FROM "Share"
WHERE "expiresAt" < NOW()

-- 索引优化
CREATE INDEX share_expires_idx ON "Share"("expiresAt")
CREATE INDEX share_asset_idx ON "Share"("assetId")
```

---

## ✅ 验证清单

- [x] 9:16 竖版比例
- [x] 1080 × 1920 分辨率
- [x] 英文短标题
- [x] 核心指标（涨跌幅/风险分/窗口）
- [x] K线占位图
- [x] Logo和品牌
- [x] 水印"非投资建议"
- [x] Canvas toDataURL() 导出
- [x] 前端下载功能
- [x] 短链生成 /s/{id}
- [x] 短链页面
- [x] Open Graph 元数据
- [x] 30天过期机制
- [x] Puppeteer 备选方案

---

**9:16海报生成系统完成！专业美观，分享便捷！** 🎨
