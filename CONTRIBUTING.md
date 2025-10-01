# 贡献指南

感谢你考虑为 HotScan 贡献！我们欢迎所有形式的贡献。

## 行为准则

请保持友善和尊重。我们致力于为每个人提供一个无骚扰的体验。

## 如何贡献

### 报告 Bug

如果你发现了一个 bug，请创建一个 Issue，包含：

- **清晰的标题和描述**
- **复现步骤**
- **预期行为**
- **实际行为**
- **截图（如果适用）**
- **环境信息**（浏览器、操作系统等）

### 提出新功能

我们欢迎新功能建议！请先创建一个 Issue 讨论：

- **问题/需求描述**
- **建议的解决方案**
- **替代方案**
- **对现有功能的影响**

### 提交代码

1. **Fork 项目**

```bash
git clone https://github.com/yourusername/hotscan.git
cd hotscan
```

2. **创建分支**

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

3. **安装依赖**

```bash
pnpm install
```

4. **进行更改**

- 遵循现有的代码风格
- 添加必要的测试
- 更新相关文档

5. **运行测试**

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

6. **提交代码**

使用语义化的提交信息：

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update README"
```

提交类型：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

7. **推送并创建 PR**

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

### Pull Request 指南

好的 PR 应该：

- ✅ 有清晰的标题和描述
- ✅ 链接相关的 Issue
- ✅ 通过所有 CI 检查
- ✅ 包含必要的测试
- ✅ 更新相关文档
- ✅ 遵循代码风格
- ✅ 保持小而专注

## 开发设置

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL 数据库
- OpenAI API Key

### 本地开发

```bash
# 安装依赖
pnpm install

# 设置环境变量
cp env.example .env
# 编辑 .env 文件

# 设置数据库
pnpm db:push
pnpm db:seed

# 启动开发服务器
pnpm dev
```

### 代码风格

我们使用：
- **ESLint** - 代码检查
- **Prettier** - 代码格式化（通过 ESLint）
- **TypeScript** - 类型检查

运行检查：
```bash
pnpm lint
pnpm type-check
```

### 测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test -- --watch

# 覆盖率报告
pnpm test:coverage
```

### 项目结构

```
src/
├── app/          # Next.js 页面和 API
├── components/   # React 组件
├── lib/          # 工具库和业务逻辑
├── types/        # TypeScript 类型
└── __tests__/    # 测试文件
```

## 文档

更新文档时：

- 保持清晰和简洁
- 包含代码示例
- 更新相关的 README
- 添加必要的注释

## 社区

- **GitHub Issues**: 报告问题和讨论
- **Pull Requests**: 代码贡献
- **Discussions**: 一般讨论和问题

## 许可证

通过贡献代码，你同意你的贡献将在 [MIT License](LICENSE) 下授权。

## 问题？

如有任何问题，请：
- 创建 Issue
- 或发送邮件到 support@hotscan.example.com

感谢你的贡献！ 🙏
