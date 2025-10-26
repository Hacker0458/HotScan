# HotScan 云服务器部署 - 实用指南

## 📋 当前状况诊断

### 面板访问
- **URL**: http://154.201.78.29:12700/951dfe8f
- **状态**: ❌ 404 Not Found
- **原因**: 面板可能已关闭或路径变更

### SSH 访问
- **服务器**: root@154.201.78.29
- **状态**: ❌ Permission denied
- **原因**: 需要配置 SSH 密钥或密码认证

---

## 🔐 方案 A: 配置 SSH 密钥（推荐）

### 步骤 1: 生成 SSH 密钥（如果没有）

```bash
# 检查是否已有密钥
ls -la ~/.ssh/id_rsa*

# 如果没有，生成新密钥
ssh-keygen -t rsa -b 4096 -C "fangp458@gmail.com" -f ~/.ssh/id_rsa_hotscan

# 查看公钥
cat ~/.ssh/id_rsa_hotscan.pub
```

### 步骤 2: 将公钥添加到服务器

**方法 1: 通过服务器面板**
1. 登录面板: http://154.201.78.29:12700
2. 找到 SSH 密钥管理或终端功能
3. 添加公钥到 `~/.ssh/authorized_keys`

**方法 2: 使用密码登录（一次性）**
```bash
# 使用密码登录
ssh root@154.201.78.29

# 创建 .ssh 目录
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 添加公钥
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 退出
exit
```

### 步骤 3: 测试 SSH 连接

```bash
ssh -i ~/.ssh/id_rsa_hotscan root@154.201.78.29
```

如果成功连接，继续部署。

---

## 🚀 方案 B: 使用面板直接部署

如果面板有终端或文件管理功能：

### 步骤 1: 通过面板上传文件

1. 登录面板
2. 找到文件管理器
3. 上传以下文件到 `/opt/hotscan`:
   - docker-compose.yml
   - Dockerfile
   - nginx.conf
   - .env.production
   - 整个项目代码

### 步骤 2: 在面板终端执行

```bash
cd /opt/hotscan

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 🎯 方案 C: 本地部署包 + 手动上传

### 步骤 1: 创建部署包

```bash
cd "/Users/fang/Desktop/💻 开发项目/HotScan｜热点雷达"

# 执行部署准备脚本
./deploy-to-server.sh
```

这将生成：
- ✅ `deploy-package/hotscan-YYYYMMDD-HHMMSS.tar.gz`
- ✅ `server-deploy.sh`
- ✅ `.env.production`

### 步骤 2: 通过面板上传部署包

1. 登录面板文件管理器
2. 创建目录 `/opt/hotscan`
3. 上传 `hotscan-*.tar.gz` 到服务器
4. 在面板终端解压：
   ```bash
   cd /opt/hotscan
   tar xzf hotscan-*.tar.gz
   ```

### 步骤 3: 在面板终端执行部署

```bash
cd /opt/hotscan

# 创建 .env.production
cat > .env.production <<'EOF'
DATABASE_URL=postgresql://neondb_owner:npg_F7iA5rNzByYP@ep-frosty-frog-a1cazil9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
OPENAI_API_KEY=sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU
OPENAI_API_BASE=https://aium.cc/v1/
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://hexedge.site
NEXTAUTH_URL=https://hexedge.site
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXT_PUBLIC_HOMEPAGE_REFRESH_INTERVAL_MS=15000
ENABLE_AI_SUMMARY=false
MOCK_AI=true
EOF

# 安装依赖并启动
curl -fsSL https://get.docker.com | sh
docker-compose build
docker-compose up -d

# 查看日志
docker-compose logs -f hotscan-web
```

---

## 📱 方案 D: 简化部署（无 Docker）

如果服务器不支持 Docker，可以直接运行 Node.js：

### 步骤 1: 安装 Node.js 和 pnpm

```bash
# 在面板终端执行
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

npm install -g pnpm pm2
```

### 步骤 2: 部署应用

```bash
cd /opt/hotscan

# 安装依赖
pnpm install

# 生成 Prisma Client
pnpm prisma generate

# 应用数据库迁移
pnpm prisma migrate deploy

# 构建应用
pnpm build

# 使用 PM2 启动
pm2 start "pnpm start" --name hotscan-web
pm2 start "pnpm tsx src/jobs/make-signals.ts" --name hotscan-job --cron "*/30 * * * *"

