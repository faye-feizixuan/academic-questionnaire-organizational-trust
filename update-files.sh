#!/bin/bash

# 更新文件部署脚本
# 只上传修改过的文件

# 配置信息
SERVER_IP="47.114.85.2"
SERVER_USER="root"
REMOTE_PATH="/root/questionnaire-frontend"
SSH_KEY="/Users/wanghao/Desktop/2投稿/trust/云服务器秘钥/问卷专用.pem"

echo "================================="
echo "开始更新文件到服务器"
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

# 上传修改过的文件
echo ""
echo "上传文件到服务器..."
FILES_TO_UPLOAD=(
    "config.js"
    "api.js"
    "pre-test.html"
    "interview.html"
    "index.html"
    "instruction.html"
    "intervention.html"
    "attention-test.html"
    "main-questionnaire.html"
    "demographics.html"
    "debriefing.html"
    "export.html"
)

for file in "${FILES_TO_UPLOAD[@]}"; do
    if [ -f "$file" ]; then
        echo "上传 $file..."
        scp -i "$SSH_KEY" -o StrictHostKeyChecking=no "$file" $SERVER_USER@$SERVER_IP:$REMOTE_PATH/
        if [ $? -ne 0 ]; then
            echo "错误: $file 上传失败"
        else
            echo "✓ $file 上传成功"
        fi
    fi
done

echo ""
echo "================================="
echo "文件上传完成！"
echo "================================="
echo ""
echo "请在浏览器中访问 http://$SERVER_IP:8000 测试"
echo ""
