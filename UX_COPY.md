# ✍️ UX 文案库

HotScan - 完整的产品文案和用户体验指南

---

## 📋 目录

1. [状态文案](#状态文案)
2. [友好提示](#友好提示)
3. [海报标题模板](#海报标题模板)
4. [新手引导](#新手引导)
5. [错误提示](#错误提示)
6. [交互反馈](#交互反馈)
7. [空状态文案](#空状态文案)

---

## 1. 状态文案

### 首页状态

#### 🔄 加载状态

**中文**:
```
正在扫描市场热点...
分析链上数据中
```

**英文**:
```
Scanning market hotspots...
Analyzing on-chain data
```

**使用场景**: 首页首次加载、刷新数据时

---

#### 📭 无数据状态

**场景1: 完全无信号**

**中文**:
```
📊 暂无信号数据

当前市场较为平静，还没有捕捉到符合条件的热点信号。

💡 提示：
• 信号每日自动生成（10:00、14:00、20:00）
• 也可以手动运行分析任务
• 尝试调整筛选条件查看更多数据
```

**英文**:
```
📊 No Signals Yet

Market is relatively quiet. No qualifying hotspots detected.

💡 Tips:
• Signals auto-generate daily (10:00, 14:00, 20:00 UTC)
• You can manually run analysis tasks
• Try adjusting filters to see more data
```

---

**场景2: 筛选后无结果**

**中文**:
```
🔍 未找到匹配的信号

当前筛选条件下没有符合的热点。

💡 建议：
• 扩大时间窗口（5m → 1h）
• 调整风险分数范围
• 清除筛选条件查看全部
```

**英文**:
```
🔍 No Matching Signals

No hotspots match your current filters.

💡 Suggestions:
• Expand time window (5m → 1h)
• Adjust risk score range
• Clear filters to see all
```

---

**场景3: 首次使用（种子数据）**

**中文**:
```
👋 欢迎使用 HotScan

这是演示数据，帮助你了解平台功能。

🚀 开始使用：
1. 浏览信号列表，了解热点资产
2. 点击卡片查看详细分析
3. 生成海报分享你的发现

⚠️ 提示：演示数据仅供参考，请勿作为投资依据
```

**英文**:
```
👋 Welcome to HotScan

This is demo data to help you explore the platform.

🚀 Get Started:
1. Browse signals to discover trending assets
2. Click cards for detailed analysis
3. Generate posters to share findings

⚠️ Note: Demo data for reference only, not investment advice
```

---

#### ❌ 加载失败状态

**场景1: 网络错误**

**中文**:
```
🌐 网络连接失败

无法连接到服务器，请检查网络连接。

[重试]
```

**英文**:
```
🌐 Network Error

Unable to connect. Please check your connection.

[Retry]
```

---

**场景2: 服务器错误**

**中文**:
```
⚠️ 服务暂时不可用

服务器正在维护或遇到问题，请稍后再试。

错误代码: {errorCode}

[重新加载]  [联系支持]
```

**英文**:
```
⚠️ Service Temporarily Unavailable

Server is under maintenance or experiencing issues.

Error Code: {errorCode}

[Reload]  [Contact Support]
```

---

**场景3: API限流**

**中文**:
```
⏱️ 请求过于频繁

你的请求已达到速率限制，请稍后再试。

• 匿名用户：100次/小时
• 注册用户：1000次/小时

剩余时间：{remainingTime}

💡 提示：登录后可提高请求限制
```

**英文**:
```
⏱️ Rate Limit Exceeded

You've reached the request limit. Please try again later.

• Anonymous: 100/hour
• Registered: 1000/hour

Retry in: {remainingTime}

💡 Tip: Log in for higher limits
```

---

## 2. 友好提示

### AI摘要区提示条

#### 标准提示（默认）

**中文**:
```
ℹ️ 本摘要基于链上数据和算法分析生成，仅供参考，不构成任何投资建议。
```

**英文**:
```
ℹ️ This summary is generated from on-chain data and algorithms. 
For reference only, not financial advice.
```

---

#### 高风险警告（风险分≥70）

**中文**:
```
⚠️ 极高风险资产

该资产风险分数为 {score}/100，存在以下高风险因素：
• {riskFactors}

请谨慎对待，切勿投入超出承受能力的资金。
```

**英文**:
```
⚠️ Very High Risk Asset

Risk score: {score}/100. High-risk factors include:
• {riskFactors}

Exercise extreme caution. Never invest more than you can afford to lose.
```

---

#### 数据延迟提示

**中文**:
```
⏱️ 数据更新时间：{updateTime}

链上数据可能存在 5-15 分钟延迟，请结合实时行情判断。
```

**英文**:
```
⏱️ Data updated: {updateTime}

On-chain data may have 5-15 min delay. 
Cross-check with real-time prices.
```

---

#### 新合约警告（合约≤7天）

**中文**:
```
🆕 新上线合约（{days}天）

该代币刚上线不久，历史数据有限，存在较高不确定性。

⚠️ 警惕 Rug Pull 风险
```

**英文**:
```
🆕 New Contract ({days} days old)

Recently launched with limited history. Higher uncertainty.

⚠️ Beware of Rug Pull risk
```

---

#### 持币集中度警告（前5≥60%）

**中文**:
```
👥 持币高度集中（前5持有 {percent}%）

少数大户可能操纵价格，存在"砸盘"风险。

💡 建议：小额试探，设置止损
```

**英文**:
```
👥 Highly Concentrated ({percent}% held by top 5)

Few whales can manipulate price. Risk of dump.

💡 Tip: Small position, set stop-loss
```

---

#### 数据来源说明

**中文**:
```
📊 数据来源

• 价格数据：CoinGecko, Binance, Coinbase
• 链上数据：Etherscan, BSCScan, Solscan
• 流动性：Uniswap, PancakeSwap, Raydium

所有数据可能存在误差，请交叉验证。
```

**英文**:
```
📊 Data Sources

• Prices: CoinGecko, Binance, Coinbase
• On-chain: Etherscan, BSCScan, Solscan
• Liquidity: Uniswap, PancakeSwap, Raydium

All data may contain errors. Cross-verify before use.
```

---

## 3. 海报标题模板

### 中文标题（18-24字）

#### 模板1: 涨跌幅 + 时间窗口
```
{资产名称}｜{窗口}窗口{涨跌幅}，成交量暴增{倍数}倍
```
**示例**: `比特币｜5分钟窗口上涨18.5%，成交量暴增4.2倍`

---

#### 模板2: 风险警示
```
⚠️ {资产名称}风险分{分数}/100｜{关键风险点}
```
**示例**: `⚠️ PEPE风险分85/100｜持币高度集中，谨防砸盘`

---

#### 模板3: 新币热度
```
🔥 {资产名称}｜新钱包疯狂买入，净流入${金额}K
```
**示例**: `🔥 ALPHA协议｜新钱包疯狂买入，净流入$250K`

---

#### 模板4: 流动性异动
```
💧 {资产名称}｜流动性{增减}{百分比}，{窗口}内异常波动
```
**示例**: `💧 Uniswap｜流动性增加35%，1小时内异常波动`

---

#### 模板5: 成交量突破
```
📈 {资产名称}｜成交量突破{Z分数}倍标准差，市场热度飙升
```
**示例**: `📈 Solana｜成交量突破6.5倍标准差，市场热度飙升`

---

#### 模板6: 综合信号
```
🎯 {资产名称}｜{窗口}{涨跌}，风险{等级}，{关键指标}
```
**示例**: `🎯 以太坊｜1小时上涨12%，风险中等，流动性充足`

---

#### 模板7: 鲸鱼动向
```
🐋 {资产名称}｜前5钱包持有{占比}%，大户动向追踪
```
**示例**: `🐋 SHIB｜前5钱包持有72%，大户动向追踪`

---

#### 模板8: 合约新老
```
{新/老}合约 {资产名称}｜上线{天数}天，{窗口}{涨跌}
```
**示例**: `新合约 Beta Finance｜上线3天，15分钟暴涨45%`

---

#### 模板9: 对比式
```
{资产名称} VS {对标资产}｜{窗口}{涨跌}，谁更值得关注？
```
**示例**: `Uniswap VS SushiSwap｜1小时上涨8%，谁更值得关注？`

---

#### 模板10: 数据驱动
```
📊 {资产名称}数据解读｜{关键数据1}，{关键数据2}
```
**示例**: `📊 AAVE数据解读｜TVL突破$20亿，借贷率上涨15%`

---

### 英文副标题（≤15词）

#### 模板1: 简洁数据
```
{Window} {+/-}{Change}%, Vol {Zscore}σ, Risk {Score}/100
```
**示例**: `5m +18.5%, Vol 4.2σ, Risk 35/100`

---

#### 模板2: 风险聚焦
```
⚠️ High Risk: {Risk Factor}, Score {Score}/100
```
**示例**: `⚠️ High Risk: Concentrated holdings, Score 85/100`

---

#### 模板3: 流动性焦点
```
Liquidity {+/-}{Percent}%, {New/Old} wallets active
```
**示例**: `Liquidity +35%, New wallets active`

---

#### 模板4: 成交量突破
```
Volume surge {Zscore}σ above average, {Window} window
```
**示例**: `Volume surge 6.5σ above average, 1h window`

---

#### 模板5: 简单明了
```
{Window} {Action} {Percent}%, {Status}
```
**示例**: `1h Up 12%, Moderate Risk`

---

#### 模板6: 新币提示
```
🆕 {Days}-day-old contract, {Window} {Change}%
```
**示例**: `🆕 3-day-old contract, 15m +45%`

---

#### 模板7: 持仓警示
```
Top 5 hold {Percent}%, whale concentration risk
```
**示例**: `Top 5 hold 72%, whale concentration risk`

---

#### 模板8: 数据点
```
{Metric1}, {Metric2}, {Metric3}
```
**示例**: `TVL $2B+, APY 15%, Risk Moderate`

---

#### 模板9: 趋势描述
```
{Trend} trend, {Window} {Change}%, watch closely
```
**示例**: `Upward trend, 5m +18%, watch closely`

---

#### 模板10: 对比式
```
{Asset1} vs {Asset2}: {Window} {Winner} leads
```
**示例**: `UNI vs SUSHI: 1h UNI leads +8%`

---

## 4. 新手引导

### 3步引导流程

#### 第1步：浏览列表页

**标题**:
```
中文：📊 发现市场热点
英文：📊 Discover Market Hotspots
```

**说明**:
```
中文：
这是今日的热点信号列表。每张卡片展示：
• 资产名称和价格变化
• 成交量和流动性强度
• 风险评分（0-100）

💡 点击任意卡片查看详细分析

英文：
Today's hotspot signals. Each card shows:
• Asset name & price change
• Volume & liquidity strength
• Risk score (0-100)

💡 Tap any card for detailed analysis
```

**位置**: 首页列表顶部（首次访问时显示）

**交互**: 点击"知道了"或卡片后自动进入第2步

---

#### 第2步：查看详情

**标题**:
```
中文：🔍 深入分析资产
英文：🔍 Deep Dive Analysis
```

**说明**:
```
中文：
详情页包含：
• 📈 关键指标网格（价格、成交量、流动性）
• 🤖 AI双语解读（中文/English）
• ⚠️ 风险因素分析
• 📊 K线图（即将上线）

💡 向下滚动查看完整分析

重要提示：
所有内容仅供参考，不构成投资建议。

英文：
Detail page includes:
• 📈 Key metrics grid
• 🤖 Bilingual AI summary (CN/EN)
• ⚠️ Risk factor analysis
• 📊 Charts (Coming soon)

💡 Scroll down for full analysis

Important:
For reference only, not financial advice.
```

**位置**: 详情页顶部（首次进入详情时显示）

**交互**: 点击"下一步"或滚动后进入第3步

---

#### 第3步：生成海报

**标题**:
```
中文：🎨 分享你的发现
英文：🎨 Share Your Findings
```

**说明**:
```
中文：
你可以生成 9:16 竖版海报分享到社交媒体：

1. 点击"生成海报"按钮
2. 等待生成（约2-3秒）
3. 下载或直接分享

海报包含：
• 资产关键指标
• AI摘要
• 风险提示
• "非投资建议"水印

💡 海报链接30天内有效

英文：
Generate 9:16 vertical posters for social sharing:

1. Tap "Generate Poster" button
2. Wait for generation (~2-3s)
3. Download or share directly

Poster includes:
• Key asset metrics
• AI summary
• Risk warnings
• "Not financial advice" watermark

💡 Poster link valid for 30 days
```

**位置**: 详情页"生成海报"按钮附近（点击按钮时显示）

**交互**: 点击"开始生成"完成引导

---

### 引导完成提示

```
中文：
🎉 太棒了！你已掌握基本功能

现在可以：
✓ 浏览每日热点信号
✓ 深入分析感兴趣的资产
✓ 生成海报分享发现

💡 记住：理性投资，风险自担

[开始探索]

英文：
🎉 Great! You've mastered the basics

Now you can:
✓ Browse daily hotspot signals
✓ Deep dive into assets
✓ Generate & share posters

💡 Remember: Invest rationally, risks are yours

[Start Exploring]
```

---

## 5. 错误提示

### 用户操作错误

#### 未登录尝试订阅

```
中文：
🔒 需要登录

订阅功能需要登录账户。登录后可以：
• 订阅特定资产的信号推送
• 收藏感兴趣的术语
• 导出和管理个人数据

[登录/注册]  [稍后再说]

英文：
🔒 Login Required

Subscription requires an account. After login:
• Subscribe to asset signal alerts
• Bookmark favorite terms
• Export & manage your data

[Sign In]  [Later]
```

---

#### 海报生成失败

```
中文：
❌ 海报生成失败

可能原因：
• 网络连接不稳定
• 服务器负载过高
• 浏览器不支持Canvas

[重试]  [查看帮助]

英文：
❌ Poster Generation Failed

Possible reasons:
• Unstable network
• Server overload
• Browser doesn't support Canvas

[Retry]  [Get Help]
```

---

#### 分享链接已过期

```
中文：
⏰ 分享链接已过期

该海报链接已超过30天有效期。

💡 你可以：
• 返回详情页重新生成
• 查看历史记录（如已登录）

[返回首页]

英文：
⏰ Share Link Expired

This poster link exceeded 30-day validity.

💡 You can:
• Go back to detail page & regenerate
• Check history (if logged in)

[Back to Home]
```

---

### 系统错误

#### 数据库连接失败

```
中文：
🗄️ 数据库连接失败

无法连接到数据库，请稍后再试。

如果问题持续，请联系：support@hotscan.app

[返回首页]

英文：
🗄️ Database Connection Failed

Unable to connect to database. Please try again later.

If persists, contact: support@hotscan.app

[Back to Home]
```

---

#### OpenAI API失败

```
中文：
🤖 AI分析暂时不可用

AI摘要功能遇到问题，你仍可查看原始数据。

我们正在解决，预计恢复时间：{estimatedTime}

[查看原始数据]

英文：
🤖 AI Analysis Temporarily Unavailable

AI summary is down, but raw data remains accessible.

We're fixing it. Estimated recovery: {estimatedTime}

[View Raw Data]
```

---

## 6. 交互反馈

### 成功操作

#### 订阅成功

```
中文：
✅ 订阅成功

你已成功订阅 {assetName} 的信号推送。

当有新信号时，我们会通过邮件通知你。

[管理订阅]

英文：
✅ Subscribed Successfully

You're now subscribed to {assetName} signals.

We'll email you when new signals arrive.

[Manage Subscriptions]
```

---

#### 海报下载成功

```
中文：
✅ 海报已保存

海报已保存到你的设备。

分享链接：{shareUrl}

[复制链接]  [再生成一张]

英文：
✅ Poster Saved

Poster saved to your device.

Share link: {shareUrl}

[Copy Link]  [Generate Another]
```

---

#### 复制成功

```
中文：
✅ 已复制到剪贴板

英文：
✅ Copied to Clipboard
```

---

### 处理中状态

#### 生成海报中

```
中文：
⏳ 正在生成海报...

• 加载资产数据
• 渲染图表
• 生成图片

预计需要 2-3 秒

英文：
⏳ Generating Poster...

• Loading asset data
• Rendering charts
• Creating image

Est. 2-3 seconds
```

---

#### 发送邮件中

```
中文：
📧 正在发送邮件...

英文：
📧 Sending Email...
```

---

## 7. 空状态文案

### RAG问答页

```
中文：
💬 问我任何问题

例如：
• "什么是流动性锁仓？"
• "如何识别Rug Pull风险？"
• "AMM是什么意思？"

我会基于术语库为你解答，并提供生活化例子。

⚠️ 仅提供教育内容，不提供投资建议

英文：
💬 Ask Me Anything

Examples:
• "What is liquidity lock?"
• "How to identify Rug Pull risks?"
• "What does AMM mean?"

I'll answer based on our term library with real-life examples.

⚠️ Educational content only, not financial advice
```

---

### 我的订阅（空）

```
中文：
📭 还没有订阅

订阅感兴趣的资产，当有新信号时我们会通知你。

💡 如何订阅：
1. 浏览信号列表
2. 进入资产详情页
3. 点击"订阅"按钮

[浏览热点]

英文：
📭 No Subscriptions Yet

Subscribe to assets you're interested in for signal alerts.

💡 How to subscribe:
1. Browse signal list
2. Open asset detail
3. Tap "Subscribe" button

[Browse Hotspots]
```

---

### 我的收藏（空）

```
中文：
⭐ 还没有收藏

收藏有用的术语，方便随时查看。

💡 如何收藏：
1. 在"术语库"浏览术语
2. 点击术语卡片
3. 点击"收藏"图标

[浏览术语库]

英文：
⭐ No Bookmarks Yet

Bookmark useful terms for quick access.

💡 How to bookmark:
1. Browse "Term Library"
2. Tap term card
3. Tap bookmark icon

[Browse Terms]
```

---

## 8. 合规文案

### 免责声明（通用）

```
中文（简短版）：
⚠️ 非投资建议

所有内容仅供参考，不构成任何投资建议。加密货币投资存在极高风险，请理性决策。

英文（简短版）：
⚠️ Not Financial Advice

All content is for reference only, not investment advice. 
Crypto investments carry high risks. Decide rationally.
```

---

### 数据准确性声明

```
中文：
📊 数据可能存在误差

链上数据可能延迟5-15分钟，第三方数据源可能存在错误或不一致。

请在使用前交叉验证多个数据源。

英文：
📊 Data May Contain Errors

On-chain data may have 5-15 min delay. 
Third-party sources may have errors or inconsistencies.

Cross-verify multiple sources before use.
```

---

### 风险警示（强制显示）

```
中文：
⚠️ 投资风险警告

加密货币投资存在极高风险，价格可能在短时间内大幅波动甚至归零。

请不要投入超出承受能力的资金。

英文：
⚠️ Investment Risk Warning

Crypto investments carry extreme risks. 
Prices can fluctuate dramatically or drop to zero.

Never invest more than you can afford to lose.
```

---

**UX文案系统完成！全方位覆盖用户体验！** ✍️✨
