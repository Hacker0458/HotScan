# 🚀 立即部署 HotScan

## 最简单的部署方法（只需2步）

### 步骤1: SSH连接到服务器

在您的终端执行：

```bash
ssh root@154.201.78.29
```

输入密码: `JFroson 081130`

---

### 步骤2: 执行一键部署命令

连接成功后，复制并执行以下**单行命令**：

```bash
curl -fsSL https://raw.githubusercontent.com/Hacker0458/HotScan/main/auto-deploy-server.sh | bash
```

---

## 🎉 完成！

脚本会自动完成以下所有工作：

✅ 安装Node.js、pnpm、PostgreSQL、PM2、Nginx  
✅ 从GitHub克隆最新代码  
✅ 安装所有依赖  
✅ 构建生产版本  
✅ 配置数据库  
✅ 生成安全密钥  
✅ 配置Nginx反向代理  
✅ 设置定时任务  
✅ 启动应用  
✅ 运行健康检查  

整个过程**完全自动化**，无需任何手动操作！

---

## 📊 预计时间

- 首次部署: 约5-10分钟
- 更新部署: 约2-3分钟

---

## 🌐 部署后访问

- **HTTPS**: https://hotscan.jfroson.com （您的SSL证书已配置）
- **HTTP**: http://hotscan.jfroson.com

---

## 🔍 查看部署状态

部署完成后，在服务器上执行：

```bash
pm2 status          # 查看应用状态
pm2 logs hotscan    # 查看应用日志
```

---

## ⚡ 快速命令参考

```bash
pm2 restart hotscan   # 重启应用
pm2 stop hotscan      # 停止应用
pm2 logs hotscan      # 查看日志
pm2 monit             # 实时监控
```

---

## 🔄 更新部署

需要更新时，在服务器上执行：

```bash
cd /www/wwwroot/hotscan.jfroson.com
git pull
pnpm install
pnpm build
pm2 restart hotscan
```

---

## 🆘 遇到问题？

### 1. 脚本执行失败

```bash
# 下载脚本到本地后执行
cd /tmp
curl -fsSL https://raw.githubusercontent.com/Hacker0458/HotScan/main/auto-deploy-server.sh -o deploy.sh
chmod +x deploy.sh
bash deploy.sh
```

### 2. 查看详细日志

```bash
pm2 logs hotscan --lines 50
```

### 3. 检查Nginx

```bash
nginx -t
systemctl status nginx
```

### 4. 检查数据库

```bash
sudo -u postgres psql -c "\l"  # 列出所有数据库
```

---

## 📞 技术支持

- **项目文档**: /www/wwwroot/hotscan.jfroson.com/README.md
- **GitHub**: https://github.com/Hacker0458/HotScan
- **API文档**: /www/wwwroot/hotscan.jfroson.com/API_DOCUMENTATION.md

---

**就这么简单！开始部署吧！** 🎉

