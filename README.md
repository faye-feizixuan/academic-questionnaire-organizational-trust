# 问卷调查系统 - 云服务器部署指南

## 系统概述

这是一个学术研究问卷调查系统，支持将问卷数据保存到阿里云服务器，便于数据管理和导出。

## 系统架构

- **前端**: HTML + JavaScript + Tailwind CSS
- **后端**: Node.js + Express + SQLite
- **数据库**: SQLite (轻量级，无需额外配置)
- **邮件服务**: Nodemailer (可选)

## 部署步骤

### 1. 准备工作

确保您有以下信息：
- 阿里云服务器IP: `47.114.85.2`
- 服务器用户名（默认为root）
- 服务器密码或SSH密钥
- 服务器已开放3001端口（用于API服务）

### 2. 部署后端服务到阿里云

#### 方法一：使用自动化部署脚本（推荐）

```bash
# 给脚本添加执行权限
chmod +x deploy-to-aliyun.sh

# 运行部署脚本
./deploy-to-aliyun.sh
```

脚本会自动完成以下操作：
- 创建远程目录
- 上传后端文件
- 安装Node.js和依赖
- 配置systemd服务
- 启动服务

#### 方法二：手动部署

```bash
# 1. SSH登录到服务器
ssh root@47.114.85.2

# 2. 创建目录
mkdir -p /root/questionnaire-backend/data
cd /root/questionnaire-backend

# 3. 上传后端文件（在本地执行）
scp -r backend/* root@47.114.85.2:/root/questionnaire-backend/

# 4. 在服务器上安装依赖（回到SSH会话）
npm install

# 5. 启动服务
node server.js
```

### 3. 配置防火墙

确保阿里云安全组开放以下端口：
- **3001**: 后端API服务
- **8000**: 前端服务（如果需要）

### 4. 验证部署

在浏览器中访问：
- 健康检查: `http://47.114.85.2:3001/api/health`
- 应该返回: `{"status":"ok","message":"问卷后端服务运行正常"}`

### 5. 更新前端配置

前端会自动使用云服务器地址（已在`api.js`中配置）。

## API接口文档

### 1. 保存问卷数据
```
POST /api/questionnaire/save
Content-Type: application/json

{
  "participantId": "P1234567890",
  "group": 1,
  "preTest": {},
  "attentionTest": {},
  "mainQuestionnaire": {},
  "demographics": {},
  "contactInfo": "",
  "startTime": "2025-01-01T00:00:00.000Z",
  "completed": false
}
```

### 2. 获取问卷数据
```
GET /api/questionnaire/:participantId
```

### 3. 获取所有问卷数据（管理员）
```
GET /api/admin/questionnaires?completed=true&group=1&limit=100&offset=0
```

### 4. 导出数据
```
GET /api/admin/export?format=json
```

### 5. 获取统计信息
```
GET /api/admin/stats
```

### 6. 删除问卷数据
```
DELETE /api/admin/questionnaire/:participantId
```

## 数据管理

### 查看服务状态
```bash
ssh root@47.114.85.2
systemctl status questionnaire-backend
```

### 查看日志
```bash
journalctl -u questionnaire-backend -f
```

### 重启服务
```bash
systemctl restart questionnaire-backend
```

### 备份数据库
```bash
# 在服务器上执行
cd /root/questionnaire-backend/data
cp questionnaire.db questionnaire.db.backup.$(date +%Y%m%d)
```

### 下载数据库
```bash
# 在本地执行
scp root@47.114.85.2:/root/questionnaire-backend/data/questionnaire.db ./
```

## 本地开发

### 启动后端服务
```bash
cd backend
npm install
npm start
```

### 启动前端服务
```bash
python3 -m http.server 8000
```

### 修改API地址
如需使用本地API，编辑`api.js`：
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

## 数据导出

### 方法一：通过Web界面
1. 访问问卷首页
2. 点击"数据导出"
3. 输入密码: `2025311741`
4. 选择要导出的数据

### 方法二：通过API
```bash
curl -X GET "http://47.114.85.2:3001/api/admin/export?format=json" \
  -H "Content-Type: application/json" \
  -o questionnaire_data.json
```

### 方法三：直接下载数据库
```bash
scp root@47.114.85.2:/root/questionnaire-backend/data/questionnaire.db ./
```

然后使用SQLite工具查看：
```bash
sqlite3 questionnaire.db
SELECT * FROM questionnaires;
```

## 安全建议

1. **修改默认密码**: 定期更改数据导出密码
2. **HTTPS配置**: 生产环境建议配置HTTPS
3. **访问控制**: 考虑添加API密钥认证
4. **定期备份**: 设置自动备份脚本
5. **监控日志**: 定期检查访问日志

## 故障排查

### 服务无法启动
```bash
# 查看详细日志
journalctl -u questionnaire-backend -n 50

# 检查端口占用
netstat -tlnp | grep 3001
```

### 数据无法保存
1. 检查服务器是否正常运行
2. 检查网络连接
3. 查看浏览器控制台错误信息
4. 检查服务器日志

### 性能优化
1. 定期清理旧数据
2. 添加数据库索引
3. 考虑使用更强大的数据库（如MySQL、PostgreSQL）

## 技术支持

如有问题，请检查：
1. 服务器日志: `journalctl -u questionnaire-backend -f`
2. 浏览器控制台: F12打开开发者工具
3. 网络连接: `ping 47.114.85.2`

## 更新日志

- **v1.0.0** (2025-01-01)
  - 初始版本
  - 支持问卷数据保存到云服务器
  - 支持数据导出功能
  - 支持多分组实验设计
