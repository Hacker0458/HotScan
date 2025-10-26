# HotScan 手动部署步骤 - 云服务器

## 🎯 部署目标

- **域名**: https://hexedge.site
- **服务器**: 154.201.78.29
- **数据库**: Neon PostgreSQL
- **面板**: http://154.201.78.29:12700/951dfe8f

---

## 📋 前置条件检查

### 1. SSH 访问配置

由于服务器需要密钥认证，请先配置 SSH：

```bash
# 方法 1: 使用现有 SSH 密钥
ls ~/.ssh/id_rsa

# 如果没有，生成新密钥
ssh-keygen -t rsa -b 4096 -C "fangp458@gmail.com"

# 复制公钥到服务器（需要密码登录一次）
ssh-copy-id root@154.201.78.29

# 测试连接
ssh root@154.201.78.29 "echo '✅ SSH 连接成功'"
```

### 2. 域名 DNS 配置

登录您的域名管理面板，添加 A 记录：

```
类型: A
主机: @
值: 154.201.78.29
TTL: 600

类型: A  
主机: www
值: 154.201.78.29
TTL: 600
```

验证 DNS：
```bash
dig hexedge.site +short
# 应该返回: 154.201.78.29
```

---

## 🚀 部署步骤

### 步骤 1: 本地准备（已完成）

所有部署文件已生成：
- ✅ Dockerfile
- ✅ docker-compose.yml
- ✅ nginx.conf
- ✅ env.production.template
- ✅ auto-deploy-cloud.sh

### 步骤 2: 配置 SSH 密钥（必需）

如果 SSH 连接被拒绝，您需要：

**选项 A: 使用密码登录并配置密钥**

```bash
# 1. 生成 SSH 密钥对（如果没有）
ssh-keygen -t rsa -b 4096 -C "fangp458@gmail.com" -f ~/.ssh/hotscan_deploy

# 2. 手动添加公钥到服务器
# 方法 1: 通过面板的 Web 终端
# 方法 2: 通过密码登录
ssh-copy-id -i ~/.ssh/hotscan_deploy.pub root@154.201.78.29

# 3. 测试连接
ssh -i ~/.ssh/hotscan_deploy root@154.201.78.29 "echo '✅ 连接成功'"
```

**选项 B: 通过服务器面板配置**

1. 访问面板: http://154.201.78.29:12700/951dfe8f
2. 登录: 用户 `3tngqzci`, 密码 `f65f65e6`
3. 找到 SSH 密钥管理或终端功能
4. 添加您的公钥内容到 `/root/.ssh/authorized_keys`

### 步骤 3: 执行部署

#### 方法 1: 一键自动部署（推荐，需要 SSH 密钥）

```bash
# 确保已配置 SSH 密钥后执行
./auto-deploy-cloud.sh
```

#### 方法 2: 手动分步部署

**Step 2.1: 准备部署包**

```bash
# 执行本地打包脚本
./deploy-to-server.sh
```

这将创建 `deploy-package/hotscan-YYYYMMDD-HHMMSS.tar.gz`

**Step 2.2: 通过面板上传文件**

1. 打开面板: http://154.201.78.29:12700/951dfe8f
2. 登录账户
3. 找到文件管理器
4. 上传以下文件到 `/tmp/`:
   - `deploy-package/hotscan-*.tar.gz`
   - `server-deploy.sh`

**Step 2.3: 通过面板终端执行**

在面板的 Web 终端中执行：

```bash
# 1. 进入临时目录
cd /tmp

# 2. 设置执行权限
chmod +x server-deploy.sh

# 3. 执行部署脚本
./server-deploy.sh
```

或者手动执行每一步：

```bash
# 创建部署目录
mkdir -p /opt/hotscan
cd /opt/hotscan

# 解压部署包
tar xzf /tmp/hotscan-*.tar.gz -C /opt/hotscan

# 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 安装 Nginx
apt-get update && apt-get install -y nginx certbot python3-certbot-nginx

# 配置 Nginx
cp /opt/hotscan/nginx.conf /etc/nginx/sites-available/hotscan
ln -sf /etc/nginx/sites-available/hotscan /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# 申请 SSL 证书
certbot --nginx -d hexedge.site -d www.hexedge.site --non-interactive --agree-tos -m fangp458@gmail.com

# 启动应用
cd /opt/hotscan
docker-compose build
docker-compose up -d

# 查看状态
docker-compose ps
docker-compose logs --tail=20

# 健康检查
sleep 20
curl http://localhost:3000/api/health
```

