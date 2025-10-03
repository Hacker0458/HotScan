#!/bin/bash

GITHUB_TOKEN="$1"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "使用方法: bash final-deploy.sh <GitHub_Token>"
    exit 1
fi

# 使用 Vercel API 获取 DATABASE_URL
VERCEL_TOKEN="DVgcH5HMWBPILpZK8DB8KhVN"
PROJECT_ID="prj_a853WBJzXGAqF2mwzBDMM2wQelzO"

echo "▶ 获取 DATABASE_URL..."
RESPONSE=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env")

DATABASE_URL=$(echo "$RESPONSE" | grep -A 10 '"key":"DATABASE_URL"' | grep '"value"' | head -1 | sed 's/.*"value":"\([^"]*\)".*/\1/')

if [ -z "$DATABASE_URL" ]; then
    echo "❌ 无法获取 DATABASE_URL"
    exit 1
fi

echo "✅ DATABASE_URL 已获取"
echo ""
echo "开始部署..."
echo ""

# 调用主部署脚本
bash deploy-all.sh "$GITHUB_TOKEN" "$DATABASE_URL"

