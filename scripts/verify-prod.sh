#!/bin/bash

PROD_URL="https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app"

echo "测试生产环境 API..."
echo ""

# 尝试使用浏览器的 User-Agent
curl -s -A "Mozilla/5.0" "${PROD_URL}/api/signals?limit=3" 2>&1 | jq '{
  success: .success,
  has_meta: has("meta"),
  signals: [.data[]? | {
    symbol: .asset?.symbol // "N/A",
    price: .pair?.priceUsd // null,
    delta1h: .pair?.priceChange1h // null,
    delta24h: .pair?.priceChange24h // null,
    hasSummary: (if .aiSummary then true else false end),
    summaryPreview: (.aiSummary?[:60] // "N/A")
  }]
}' 2>&1

echo ""
echo "如果看到数据，说明生产环境已正常！"

