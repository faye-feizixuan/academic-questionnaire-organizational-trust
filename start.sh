#!/bin/bash

echo "================================="
echo "启动问卷系统和邮件服务"
echo "================================="
echo ""

# 检查邮件服务依赖是否已安装
if [ ! -d "email-service/node_modules" ]; then
    echo "正在安装邮件服务依赖..."
    cd email-service
    npm install
    cd ..
    echo "邮件服务依赖安装完成！"
    echo ""
fi

# 启动邮件服务
echo "正在启动邮件服务..."
cd email-service
npm start &
EMAIL_SERVICE_PID=$!
cd ..

# 等待邮件服务启动
sleep 3

# 检查邮件服务是否启动成功
if curl -s http://localhost:3002/api/health > /dev/null; then
    echo "✓ 邮件服务启动成功 (http://localhost:3002)"
else
    echo "✗ 邮件服务启动失败"
    exit 1
fi

echo ""

# 启动前端服务器
echo "正在启动前端服务器..."
python3 -m http.server 8000 &
FRONTEND_PID=$!

# 等待前端服务器启动
sleep 2

echo ""
echo "================================="
echo "系统启动完成！"
echo "================================="
echo ""
echo "前端地址: http://localhost:8000"
echo "邮件服务: http://localhost:3002"
echo ""
echo "按 Ctrl+C 停止所有服务器"
echo ""
echo "重要提示: 请在 email-service/server.js 中设置正确的QQ邮箱授权码"
echo ""

# 等待用户中断
trap "kill $EMAIL_SERVICE_PID $FRONTEND_PID 2>/dev/null; echo ''; echo '正在关闭服务器...'; exit 0" INT TERM

wait