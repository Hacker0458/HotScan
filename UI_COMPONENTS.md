# 🎨 HotScan UI 组件库文档

移动端优先 · 高信息密度 · 暗色主题友好

---

## 📱 已实现的组件

### 1. 导航系统 (`navigation.tsx`)

**设计要点**：
- ✅ 响应式设计：桌面端顶部导航 + 移动端底部标签栏
- ✅ 渐变 Logo：橙红色渐变，视觉吸引力强
- ✅ 自适应文字：移动端简化显示
- ✅ 毛玻璃效果：`backdrop-blur` 提升层次感
- ✅ 活动状态指示：自动高亮当前页面

**特性**：
```tsx
- 高度优化：14px (56px 换算)
- 固定定位：sticky top-0（顶部）+ fixed bottom-0（底部移动端）
- 3个导航项：今日热点、术语库、我的订阅
- 自动路径匹配：usePathname() 高亮
```

**移动端优化**：
- Logo 文字简化：`雷达` 代替完整名称
- 底部标签栏：图标 + 文字，3列网格布局
- 触控友好：更大的点击区域

---

### 2. 资产卡片 (`asset-card.tsx`)

**设计要点**：
- ✅ 高信息密度：单卡展示 10+ 数据点
- ✅ 视觉层次：渐进式信息展示
- ✅ 动态色彩：涨跌幅、风险等级、情绪指标
- ✅ 悬停效果：边框高亮、阴影提升
- ✅ 响应式栅格：移动端 1列，平板 2列，桌面 3列

**数据展示**：
```
顶部区：名称/符号、类型标签、风险徽章
价格区：当前价格、24h 涨跌幅（带图标）
指标区：成交量强度、热度条
底部区：市场情绪、进入详情按钮
```

**色彩系统**：
- 涨：`text-green-600 dark:text-green-400`
- 跌：`text-red-600 dark:text-red-400`
- 高风险：`border-red-500/50`
- 中风险：`border-yellow-500/50`
- 低风险：`border-green-500/50`

---

### 3. 骨架屏 (`asset-skeleton.tsx`)

**设计要点**：
- ✅ 结构匹配：与真实卡片完全对应
- ✅ 流畅动画：`animate-pulse`
- ✅ 批量渲染：`AssetListSkeleton` 支持数量配置

**使用场景**：
```tsx
// 加载中
{isLoading && <AssetListSkeleton count={6} />}

// 有数据
{!isLoading && assets.map(asset => <AssetCard {...asset} />)}
```

---

### 4. 空状态 (`empty-state.tsx`)

**设计要点**：
- ✅ 4种预设：assets, signals, terms, bookmarks
- ✅ 视觉友好：大图标 + 描述 + 行动按钮
- ✅ 可定制：支持自定义标题、描述、按钮

**示例**：
```tsx
<EmptyState 
  type="bookmarks"
  title="还没有订阅"
  actionLabel="浏览热点"
  onAction={() => router.push('/')}
/>
```

---

### 5. 资产详情信息 (`asset-detail-info.tsx`)

**设计要点**：
- ✅ 关键指标栅格：2x2 网格布局
- ✅ AI 摘要卡：情绪徽章 + 信心百分比
- ✅ 中英文切换：Tabs 组件
- ✅ 关键要点：编号列表，视觉清晰
- ✅ 风险提示：黄色边框，醒目但不刺眼
- ✅ 生成海报：主按钮，加载状态

**指标展示**：
```
当前价格   |   24h 涨跌
24h 成交量 |   市值
```

**AI 分析**：
- 标题 + 摘要
- 详细内容（可展开）
- 关键要点（序号列表）
- 知识来源（可追溯）

**交互**：
- 中英文切换（Tabs）
- 生成海报（loading 状态）
- 一键分享

---

### 6. RAG 聊天界面 (`rag-chat.tsx`)

**设计要点**：
- ✅ 全高度：`h-[calc(100vh-8rem)]`
- ✅ 对话气泡：用户（右）、AI（左）
- ✅ 自动滚动：新消息自动滚到底部
- ✅ 知识来源：展示术语和相关信息
- ✅ 相关术语：Badge 形式展示
- ✅ 建议问题：首次访问显示 5 个示例

**消息气泡**：
```tsx
// 用户消息
- 右对齐
- 主色背景 (bg-primary)
- 白色文字

// AI 消息
- 左对齐
- 灰色背景 (bg-muted)
- 包含知识来源和相关术语
```

**输入框**：
- 自动高度调整
- Enter 发送
- Shift+Enter 换行
- 禁用状态处理

**特色功能**：
- 打字指示器（loading）
- 知识来源卡片
- 相关术语 Badge
- 建议问题快速选择

---

## 🎨 设计系统

### 色彩规范

```tsx
// 涨跌
green-600 / green-400   // 涨
red-600 / red-400       // 跌

// 风险等级
red-500/50              // 高风险
yellow-500/50           // 中风险
green-500/50            // 低风险

// 情绪
green (bullish)         // 看涨
red (bearish)           // 看跌
gray (neutral)          // 中性

// 成交量
orange (high)           // 高
blue (medium)           // 中
gray (low)              // 低
```

### 间距系统

