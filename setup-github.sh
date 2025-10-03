#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "【HotScan GitHub 自动配置脚本】"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. 创建 GitHub 仓库（使用 gh CLI）
echo "1. 创建 GitHub 仓库..."
if command -v gh &> /dev/null; then
    gh repo create HotScan --public --description "HotScan｜热点雷达 - 实时加密货币市场信号监测系统" --source=. --remote=origin
    if [ $? -eq 0 ]; then
        echo "✅ 仓库创建成功"
    else
        echo "⚠️  仓库可能已存在，继续..."
        git remote add origin https://github.com/Hacker0458/HotScan.git 2>/dev/null || true
    fi
else
    echo "⚠️  gh CLI 未安装，请手动创建仓库:"
    echo "   访问: https://github.com/new"
    echo "   仓库名: HotScan"
    echo ""
    read -p "创建完成后按回车继续..."
    git remote add origin https://github.com/Hacker0458/HotScan.git 2>/dev/null || true
fi

# 2. 提交并推送代码
echo ""
echo "2. 提交并推送代码..."
git add -A
git commit -m "feat: 初始化 HotScan 项目 - 添加 DexScreener 数据源和 GitHub Actions" || true
git branch -M main
git push -u origin main

echo ""
echo "✅ 代码推送成功！"
echo ""