# 保存 PM2 配置
pm2 save
pm2 startup
```

### 步骤 3: 配置 Nginx

```bash
# 复制 Nginx 配置
cp nginx.conf /etc/nginx/sites-available/hotscan
ln -s /etc/nginx/sites-available/hotscan /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启 Nginx
systemctl reload nginx
```

### 步骤 4: 申请 SSL 证书

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d hexedge.site -d www.hexedge.site --email fangp458@gmail.com --agree-tos --non-interactive
```

---

## 🎯 快速启动指南（推荐执行顺序）

### 第 1 步: 准备部署包（本地）

```bash
cd "/Users/fang/Desktop/💻 开发项目/HotScan｜热点雷达"
./deploy-to-server.sh
```

### 第 2 步: 登录面板

1. 浏览器打开: http://154.201.78.29:12700/951dfe8f
2. 如果 404，尝试: http://154.201.78.29:12700
3. 使用用户名/密码登录: `3tngqzci` / `f65f65e6`

### 第 3 步: 使用面板功能

**如果面板有终端**:
- 直接在终端执行上述部署命令

**如果面板有文件管理**:
- 上传部署包
- 在终端解压并执行

**如果都没有**:
- 配置 SSH 密钥后使用 SSH 部署

---

## 📞 需要您手动完成的步骤

由于面板无法直接访问，请您：

### 选项 1: 配置 SSH 密钥

1. **生成密钥**:
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_hotscan
   cat ~/.ssh/id_rsa_hotscan.pub
   ```

2. **通过面板添加公钥**:
   - 登录面板
   - 找到 SSH 密钥管理
   - 添加上述公钥

3. **测试连接**:
   ```bash
   ssh -i ~/.ssh/id_rsa_hotscan root@154.201.78.29
   ```

4. **执行自动部署**:
   ```bash
   # 编辑 auto-deploy-cloud.sh，设置密钥路径
   # SERVER_SSH_KEY="~/.ssh/id_rsa_hotscan"
   
   ./auto-deploy-cloud.sh
   ```

### 选项 2: 手动部署

1. **访问面板终端**
2. **执行以下命令**:

```bash
# 创建部署目录
mkdir -p /opt/hotscan
cd /opt/hotscan

# 下载项目（如果面板有 git）
git clone https://github.com/Hacker0458/HotScan.git .

# 或者手动上传文件

# 创建环境变量
cat > .env.production <<'EOF'
DATABASE_URL=postgresql://neondb_owner:npg_F7iA5rNzByYP@ep-frosty-frog-a1cazil9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
OPENAI_API_KEY=sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU
OPENAI_API_BASE=https://aium.cc/v1/
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://hexedge.site
EOF

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 🆘 如果一切都不行

### 最简单的方案：继续使用 Vercel

您的 Vercel 部署已经可用：
- ✅ https://hotscan-qh53iz1bt-fangp458-2547s-projects.vercel.app

**优势**:
- 无需管理服务器
- 自动 HTTPS
- 全球 CDN
- 零配置部署

**只需**:
1. 配置自定义域名（在 Vercel Dashboard）
2. 将 hexedge.site 的 CNAME 指向 Vercel

---

## 📝 我已为您准备好的文件

### 立即可用
- ✅ `Dockerfile` - Docker 镜像配置
- ✅ `docker-compose.yml` - 服务编排
- ✅ `nginx.conf` - Nginx 配置
- ✅ `.env.production` - 环境变量
- ✅ `auto-deploy-cloud.sh` - 自动部署脚本
- ✅ 完整文档

### 使用方法

**如果您能配置 SSH 密钥**:
```bash
./auto-deploy-cloud.sh
```

**如果您有面板访问权限**:
1. 登录面板
2. 使用终端执行方案 D 的命令
3. 或上传文件后手动部署

**如果继续使用 Vercel**:
1. Vercel Dashboard 添加域名
2. 配置 DNS CNAME

---

## 🎯 下一步建议

请选择以下之一：

### 选项 1: 配置 SSH 后自动部署 ⭐

1. 生成 SSH 密钥
2. 通过面板添加公钥
3. 执行 `./auto-deploy-cloud.sh`

### 选项 2: 使用面板手动部署

1. 登录面板终端
2. 按照方案 C 或 D 执行
3. 验证部署

### 选项 3: 继续使用 Vercel + 自定义域名

1. Vercel Dashboard 配置域名
2. DNS 设置 CNAME
3. 最快速最稳定

---

## 📞 需要帮助？

如果您能提供：
1. SSH 密码（而不是密钥）
2. 或面板的实际访问URL
3. 或选择继续使用 Vercel

我可以调整部署方案。

---

**生成时间**: 2025-10-04 17:05 CST

