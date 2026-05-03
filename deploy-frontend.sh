#!/bin/bash

# 前端部署脚本
# 部署前端到阿里云服务器

# 配置信息
SERVER_IP="47.114.85.2"
SERVER_USER="root"
REMOTE_PATH="/root/questionnaire-frontend"
FRONTEND_PORT="8000"
SSH_KEY="/Users/wanghao/Desktop/2投稿/trust/云服务器秘钥/问卷专用.pem"

echo "================================="
echo "开始部署前端"
echo "================================="
echo ""

# 检查SSH密钥文件
if [ ! -f "$SSH_KEY" ]; then
    echo "错误: 找不到SSH密钥文件: $SSH_KEY"
    exit 1
fi

# 设置密钥文件权限
chmod 400 "$SSH_KEY"

# 检查是否在正确的目录
if [ ! -f "index.html" ]; then
    echo "错误: 请在前端项目根目录运行此脚本"
    exit 1
fi

# 构建前端项目（如果需要）
echo "检查前端文件..."
if [ -d "frontend" ]; then
    echo "发现frontend目录"
    cd frontend
fi

# 在服务器上创建目录
echo ""
echo "1. 在服务器上创建目录..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_PATH"
if [ $? -ne 0 ]; then
    echo "错误: 无法连接到服务器或创建目录失败"
    exit 1
fi
echo "✓ 目录创建成功"

# 上传前端文件
echo ""
echo "2. 上传前端文件到服务器..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no index.html api.js config.js attention-test.html debriefing.html demographics.html export.html instruction.html intervention.html interview.html main-questionnaire.html pre-test.html test-api.html test-email.html $SERVER_USER@$SERVER_IP:$REMOTE_PATH/
if [ $? -ne 0 ]; then
    echo "错误: 文件上传失败"
    exit 1
fi
echo "✓ 前端文件上传成功"

# 在服务器上创建一个简单的HTTP服务器
echo ""
echo "3. 在服务器上配置前端服务..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'ENDSSH'
cd /root/questionnaire-frontend

# 创建一个简单的Node.js HTTP服务器
cat > server.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        fs.readFile('./index.html', (error, content) => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}/`);
});
EOF

# 创建systemd服务文件
cat > /etc/systemd/system/questionnaire-frontend.service << 'EOF'
[Unit]
Description=Questionnaire Frontend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/questionnaire-frontend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd并启动服务
systemctl daemon-reload
systemctl enable questionnaire-frontend
systemctl restart questionnaire-frontend

echo "前端服务已启动"
ENDSSH

if [ $? -ne 0 ]; then
    echo "错误: 前端服务配置失败"
    exit 1
fi
echo "✓ 前端服务配置成功"

# 等待服务启动
echo ""
echo "4. 等待前端服务启动..."
sleep 5

# 检查服务状态
echo ""
echo "5. 检查前端服务状态..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "systemctl status questionnaire-frontend --no-pager"

echo ""
echo "================================="
echo "前端部署完成！"
echo "================================="
echo ""
echo "前端访问地址: http://$SERVER_IP:$FRONTEND_PORT"
echo ""
echo "服务状态检查:"
echo "  ssh $SERVER_USER@$SERVER_IP systemctl status questionnaire-frontend"
echo ""
echo "查看日志:"
echo "  ssh $SERVER_USER@$SERVER_IP journalctl -u questionnaire-frontend -f"
echo ""
echo "重启服务:"
echo "  ssh $SERVER_USER@$SERVER_IP systemctl restart questionnaire-frontend"
echo ""
echo "停止服务:"
echo "  ssh $SERVER_USER@$SERVER_IP systemctl stop questionnaire-frontend"
echo ""
echo "请确保阿里云服务器的安全组已开放$FRONTEND_PORT端口"
echo ""
echo "================================="
