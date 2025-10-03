#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 修复 DATABASE_URL Secret"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "打开 Vercel Dashboard..."
open "https://vercel.com/fangp458-2547s-projects/hotscan/settings/environment-variables" 2>/dev/null

echo ""
echo "请在打开的页面中:"
echo "  1. 找到 DATABASE_URL"
echo "  2. 点击 'Click to reveal'"
echo "  3. 复制完整的 postgresql:// 连接字符串"
echo ""
read -p "请粘贴 DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL 不能为空"
    exit 1
fi

if ! echo "$DATABASE_URL" | grep -q "postgresql://"; then
    echo "⚠️  警告: DATABASE_URL 不是以 postgresql:// 开头"
    echo "当前值: ${DATABASE_URL:0:50}..."
    read -p "是否继续? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "▶ 更新 GitHub Secret..."
echo "$DATABASE_URL" | gh secret set DATABASE_URL --repo Hacker0458/HotScan

echo ""
echo "✅ DATABASE_URL 已更新"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【下一步】重新触发 GitHub Actions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "运行:"
echo "  gh workflow run cron.yml --repo Hacker0458/HotScan"
echo ""
echo "然后监控:"
echo "  gh run watch --repo Hacker0458/HotScan"
echo ""

