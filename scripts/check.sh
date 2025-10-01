#!/bin/bash

# 代码质量检查脚本
# 在提交前运行此脚本确保代码质量

set -e

echo "🔍 运行代码质量检查..."
echo ""

# ESLint
echo "📝 运行 ESLint..."
pnpm lint
echo "✅ ESLint 检查通过"
echo ""

# TypeScript 类型检查
echo "🔧 运行 TypeScript 类型检查..."
pnpm type-check
echo "✅ 类型检查通过"
echo ""

# 运行测试
echo "🧪 运行测试..."
pnpm test
echo "✅ 测试通过"
echo ""

# 尝试构建
echo "🏗️  尝试构建..."
pnpm build
echo "✅ 构建成功"
echo ""

echo "✨ 所有检查通过！可以安全提交代码。"