```tsx
// 卡片内边距
p-4          // 16px (常规)
p-3          // 12px (紧凑)
p-6          // 24px (宽松)

// 元素间距
gap-2        // 8px
gap-3        // 12px
gap-4        // 16px

// 区块间距
space-y-4    // 垂直 16px
mb-4         // 底部 16px
```

### 圆角系统

```tsx
rounded-lg   // 8px (卡片)
rounded-md   // 6px (按钮)
rounded-full // 完全圆形 (徽章、头像)
```

### 字体大小

```tsx
text-xs      // 12px (辅助信息)
text-sm      // 14px (正文)
text-base    // 16px (标准)
text-lg      // 18px (小标题)
text-xl      // 20px (大标题)
text-2xl     // 24px (价格)
```

---

## 📱 响应式断点

```tsx
// 移动端优先
默认          // < 640px
sm:          // >= 640px
md:          // >= 768px
lg:          // >= 1024px
xl:          // >= 1280px
```

### 布局示例

```tsx
// 卡片网格
grid gap-4 
sm:grid-cols-2    // 平板：2列
lg:grid-cols-3    // 桌面：3列

// 导航
hidden md:flex    // 桌面显示
md:hidden         // 仅移动端显示
```

---

## 🌙 暗色主题支持

### 自动适配

所有组件使用 `dark:` 前缀：

```tsx
// 文字
text-gray-600 dark:text-gray-400

// 背景
bg-white dark:bg-gray-900

// 边框
border-gray-200 dark:border-gray-800
```

### 半透明度

```tsx
// 边框半透明
border-red-500/50

// 背景半透明
bg-primary/10
bg-yellow-500/10

// 阴影层次
bg-background/95 backdrop-blur
```

---

## 🧩 组件使用示例

### 完整页面结构

```tsx
import { Navigation } from '@/components/navigation'
import { AssetCard } from '@/components/asset-card'
import { AssetListSkeleton } from '@/components/asset-skeleton'
import { EmptyState } from '@/components/empty-state'

export default function HomePage() {
  const { data, isLoading } = useAssets()

  return (
    <>
      <Navigation />
      
      <main className="container py-6 px-4 mb-16 md:mb-0">
        <h1 className="text-2xl font-bold mb-6">今日热点</h1>

        {isLoading && <AssetListSkeleton count={6} />}

        {!isLoading && data.length === 0 && (
          <EmptyState type="assets" />
        )}

        {!isLoading && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map(asset => (
              <AssetCard key={asset.id} {...asset} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
```

### 详情页

```tsx
import { AssetDetailInfo } from '@/components/asset-detail-info'

export default function AssetDetailPage({ params }) {
  const { asset, signal } = await getAssetDetail(params.id)

  return (
    <div className="container py-6 px-4">
      <AssetDetailInfo asset={asset} signal={signal} />
    </div>
  )
}
```

### RAG 学习页

```tsx
import { RAGChat } from '@/components/rag-chat'

export default function LearnPage() {
  return (
    <div className="container py-6 px-4">
      <RAGChat />
    </div>
  )
}
```

---

## 🎯 性能优化

### 图标优化

```tsx
// 统一使用 lucide-react
import { TrendingUp, DollarSign } from 'lucide-react'

// 固定尺寸
<TrendingUp className="h-4 w-4" />  // 16px
<TrendingUp className="h-5 w-5" />  // 20px
```

### 条件类名

```tsx
import { cn } from '@/lib/utils'

// 动态类名
<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  variant === 'primary' && 'primary-classes'
)} />
```

### 懒加载

```tsx
// 大组件懒加载
const RAGChat = dynamic(() => import('@/components/rag-chat'), {
  loading: () => <Skeleton className="h-[600px]" />
})
```

---

## ✅ 已实现功能清单

- [x] 响应式导航（顶部 + 底部）
- [x] 资产卡片（高信息密度）
- [x] 骨架屏加载状态
- [x] 空状态占位
- [x] 资产详情信息区
- [x] 关键指标栅格
- [x] AI 摘要（中英文切换）
- [x] 生成海报按钮
- [x] RAG 聊天界面
- [x] 消息气泡
- [x] 知识来源展示
- [x] 相关术语 Badge
- [x] 建议问题

---

## 🚀 下一步优化

### 可选增强

- [ ] 图表组件（Recharts）
- [ ] 分享海报预览
- [ ] 下拉刷新
- [ ] 无限滚动
- [ ] 手势操作
- [ ] 动画过渡（Framer Motion）

### 性能优化

- [ ] 虚拟滚动（长列表）
- [ ] 图片懒加载
- [ ] 预加载关键资源
- [ ] Service Worker

---

## 📱 移动端测试

### 测试清单

- [x] iOS Safari
- [x] Android Chrome
- [x] 横屏适配
- [x] 触控友好
- [x] 安全区域（刘海屏）

### 性能指标

- FCP < 1.5s
- LCP < 2.5s
- CLS < 0.1
- FID < 100ms

---

## 🎨 设计原则

### 极简主义

- 去除不必要的装饰
- 聚焦核心信息
- 清晰的视觉层次

### 高信息密度

- 单屏展示更多内容
- 合理的留白和间距
- 紧凑但不拥挤

### 暗色主题友好

- 柔和的对比度
- 半透明元素
- 护眼的配色

---

**UI 系统完成！移动端优先，生产就绪！** 🎉
