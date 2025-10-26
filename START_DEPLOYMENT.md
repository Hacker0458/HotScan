# 🚀 HotScan 开始部署

## 最简单的部署方式（推荐）

### 方式一：直接从GitHub部署（最简单）

在您的服务器上执行：

```bash
# 1. SSH连接到服务器
ssh root@154.201.78.29
# 密码: JFroson 081130

# 2. 进入部署目录
cd /www/wwwroot/hotscan.jfroson.com

# 3. 克隆代码（如果目录不存在或为空）
git clone https://github.com/Hacker0458/HotScan.git .

# 4. 安装依赖
pnpm install

# 5. 构建项目
pnpm build

# 6. 配置环境变量
cp .env.example .env
nano .env  # 编辑数据库等配置

# 7. 运行数据库迁移
pnpm prisma db push

# 8. 启动应用
pm2 start npm --name "hotscan" -- start
pm2 save

# 完成！
echo "✅ 部署完成！访问 http://hotscan.jfroson.com"
```

---

### 方式二：使用本地部署包

**本地部署包位置**: `/Users/fang/Desktop/💻 开发项目/HotScan｜热点雷达/hotscan-deploy.tar.gz`

#### 步骤1: 上传到服务器

在本地终端执行：

```bash
cd "/Users/fang/Desktop/💻 开发项目/HotScan｜热点雷达"
scp hotscan-deploy.tar.gz root@154.201.78.29:/tmp/
```

#### 步骤2: 在服务器上部署

SSH到服务器后执行：

```bash
cd /tmp
tar -xzf hotscan-deploy.tar.gz
cd hotscan-deploy-*

# 移动到部署目录
mkdir -p /www/wwwroot/hotscan.jfroson.com
mv * /www/wwwroot/hotscan.jfroson.com/

# 进入目录
cd /www/wwwroot/hotscan.jfroson.com

# 安装依赖
pnpm install --prod

# 配置环境变量（从模板创建）
cat > .env << 'EOF'
DATABASE_URL="postgresql://hotscan:YOUR_PASSWORD@localhost:5432/hotscan"
PROBEX_API_KEY="sk-JaLWJy75i0t0gzrY41V7uMAjI2TcEga4Ojg6mF96nhFzQLyo"
AIUM_API_KEY="sk-JygunTZbcQC45eIfrQYTSu6uWKPFJj39fYlM1AwmrtF8nYBU"
CHATAIAPI_KEY="sk-dXYiVkp3MihKRdWcQoBOsA5ZP3GYZPEoVjUJG0hAzPaSXK06"
NEXTAUTH_URL="https://hotscan.jfroson.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
JOB_TOKEN="$(openssl rand -base64 32)"
NODE_ENV=production
EOF

# 运行迁移
pnpm prisma db push

# 启动
pm2 start npm --name "hotscan" -- start
pm2 save
```

---

### 方式三：Docker部署（最快）

```bash
ssh root@154.201.78.29

cd /www/wwwroot/hotscan.jfroson.com
git clone https://github.com/Hacker0458/HotScan.git .

# 配置环境变量
cp .env.example .env
nano .env

# 使用Docker Compose
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 🔧 必须配置的环境变量

编辑 `.env` 文件，至少修改：

```env
# 数据库连接（必须修改）
DATABASE_URL="postgresql://hotscan:YOUR_STRONG_PASSWORD@localhost:5432/hotscan"

# NextAuth密钥（自动生成或手动设置）
NEXTAUTH_URL="https://hotscan.jfroson.com"
NEXTAUTH_SECRET="<生成的随机密钥>"

# Job令牌（自动生成或手动设置）
JOB_TOKEN="<生成的随机密钥>"
```

生成随机密钥：
```bash
openssl rand -base64 32
```

---

## 📋 部署后检查清单

```bash
# 1. 检查应用状态
pm2 status

# 2. 查看日志
pm2 logs hotscan

# 3. 测试API
curl http://localhost:3000/api/health

# 4. 查看数据库
psql -U hotscan -d hotscan -c "\dt"

# 5. 测试外部访问
# 浏览器访问: http://hotscan.jfroson.com
```

---

## 🌐 配置Nginx（如果还没有）

```bash
# 创建Nginx配置
cat > /etc/nginx/sites-available/hotscan << 'EOF'
server {
    listen 80;
    server_name hotscan.jfroson.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启用站点
ln -s /etc/nginx/sites-available/hotscan /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

---

## 🔒 配置SSL证书

```bash
# 安装Certbot
apt install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d hotscan.jfroson.com

# 完成！现在可以访问 https://hotscan.jfroson.com
```

---

## 📅 设置定时任务

```bash
crontab -e

# 添加以下行
*/5 * * * * cd /www/wwwroot/hotscan.jfroson.com && pnpm tsx jobs/make-signals.ts
```

---

## 🎉 部署完成！

访问您的网站：
- HTTP: http://hotscan.jfroson.com
- HTTPS: https://hotscan.jfroson.com （配置SSL后）

---

## 📚 详细文档

如需更详细的部署说明，请查看：
- `MANUAL_DEPLOY_GUIDE.md` - 完整手动部署指南
- `DEPLOY_TO_SERVER.md` - 详细服务器配置说明

---

## 🆘 遇到问题？

### 常见问题：

1. **端口3000被占用**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **PM2无法启动**
   ```bash
   pm2 delete all
   pm2 start npm --name "hotscan" -- start
   ```

3. **数据库连接失败**
   ```bash
   # 检查PostgreSQL状态
   systemctl status postgresql
   
   # 测试连接
   psql -U hotscan -d hotscan -h localhost
   ```

4. **查看详细日志**
   ```bash
   pm2 logs hotscan --lines 100
   ```

---

**祝部署顺利！🚀**

如有任何问题，请查看项目文档或GitHub Issues。

