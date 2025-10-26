# HotScan 云服务器部署 - 完整方案

## 📅 生成时间
2025-10-04 17:00 CST

---

## ✅ 已完成的部署文件

### 1. Docker 配置

#### Dockerfile
- **路径**: `Dockerfile`
- **功能**: 
  - 多阶段构建优化镜像大小
  - 包含 Prisma Client 生成
  - Next.js standalone 输出
  - 非 root 用户运行（安全）

#### docker-compose.yml
- **路径**: `docker-compose.yml`
- **服务**:
  - `hotscan-web`: Next.js 应用（端口 3000）
  - `hotscan-cron`: 定时任务（每 30 分钟）
- **功能**:
  - 自动重启（unless-stopped）
  - 健康检查（每 30 秒）
  - 环境变量注入
  - 网络隔离

### 2. Nginx 配置

#### nginx.conf
- **路径**: `nginx.conf`
- **功能**:
  - HTTP to HTTPS 重定向
  - SSL/TLS 配置
  - 反向代理到 localhost:3000
  - Gzip 压缩
  - 安全头部
  - API 路由不缓存
  - 静态资源长缓存

### 3. 环境变量

#### env.production.template
- **路径**: `env.production.template`
- **包含**:
  - DATABASE_URL
  - OPENAI_API_KEY / API_BASE
  - Next.js 配置
  - AI 设置
  - 域名配置

### 4. 部署脚本

#### deploy-to-server.sh
- **路径**: `deploy-to-server.sh`
- **功能**:
  - 本地环境准备
  - 打包应用
  - 生成服务器脚本
  - 部署指南

#### auto-deploy-cloud.sh
- **路径**: `auto-deploy-cloud.sh`
- **功能**: 一键自动部署
  - 创建 .env.production
  - 生成 Prisma Client
  - 打包应用
  - 上传到服务器
  - SSH 远程部署
  - 健康检查验证

#### server-deploy.sh
- **路径**: `server-deploy.sh`
- **功能**: 服务器端执行
  - 安装 Docker / Docker Compose / Nginx
  - 配置 Nginx
  - 申请 SSL 证书（Let's Encrypt）
  - 启动 Docker 容器
  - 健康检查
  - 触发首次信号生成

### 5. 文档

#### CLOUD_DEPLOY_GUIDE.md
- **路径**: `CLOUD_DEPLOY_GUIDE.md`
- **内容**:
  - 前置条件
  - 快速部署步骤
  - 部署后验证
  - 常用操作
  - 故障排查
  - 监控和维护

---

## 🚀 部署流程

### 方式 1: 全自动部署（推荐）

**一条命令完成所有操作**:

```bash
./auto-deploy-cloud.sh
```

**执行内容**:
1. ✅ 创建 .env.production
2. ✅ 生成 Prisma Client
3. ✅ 打包应用
4. ✅ 上传到服务器
5. ✅ SSH 远程部署
6. ✅ 安装依赖（Docker, Nginx）
7. ✅ 配置 Nginx
8. ✅ 申请 SSL 证书
9. ✅ 启动 Docker 容器
10. ✅ 健康检查验证

**预计时间**: 5-10 分钟

---

### 方式 2: 半自动部署

#### 步骤 1: 本地准备

```bash
chmod +x deploy-to-server.sh
./deploy-to-server.sh
```

#### 步骤 2: 上传到服务器

```bash
# 上传部署包
scp deploy-package/hotscan-*.tar.gz root@154.201.78.29:/tmp/

# 上传服务器脚本
scp server-deploy.sh root@154.201.78.29:/tmp/
```

#### 步骤 3: SSH 到服务器

```bash
ssh root@154.201.78.29
```

#### 步骤 4: 执行部署

```bash
cd /tmp
chmod +x server-deploy.sh
./server-deploy.sh
```

---

### 方式 3: 手动部署

详见 `CLOUD_DEPLOY_GUIDE.md`

---

## 📊 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                           │
│                  https://hexedge.site                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS (443)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Nginx (反向代理)                        │
│                  SSL/TLS Termination                        │
│              HTTP to HTTPS Redirect                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP (3000)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Docker Compose Network                         │
│  ┌───────────────────────┐  ┌───────────────────────┐     │
│  │   hotscan-web         │  │   hotscan-cron        │     │
│  │   (Next.js App)       │  │   (定时任务)           │     │
│  │   Port: 3000          │  │   每 30 分钟           │     │
│  │   Health Check ✅      │  │   make-signals        │     │
│  └───────────────────────┘  └───────────────────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ PostgreSQL Protocol
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Neon PostgreSQL Database                         │
│         (ep-frosty-frog-a1cazil9)                          │
│              AWS ap-southeast-1                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 核心配置说明

### 1. Docker Compose 服务

#### hotscan-web
- **作用**: Next.js 应用主服务
- **端口**: 3000
- **重启策略**: unless-stopped
- **健康检查**: 每 30 秒检查 /api/health

