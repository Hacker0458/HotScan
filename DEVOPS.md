# 🚀 DevOps 文档

HotScan - 企业级CI/CD和自动化运维系统

---

## 🎯 系统概述

基于GitHub Actions的全自动化DevOps流程，包含CI/CD、定时任务、健康检查和告警通知。

### 核心功能

1. **CI/CD流程** - Lint/Test/Build/Deploy自动化
2. **Vercel部署** - 生产环境和预览环境
3. **定时任务** - 每日3次自动执行
4. **健康检查** - 每小时监控应用状态
5. **失败告警** - Slack/飞书双通道通知
6. **日志管理** - 保留最近50次运行记录

---

## 📊 工作流概览

### 工作流列表

| 工作流 | 触发条件 | 运行时间 | 用途 |
|--------|----------|----------|------|
| **ci.yml** | Push/PR | ~5分钟 | 代码质量检查 |
| **deploy.yml** | Push to main | ~8分钟 | 部署到生产环境 |
| **cron.yml** | 定时（3次/天） | ~2分钟 | 执行后台任务 |
| **health-check.yml** | 每小时 | ~30秒 | 应用健康监控 |
| **cleanup.yml** | 每周日 | ~1分钟 | 清理旧日志 |

---

## 🔄 CI/CD 流程

### ci.yml - 持续集成

#### 触发条件
```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

#### 执行步骤

**1. Lint（代码检查）**
```bash
✓ ESLint检查
✓ TypeScript类型检查
✓ Prettier格式检查
```

**2. Test（单元测试）**
```bash
✓ 运行Vitest测试套件
✓ 生成覆盖率报告
✓ 上传到Codecov
```

**3. Build（构建）**
```bash
✓ 生成Prisma Client
✓ Next.js构建
✓ 验证构建产物
```

**4. Notify（失败通知）**
```bash
✓ Slack通知
✓ 飞书通知
✓ 包含错误日志链接
```

#### 成功标准
- ✅ 所有ESLint规则通过
- ✅ 所有TypeScript类型正确
- ✅ 所有测试用例通过
- ✅ 构建成功无错误

---

## 🚀 部署流程

### deploy.yml - Vercel部署

#### 生产环境部署

**触发**: Push to `main` 分支

**步骤**:
```
1. Checkout代码
   ↓
2. 安装Vercel CLI
   ↓
3. 拉取环境变量
   ↓
4. 构建项目
   ↓
5. 部署到Vercel
   ↓
6. 通知部署结果
```

**成功通知**:
- ✅ 部署URL
- ✅ 提交信息
- ✅ "访问网站"按钮

#### 预览环境部署

**触发**: Pull Request

**步骤**:
```
1. 部署预览版本
   ↓
2. 在PR中评论预览URL
```

**PR评论示例**:
```markdown
## 🚀 Preview Deployment

✅ Preview deployed successfully!

**URL:** https://hotscan-pr-123.vercel.app

---
_Powered by Vercel_
```

---

## ⏰ 定时任务

### cron.yml - 后台作业

#### 执行时间（UTC）

| 时间（UTC） | 北京时间 | 任务 |
|-------------|----------|------|
| 10:00 | 18:00 | 生成交易信号 |
| 14:00 | 22:00 | 生成交易信号 |
| 20:00 | 次日 04:00 | 生成交易信号 |

#### 任务列表

**1. make-signals（信号生成）**
```bash
POST /api/jobs/make-signals
频率: 每日3次
用途: 生成加密货币交易信号
```

**2. embed-terms（术语向量化）**
```bash
POST /api/jobs/embed-terms
频率: 手动触发
用途: 向量化新增术语
```

**3. ingest-data（数据摄取）**
```bash
POST /api/jobs/ingest-data
频率: 手动触发
用途: 从外部API获取数据
```

**4. analyze-signals（信号分析）**
```bash
POST /api/jobs/analyze-signals
频率: 手动触发
用途: 分析和评分信号
```

#### 手动触发

```bash
# GitHub UI
Actions → Scheduled Jobs → Run workflow
选择任务类型 → Run workflow

# GitHub CLI
gh workflow run cron.yml -f job_name=make-signals
```

#### 成功通知示例

```
✅ 定时任务执行成功

任务: make-signals
状态: ✅ 成功
响应: {"success": true, "signals_generated": 15}
```

#### 失败通知示例

```
❌ 定时任务执行失败

任务: make-signals
状态: ❌ 失败
HTTP状态码: 500
响应: {"error": "Database connection timeout"}

[查看日志] 按钮
```

---

## 🏥 健康检查

### health-check.yml - 应用监控

#### 检查频率
```
每小时1次
```

#### 检查端点
```bash
GET /api/health
期望状态码: 200
```

#### 失败告警

**Slack通知**:
```
🚨 应用健康检查失败

URL: https://hotscan.app/api/health
状态: 500

⚠️ The application may be down. 
   Please investigate immediately.
```

**触发条件**:
- HTTP状态码 ≠ 200
- 连接超时
- 网络错误

---

## 🔔 告警通知

### Slack集成

#### Webhook配置
```bash
# GitHub Secrets
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
```

#### 通知类型

**1. CI失败**
```json
{
  "title": "❌ CI Pipeline Failed",
  "repository": "hotscan/hotscan",
  "branch": "main",
  "commit": "abc123",
  "author": "username",
  "action": "View Logs"
}
```

**2. 部署成功**
```json
{
  "title": "✅ 部署成功",
  "environment": "Production",
  "url": "https://hotscan.app",
  "action": "Visit Site"
}
```

**3. 定时任务失败**
```json
{
  "title": "❌ 定时任务执行失败",
  "job": "make-signals",
  "http_code": 500,
  "response": "Error message",
  "action": "View Logs"
}
```

### 飞书集成

#### Webhook配置
```bash
# GitHub Secrets
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx
```

#### 消息格式

**成功通知（绿色）**:
```
✅ 部署成功

