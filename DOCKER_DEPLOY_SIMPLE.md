# 🐳 Docker 一键部署指南

## 🚀 超简单 - 3步完成部署

### 步骤1: SSH连接到服务器

```bash
ssh root@154.201.78.29
```

密码: `JFroson 081130`

---

### 步骤2: 复制粘贴以下完整命令

连接成功后，**复制整个代码块**，粘贴到终端：

```bash
cd /www/wwwroot/hotscan.jfroson.com && \
git pull && \
cat > .env << 'EOF'
DATABASE_URL=postgresql://hotscan:HotScan2025@172.17.0.1:5432/hotscan?schema=public
PROBEX_API_KEY=sk-JaLWJy75i0t0gzrY41V7uMAjI2TcEga4Ojg6mF96nhFzQLyo
AIUM_API_KEY=sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU
CHATAIAPI_KEY=sk-dXYiVkp3MihKRdWcQoBOsA5ZP3GYZPEoVjUJG0hAzPaSXK06
NEXTAUTH_URL=https://hotscan.jfroson.com
DATASOURCE=dexscreener
NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS=15000
NODE_ENV=production
EOF
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env && \
echo "JOB_TOKEN=$(openssl rand -base64 32)" >> .env && \
echo "✅ 环境配置完成" && \
docker compose down 2>/dev/null || true && \
docker compose up -d --build && \
echo "" && \
echo "⏳ 等待容器启动（30秒）..." && \
sleep 30 && \
echo "" && \
echo "📊 容器状态:" && \
docker ps && \
echo "" && \
echo "📝 应用日志:" && \
docker logs hotscan --tail 30 && \
echo "" && \
echo "╔═══════════════════════════════════════════════════════╗" && \
echo "║              🎉 部署完成！                           ║" && \
echo "╚═══════════════════════════════════════════════════════╝" && \
echo "" && \
echo "🌐 访问: https://hotscan.jfroson.com"
```

---

### 步骤3: 等待完成

- 构建过程需要 **10-15分钟**
- 看到 "🎉 部署完成！" 就成功了
- 然后访问: **https://hotscan.jfroson.com**

---

## 📊 管理命令

部署完成后，这些命令很有用：

```bash
# 查看容器状态
docker ps

# 查看实时日志
docker logs hotscan -f

# 重启容器
docker restart hotscan

# 停止容器
docker stop hotscan

# 启动容器
docker start hotscan

# 重新构建并启动
docker compose up -d --build
```

---

## 🔧 故障排查

### 如果容器无法启动

```bash
# 查看详细日志
docker logs hotscan

# 查看容器状态
docker ps -a

# 重新构建
docker compose down
docker compose up -d --build
```

### 如果构建失败

```bash
# 清理并重试
docker system prune -af
cd /www/wwwroot/hotscan.jfroson.com
git pull
docker compose up -d --build
```

---

## ✨ 就这么简单！

1. SSH到服务器
2. 复制粘贴命令
3. 等待10-15分钟
4. 访问网站 ✅

**需要帮助？** 查看日志: `docker logs hotscan -f`