#### hotscan-cron
- **作用**: 定时生成信号
- **频率**: 每 30 分钟
- **命令**: 
  ```bash
  while true; do
    pnpm tsx /app/jobs/make-signals.ts
    sleep 1800  # 30 分钟
  done
  ```

### 2. Nginx 配置

- **HTTP**: 重定向到 HTTPS
- **HTTPS**: SSL/TLS 加密
- **反向代理**: localhost:3000
- **静态资源**: 长缓存（1 年）
- **API 路由**: 不缓存
- **Gzip**: 开启压缩

### 3. SSL 证书

- **提供商**: Let's Encrypt
- **工具**: certbot
- **域名**: hexedge.site + www.hexedge.site
- **自动续期**: certbot 自动配置

### 4. 环境变量

| 变量 | 值 | 说明 |
|------|---|------|
| `DOMAIN` | hexedge.site | 您的域名 |
| `EMAIL` | fangp458@gmail.com | SSL 证书邮箱 |
| `DATABASE_URL` | postgresql://... | Neon 数据库 |
| `OPENAI_API_KEY` | sk-... | AI API Key |
| `OPENAI_API_BASE` | https://aium.cc/v1/ | AI 代理 URL |

---

## ✅ 部署后验证清单

### 1. 基础验证

```bash
# HTTPS 健康检查
curl https://hexedge.site/api/health

# 预期输出:
{
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

### 2. 首页验证

**中文版**:
```
https://hexedge.site?lang=zh
```

**检查项**:
- ✅ Header 显示 "首页" / "术语百科"
- ✅ 语言切换按钮可见
- ✅ 信号卡片显示（去重后）
- ✅ 每个卡片显示价格、涨跌幅、摘要
- ✅ 点击卡片可进入详情页

**英文版**:
```
https://hexedge.site?lang=en
```

**检查项**:
- ✅ Header 显示 "Home" / "Learn"
- ✅ 卡片标签为英文
- ✅ 功能正常

### 3. 详情页验证

```
https://hexedge.site/asset/{assetId}?lang=zh
```

**检查项**:
- ✅ 资产信息完整
- ✅ 关键指标显示
- ✅ 历史信号列表
- ✅ 返回首页链接

### 4. API 验证

```bash
# 信号 API（中文）
curl https://hexedge.site/api/signals?limit=2&lang=zh

# 信号 API（英文）
curl https://hexedge.site/api/signals?limit=2&lang=en
```

### 5. 定时任务验证

```bash
# SSH 到服务器
ssh root@154.201.78.29

# 查看 cron 容器日志
cd /opt/hotscan
docker-compose logs hotscan-cron

# 预期: 每 30 分钟看到 "🚀 Running make-signals..."
```

---

## 🛠️ 常用操作

### 查看日志

```bash
# SSH 到服务器
ssh root@154.201.78.29

# 查看所有日志
cd /opt/hotscan
docker-compose logs -f

# 只看 web 服务
docker-compose logs -f hotscan-web

# 只看 cron 服务
docker-compose logs -f hotscan-cron
```

### 重启服务

```bash
cd /opt/hotscan

# 重启所有服务
docker-compose restart

# 只重启 web
docker-compose restart hotscan-web

# 只重启 cron
docker-compose restart hotscan-cron
```

### 更新代码

```bash
# 本地: 重新打包并上传
./auto-deploy-cloud.sh

# 或手动:
# 1. 打包
tar czf hotscan-new.tar.gz .

# 2. 上传
scp hotscan-new.tar.gz root@154.201.78.29:/tmp/

# 3. 服务器: 解压并重启
ssh root@154.201.78.29
cd /opt/hotscan
tar xzf /tmp/hotscan-new.tar.gz
docker-compose restart
```

### 手动触发信号生成

```bash
cd /opt/hotscan
docker-compose exec hotscan-web pnpm tsx /app/jobs/make-signals.ts
```

### 数据库迁移

```bash
cd /opt/hotscan
docker-compose exec hotscan-web pnpm prisma migrate deploy
```

---

## 🔍 故障排查

### 问题 1: 无法访问网站

**症状**: https://hexedge.site 打不开

**排查**:
```bash
# 1. 检查 DNS 解析
dig hexedge.site

# 2. 检查 Nginx 状态
systemctl status nginx

# 3. 检查 Nginx 配置
nginx -t

# 4. 查看 Nginx 日志
tail -f /var/log/nginx/error.log

# 5. 检查 Docker 容器
docker-compose ps

# 6. 检查端口
netstat -tlnp | grep 3000
```

**解决方法**:
- 确认域名 A 记录指向服务器 IP
- 重启 Nginx: `systemctl restart nginx`
- 重启容器: `docker-compose restart`

### 问题 2: SSL 证书申请失败

**症状**: certbot 报错

**排查**:
```bash
# 查看 certbot 日志
certbot certificates