环境: Production
分支: main
提交信息: Add new feature

[访问网站] 按钮
```

**失败通知（红色）**:
```
❌ 定时任务执行失败

任务: make-signals
状态: ❌ 失败
HTTP状态码: 500
时间: 手动触发

响应:
```json
{"error": "Database timeout"}
```

[查看日志] 按钮
```

---

## 🗂️ 日志管理

### cleanup.yml - 自动清理

#### 清理策略
```yaml
保留时间: 30天
最少保留: 50次运行
清理频率: 每周日
清理对象: ci.yml, cron.yml
```

#### 清理规则
```
1. 保留最近50次运行记录
2. 超过30天的记录自动删除
3. 成功和失败记录一视同仁
4. 保留主分支的所有记录
```

#### 手动清理
```bash
# GitHub UI
Actions → Cleanup Old Workflow Runs → Run workflow

# 清理特定工作流
gh run list --workflow=ci.yml --limit=100 --json databaseId \
  | jq -r '.[].databaseId' \
  | xargs -I {} gh run delete {}
```

---

## 🔐 密钥配置

### GitHub Secrets

必需的密钥:

```bash
# Vercel部署
VERCEL_TOKEN=            # Vercel API Token
VERCEL_ORG_ID=           # Vercel组织ID
VERCEL_PROJECT_ID=       # Vercel项目ID
VERCEL_URL=              # 生产环境URL

# 定时任务
CRON_SECRET=             # 保护定时任务端点

# 告警通知（可选）
SLACK_WEBHOOK_URL=       # Slack Webhook
FEISHU_WEBHOOK_URL=      # 飞书Webhook
```

### 添加密钥

```bash
# GitHub UI
Repository → Settings → Secrets and variables → Actions
→ New repository secret

# GitHub CLI
gh secret set VERCEL_TOKEN --body "xxx"
gh secret set SLACK_WEBHOOK_URL --body "https://..."
```

---

## 📊 监控仪表盘

### GitHub Actions 页面

**查看运行历史**:
```
https://github.com/[owner]/[repo]/actions
```

**关键指标**:
- ✅ 成功率
- ⏱️ 平均运行时间
- 📊 趋势图
- 📝 运行日志

### 成功率目标

| 工作流 | 目标 | 当前 |
|--------|------|------|
| CI | ≥95% | - |
| Deploy | ≥98% | - |
| Cron | ≥90% | - |
| Health Check | ≥99% | - |

---

## 🔧 故障排查

### CI失败

**常见原因**:
1. ESLint错误
2. TypeScript类型错误
3. 测试用例失败
4. 构建失败

**解决方法**:
```bash
# 本地运行CI流程
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

### 部署失败

**常见原因**:
1. Vercel Token过期
2. 环境变量缺失
3. 构建超时
4. 依赖冲突

**解决方法**:
```bash
# 检查Vercel配置
vercel whoami
vercel env ls

# 本地测试构建
vercel build
```

### 定时任务失败

**常见原因**:
1. API端点不可达
2. CRON_SECRET错误
3. 数据库连接失败
4. 外部API超时

**解决方法**:
```bash
# 测试端点
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://hotscan.app/api/jobs/make-signals

# 查看应用日志
vercel logs hotscan
```

---

## 📈 性能优化

### CI加速

```yaml
# 使用缓存
- uses: actions/cache@v3
  with:
    path: |
      ~/.pnpm-store
      .next/cache
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}

# 并行执行
jobs:
  lint:
  test:
  build:
    needs: [lint, test]
```

### 部署加速

```yaml
# 预构建
vercel build --prod

# 直接部署构建产物
vercel deploy --prebuilt --prod
```

---

## 🎯 最佳实践

### 1. 分支策略

```
main        → 生产环境
develop     → 开发环境
feature/*   → 功能分支（创建PR）
hotfix/*    → 紧急修复（直接合并main）
```

### 2. 提交规范

```bash
feat: 新功能
fix: Bug修复
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具链

示例:
git commit -m "feat: add signal filtering"
git commit -m "fix: resolve memory leak in job"
```

### 3. PR流程

```
1. 创建feature分支
   ↓
2. 提交代码
   ↓
3. 创建Pull Request
   ↓
4. CI自动检查
   ↓
5. 预览环境部署
   ↓
6. Code Review
   ↓
7. 合并到main
   ↓
8. 自动部署生产环境
```

### 4. 回滚策略

```bash
# Vercel回滚到上一个版本
vercel rollback

# Git回滚
git revert HEAD
git push origin main
# 触发自动部署
```

---

## ✅ 验证清单

- [x] CI工作流（lint/test/build）
- [x] Vercel生产部署
- [x] Vercel预览部署
- [x] 定时任务（3次/天）
- [x] 健康检查（每小时）
- [x] Slack通知集成
- [x] 飞书通知集成
- [x] 日志清理（保留50次）
- [x] 失败告警
- [x] 手动触发支持

---

**DevOps系统完成！自动化运维就绪！** 🚀
