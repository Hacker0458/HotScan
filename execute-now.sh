#!/bin/bash
# 立即执行版本 - 尝试完全自动化

set -e

echo "🚀 开始自动化部署..."
echo ""

# 1. 尝试从 Vercel CLI 获取 DATABASE_URL
echo "▶ 步骤 1: 检查 Vercel CLI..."
if vercel whoami &>/dev/null; then
    echo "✓ Vercel CLI 已登录，尝试获取环境变量..."
    vercel env pull .env.vercel.production --yes &>/dev/null || true
    
    if [ -f ".env.vercel.production" ]; then
        DATABASE_URL=$(grep '^DATABASE_URL=' .env.vercel.production | cut -d'=' -f2-)
        if [ ! -z "$DATABASE_URL" ]; then
            echo "✅ 成功自动获取 DATABASE_URL"
        fi
    fi
fi

# 2. 如果没有，尝试从之前保存的文件获取
if [ -z "$DATABASE_URL" ] && [ -f "DEPLOYMENT_SUCCESS.md" ]; then
    echo "▶ 尝试从部署记录中获取..."
    DATABASE_URL=$(grep 'DATABASE_URL' DEPLOYMENT_SUCCESS.md | grep 'postgresql://' | head -1 | sed 's/.*postgresql/postgresql/' | cut -d' ' -f1 | tr -d '`')
    if [ ! -z "$DATABASE_URL" ]; then
        echo "✅ 从部署记录中找到 DATABASE_URL"
    fi
fi

# 3. 检查 GitHub CLI
echo ""
echo "▶ 步骤 2: 检查 GitHub CLI..."
if gh auth status &>/dev/null; then
    echo "✅ GitHub CLI 已认证"
    GITHUB_OK=true
else
    echo "⚠️  GitHub CLI 未认证"
    GITHUB_OK=false
fi

# 显示状态
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【当前状态】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -z "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL: 已获取 (${DATABASE_URL:0:30}...)"
else
    echo "❌ DATABASE_URL: 未获取"
fi

if [ "$GITHUB_OK" = true ]; then
    echo "✅ GitHub 认证: 已完成"
else
    echo "❌ GitHub 认证: 需要 Token"
fi

echo ""

# 判断是否可以完全自动执行
if [ ! -z "$DATABASE_URL" ] && [ "$GITHUB_OK" = true ]; then
    echo "🎉 所有条件满足，开始完全自动部署..."
    echo ""
    
    # 执行部署
    bash deploy-all.sh "$(gh auth token)" "$DATABASE_URL"
else
    echo "⚠️  需要手动提供一些信息"
    echo ""
    echo "请运行以下命令之一:"
    echo ""
    if [ ! -z "$DATABASE_URL" ]; then
        echo "# DATABASE_URL 已自动获取，只需要 GitHub Token:"
        echo "./ultra-auto-deploy.sh"
    elif [ "$GITHUB_OK" = true ]; then
        echo "# GitHub 已认证，只需要 DATABASE_URL:"
        echo "./ultra-auto-deploy.sh"
    else
        echo "# 需要两个值:"
        echo "./ultra-auto-deploy.sh"
        echo ""
        echo "或者直接运行:"
        echo 'bash deploy-all.sh "GitHub_Token" "DATABASE_URL"'
    fi
fi