# 测试 DNS
curl -I http://hexedge.site
```

**解决方法**:
```bash
# 手动申请
certbot --nginx -d hexedge.site -d www.hexedge.site --email fangp458@gmail.com
```

### 问题 3: 应用健康检查失败

**症状**: Health check failing

**排查**:
```bash
# 查看容器日志
docker-compose logs hotscan-web

# 直接访问
curl http://localhost:3000/api/health

# 检查数据库连接
docker-compose exec hotscan-web pnpm prisma db pull
```

**解决方法**:
- 检查 DATABASE_URL 是否正确
- 确认数据库可访问
- 查看错误日志

### 问题 4: 定时任务不运行

**症状**: 信号不更新

**排查**:
```bash
# 查看 cron 容器状态
docker-compose ps hotscan-cron

# 查看 cron 日志
docker-compose logs hotscan-cron

# 手动运行
docker-compose exec hotscan-cron pnpm tsx /app/jobs/make-signals.ts
```

**解决方法**:
- 检查容器是否运行
- 查看日志中的错误
- 确认数据库连接

---

## 📈 监控建议

### 1. 应用监控

```bash
# 定期检查健康
*/5 * * * * curl -f https://hexedge.site/api/health || echo "Health check failed" | mail -s "HotScan Alert" your@email.com
```

### 2. 资源监控

```bash
# Docker 容器状态
docker stats

# 磁盘空间
df -h

# 内存使用
free -h
```

### 3. 日志监控

```bash
# 实时查看错误
docker-compose logs -f | grep -i error

# 统计请求量
docker-compose logs hotscan-web | grep "GET /" | wc -l
```

---

## 🔐 安全配置

### 1. 防火墙

```bash
# 只开放必要端口
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw enable
ufw status
```

### 2. SSH 安全

```bash
# 禁用密码登录，只允许密钥
vi /etc/ssh/sshd_config
# PasswordAuthentication no
# PubkeyAuthentication yes

systemctl restart sshd
```

### 3. Docker 安全

```bash
# 限制容器资源
# 在 docker-compose.yml 添加:
resources:
  limits:
    cpus: '0.5'
    memory: 512M
```

---

## 🎯 性能优化

### 1. Nginx 缓存

```nginx
# 添加到 nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=hotscan_cache:10m max_size=100m inactive=60m;
proxy_cache hotscan_cache;
proxy_cache_valid 200 10m;
```

### 2. Docker 优化

```yaml
# docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 1G
    reservations:
      memory: 512M
```

### 3. Next.js 优化

- ✅ 已启用 standalone 输出
- ✅ 已启用 Gzip 压缩
- ✅ 静态资源长缓存

---

## 📝 维护计划

### 每天

- ✅ 自动定时任务（Docker Compose）
- ✅ 自动健康检查

### 每周

- 检查日志
- 查看错误率
- 监控磁盘空间

### 每月

- 更新系统包
- 更新 Docker 镜像
- 检查 SSL 证书有效期
- 清理旧日志

---

## 🎊 部署完成标志

### ✅ 基础服务

- ✅ Docker 容器运行中
- ✅ Nginx 运行中
- ✅ SSL 证书有效
- ✅ 健康检查通过

### ✅ 应用功能

- ✅ 首页可访问（中文/英文）
- ✅ 语言切换正常
- ✅ 信号数据显示（去重）
- ✅ 详情页正常
- ✅ API 响应正常

### ✅ 定时任务

- ✅ cron 容器运行
- ✅ 每 30 分钟生成信号
- ✅ 日志正常输出

---

## 📞 技术支持

### 服务器信息

- **IP**: 154.201.78.29
- **面板**: http://154.201.78.29:12700/951dfe8f
- **用户**: 3tngqzci
- **密码**: f65f65e6

### 域名信息

- **主域名**: hexedge.site
- **子域名**: www.hexedge.site
- **DNS**: 需要 A 记录指向 154.201.78.29

### 数据库信息

- **提供商**: Neon
- **区域**: AWS ap-southeast-1
- **数据库**: neondb
- **连接池**: enabled

---

## 🚀 下一步优化

### 短期（1 周）

1. **监控系统**
   - Uptime Robot
   - Prometheus + Grafana
   - 邮件告警

2. **备份系统**
   - 定期数据库备份
   - Docker 镜像备份
   - 配置文件备份

3. **CI/CD**
   - GitHub Actions 自动部署
   - 自动化测试
   - 滚动更新

### 中期（1 个月）

4. **性能优化**
   - CDN 加速
   - Redis 缓存
   - 负载均衡

5. **安全加固**
   - WAF 防护
   - DDoS 防护
   - 定期安全扫描

### 长期（3 个月）

6. **高可用**
   - 多服务器部署
   - 数据库主从
   - 自动故障转移

7. **可观测性**
   - 分布式追踪
   - 日志聚合
   - 性能分析

---

**文档生成时间**: 2025-10-04 17:00 CST  
**部署目标**: https://hexedge.site  
**服务器**: 154.201.78.29  
**状态**: ✅ 就绪，等待执行

