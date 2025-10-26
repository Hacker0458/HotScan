#!/bin/bash
# 本地执行脚本 - 在服务器上运行部署

SERVER="154.201.78.29"
USER="root"

echo "🚀 正在连接到服务器并执行部署..."
echo "服务器: $SERVER"
echo ""

# 创建临时脚本
cat > /tmp/remote-deploy-cmd.sh << 'REMOTESCRIPT'
#!/bin/bash
cd /tmp
curl -fsSL https://raw.githubusercontent.com/Hacker0458/HotScan/main/auto-deploy-server.sh -o deploy.sh
chmod +x deploy.sh
bash deploy.sh
REMOTESCRIPT

chmod +x /tmp/remote-deploy-cmd.sh

echo "请在提示时输入服务器密码: JFroson 081130"
echo ""

# 上传并执行脚本
scp /tmp/remote-deploy-cmd.sh $USER@$SERVER:/tmp/
ssh $USER@$SERVER "bash /tmp/remote-deploy-cmd.sh"

# 清理
rm /tmp/remote-deploy-cmd.sh

echo ""
echo "✅ 部署命令已发送到服务器！"