---

## 📊 部署验证

### 1. 容器状态检查

```bash
ssh root@154.201.78.29 'cd /opt/hotscan && docker-compose ps'
```

预期输出：
```
NAME               STATUS              PORTS
hotscan-web        Up (healthy)        0.0.0.0:3000->3000/tcp
hotscan-cron       Up                  
```

### 2. 健康检查

```bash
# 本地检查
ssh root@154.201.78.29 'curl -s http://localhost:3000/api/health'

# 外部检查
curl https://hexedge.site/api/health
```

预期输出：
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

### 3. 首页验证

访问以下地址：
- https://hexedge.site?lang=zh
- https://hexedge.site?lang=en

检查：
- ✅ HTTPS 正常访问
- ✅ Header 显示正确语言
- ✅ 信号卡片显示
- ✅ 语言切换按钮工作

### 4. 定时任务验证

```bash
ssh root@154.201.78.29 'cd /opt/hotscan && docker-compose logs hotscan-cron | tail -20'
```

应该看到定时任务日志

---

## 🛠️ 故障排查

### 问题 1: SSH 连接被拒绝

**症状**: Permission denied

**解决方案**:
1. 使用面板的 Web 终端
2. 或通过面板上传 SSH 公钥
3. 或使用密码登录（如果允许）

### 问题 2: 面板无法访问

**症状**: 404 Not Found

**可能原因**:
- 面板服务未运行
- URL 路径错误
- 防火墙阻止

**解决方案**:
1. 检查服务器防火墙设置
2. 尝试直接访问服务器 IP
3. 联系服务器提供商

### 问题 3: Docker 构建失败

**症状**: Docker build error

**解决方案**:
```bash
# 查看详细日志
docker-compose build --no-cache --progress=plain

# 清理缓存
docker system prune -a

# 重新构建
docker-compose build
```

### 问题 4: SSL 证书申请失败

**症状**: certbot error

**解决方案**:
```bash
# 确保 DNS 已生效
dig hexedge.site

# 手动申请
certbot --nginx -d hexedge.site --email fangp458@gmail.com

# 查看日志
certbot certificates
```

---

## 🔄 替代部署方案

### 方案 A: 使用 GitHub Actions 自动部署

如果服务器配置困难，可以：

1. 推送代码到 GitHub
2. 配置 GitHub Actions
3. 通过 Webhook 触发服务器拉取

### 方案 B: 使用 Vercel 部署（最简单）

```bash
# 已有的 Vercel 部署
vercel deploy --prod

# 优点:
# - 无需服务器配置
# - 自动 HTTPS
# - CDN 加速
# - 零运维

# 缺点:
# - 无法自定义域名（免费版）
# - 定时任务受限
```

### 方案 C: 手动配置服务器（无脚本）

1. 登录服务器面板
2. 通过 Web 终端逐条执行命令
3. 手动上传文件
4. 手动配置 Nginx

---

## 📞 需要帮助

如果遇到以下情况：

1. **无法 SSH 连接服务器**
   - 需要您提供 SSH 密钥
   - 或通过面板 Web 终端操作

2. **面板无法访问**
   - 需要确认面板 URL 是否正确
   - 或提供其他访问方式

3. **DNS 未配置**
   - 需要在域名管理后台添加 A 记录
   - 指向 154.201.78.29

---

## ✅ 下一步行动

### 立即可做的事：

1. **配置 SSH 访问**（必需）
   ```bash
   # 生成密钥
   ssh-keygen -t rsa -b 4096
   
   # 查看公钥
   cat ~/.ssh/id_rsa.pub
   ```
   
   然后通过面板将公钥添加到服务器

2. **配置域名 DNS**（必需）
   - 登录域名管理后台
   - 添加 A 记录指向 154.201.78.29

3. **选择部署方式**
   - 方式 1: SSH 配置好后，运行 `./auto-deploy-cloud.sh`
   - 方式 2: 通过面板 Web 终端手动部署
   - 方式 3: 继续使用 Vercel（已部署）

---

## 📋 当前状态

- ✅ 本地开发环境正常运行
- ✅ i18n 系统完整集成
- ✅ API 去重和双语支持完成
- ✅ Docker 配置文件已生成
- ✅ 部署脚本已准备
- ⏳ 等待 SSH 访问配置
- ⏳ 等待 DNS 配置

---

**下一步**: 请提供 SSH 访问方式或选择通过面板 Web 终端手动部署

