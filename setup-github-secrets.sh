#!/bin/bash

# HotScan GitHub Secrets 配置脚本
# 使用方法: 
#   1. 从 Vercel Dashboard 复制 DATABASE_URL
#   2. 替换下面的 <PASTE_DATABASE_URL_HERE>
#   3. 运行: bash setup-github-secrets.sh

DATABASE_URL="<PASTE_DATABASE_URL_HERE>"
OPENAI_API_KEY="sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU"
OPENAI_API_BASE="https://aium.cc/v1/"
DATASOURCE="dexscreener"
MOCK_AI="0"

# 检查 gh CLI 是否安装
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) 未安装"
    echo "   请访问: https://cli.github.com/"
    echo ""
    echo "   或者手动在 GitHub 网页添加 Secrets:"
    echo "   https://github.com/<YOUR_REPO>/settings/secrets/actions"
    echo ""
    echo "   需要添加的 Secrets:"
    echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "   DATABASE_URL     = $DATABASE_URL"
    echo "   OPENAI_API_KEY   = sk-JygunTZ...wmrtF8nYBU"
    echo "   OPENAI_API_BASE  = https://aium.cc/v1/"
    echo "   DATASOURCE       = dexscreener"
    echo "   MOCK_AI          = 0"
    exit 1
fi

# 设置 Secrets
echo "设置 GitHub Secrets..."

gh secret set DATABASE_URL --body "$DATABASE_URL"
gh secret set OPENAI_API_KEY --body "$OPENAI_API_KEY"
gh secret set OPENAI_API_BASE --body "$OPENAI_API_BASE"
gh secret set DATASOURCE --body "$DATASOURCE"
gh secret set MOCK_AI --body "$MOCK_AI"

echo ""
echo "✅ GitHub Secrets 配置完成！"
echo ""
echo "验证:"
gh secret list

