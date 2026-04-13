#!/bin/bash

echo "================================="
echo "启动问卷数据收集系统"
echo "================================="
echo ""

# 检查后端依赖是否已安装
if [ ! -d "backend/node_modules" ]; then
    echo "正在安装后端依赖..."
    cd backend
    npm install
    cd ..
    echo "后端依赖安装完成！"
    echo ""
fi

# 启动后端服务器
echo "正在启动后端服务器..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# 等待后端服务器启动
sleep 3

# 检查后端服务器是否启动成功
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✓ 后端服务器启动成功 (http://localhost:3001)"
else
    echo "✗ 后端服务器启动失败"
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
echo "后端地址: http://localhost:3001"
echo "管理界面: http://localhost:8000/admin.html"
echo ""
echo "按 Ctrl+C 停止所有服务器"
echo ""

# 等待用户中断
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo '正在关闭服务器...'; exit 0" INT TERM

wait