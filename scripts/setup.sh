#!/bin/bash

# HotScan 项目快速设置脚本
# 自动化设置开发环境

set -e

echo "🚀 HotScan 项目设置向导"
echo "========================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js >= 18.0.0"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm 未安装，正在安装..."
    npm install -g pnpm
fi

echo "✅ pnpm 版本: $(pnpm -v)"

# 安装依赖
echo ""
echo "📦 安装项目依赖..."
pnpm install

# 设置环境变量
if [ ! -f .env ]; then
    echo ""
    echo "🔧 设置环境变量..."
    cp env.example .env
    echo "✅ 已创建 .env 文件"
    echo "⚠️  请编辑 .env 文件并填入必要的配置"
    echo ""
    echo "必需配置："
    echo "  - DATABASE_URL"
    echo "  - NEXTAUTH_SECRET (使用 openssl rand -base64 32 生成)"
    echo "  - OPENAI_API_KEY (可选)"
else
    echo "✅ .env 文件已存在"
fi

# 询问是否设置数据库
echo ""
read -p "是否要推送数据库 schema? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  推送数据库 schema..."
    pnpm db:push
    echo "✅ 数据库 schema 已更新"
    
    read -p "是否要填充示例数据? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 填充示例数据..."
        pnpm db:seed
        echo "✅ 示例数据已添加"
    fi
fi

echo ""
echo "✨ 设置完成！"
echo ""
echo "下一步："
echo "  1. 编辑 .env 文件配置环境变量"
echo "  2. 运行 'pnpm dev' 启动开发服务器"
echo "  3. 访问 http://localhost:3000"
echo ""
echo "需要帮助? 查看 QUICKSTART.md 或 README.md"
echo ""
