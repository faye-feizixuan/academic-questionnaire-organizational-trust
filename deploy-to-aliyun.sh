#!/bin/bash

# 阿里云服务器部署脚本
# 服务器信息
SERVER_IP="47.114.85.2"
SERVER_USER="root"
SERVER_PATH="/root/questionnaire-backend"
SSH_KEY="/Users/wanghao/Desktop/2投稿/trust/云服务器秘钥/问卷专用.pem"

echo "================================="
echo "问卷后端服务部署到阿里云"
echo "================================="
echo ""

# 检查SSH秘钥文件是否存在
if [ ! -f "$SSH_KEY" ]; then
    echo "错误: SSH秘钥文件不存在: $SSH_KEY"
    exit 1
fi

# 设置秘钥文件权限
chmod 400 "$SSH_KEY"

# 创建远程目录
echo "1. 创建远程目录..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "mkdir -p ${SERVER_PATH} ${SERVER_PATH}/data"

# 上传后端文件
echo "2. 上传后端文件..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r backend/* ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/

echo "3. 上传完成！"
echo ""

# 在服务器上安装依赖并启动服务
echo "4. 在服务器上安装依赖..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /root/questionnaire-backend

# 检查操作系统类型
if [ -f /etc/redhat-release ]; then
    OS_TYPE="centos"
    echo "检测到操作系统: CentOS/Alibaba Cloud Linux"
elif [ -f /etc/debian_version ]; then
    OS_TYPE="ubuntu"
    echo "检测到操作系统: Ubuntu/Debian"
else
    echo "警告: 无法确定操作系统类型，尝试通用安装方式"
    OS_TYPE="unknown"
fi

# 检查是否安装了Node.js
if ! command -v node &> /dev/null; then
    echo "正在安装Node.js..."
    if [ "$OS_TYPE" = "centos" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        yum install -y nodejs
    elif [ "$OS_TYPE" = "ubuntu" ]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    else
        echo "请手动安装Node.js"
        exit 1
    fi
fi

# 安装依赖
echo "正在安装npm依赖..."
npm install

# 创建systemd服务文件
cat > /etc/systemd/system/questionnaire-backend.service << 'EOF'
[Unit]
Description=Questionnaire Backend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/questionnaire-backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd
systemctl daemon-reload

# 启动服务
echo "正在启动问卷后端服务..."
systemctl enable questionnaire-backend
systemctl start questionnaire-backend

# 检查服务状态
systemctl status questionnaire-backend --no-pager

echo ""
echo "================================="
echo "部署完成！"
echo "================================="
echo ""
echo "服务状态检查:"
echo "  systemctl status questionnaire-backend"
echo ""
echo "查看日志:"
echo "  journalctl -u questionnaire-backend -f"
echo ""
echo "重启服务:"
echo "  systemctl restart questionnaire-backend"
echo ""
echo "停止服务:"
echo "  systemctl stop questionnaire-backend"
echo ""
ENDSSH

echo "================================="
echo "本地配置更新"
echo "================================="
echo ""

# 询问是否更新本地API配置
read -p "是否更新本地API配置为云服务器地址？(y/n): " update_config

if [ "$update_config" = "y" ] || [ "$update_config" = "Y" ]; then
    # 更新api.js中的API_BASE_URL
    sed -i.bak "s|const API_BASE_URL = '.*'|const API_BASE_URL = 'http://${SERVER_IP}:3001/api';|" api.js
    echo "✓ API配置已更新为: http://${SERVER_IP}:3001/api"
fi

echo ""
echo "================================="
echo "部署完成！"
echo "================================="
echo ""
echo "后端API地址: http://${SERVER_IP}:3001/api"
echo "健康检查: http://${SERVER_IP}:3001/api/health"
echo ""
echo "请确保阿里云服务器的安全组已开放3001端口"
echo ""