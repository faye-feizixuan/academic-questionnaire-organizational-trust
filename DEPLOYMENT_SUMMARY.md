# 部署完成总结

## 已创建的文件

### 后端服务
- `backend/server.js` - Express后端服务器，提供问卷数据API
- `backend/package.json` - 后端依赖配置

### 前端配置
- `api.js` - API服务封装，包含与后端通信的所有函数
- `config.js` - 配置文件，包含API地址和数据导出密码

### 部署工具
- `deploy-to-aliyun.sh` - 自动化部署脚本，将后端服务部署到阿里云
- `test-api.sh` - API测试脚本，验证后端服务是否正常工作

### 文档
- `README.md` - 完整的系统文档，包含部署、API、故障排查等
- `QUICK_START.md` - 快速开始指南，帮助您快速部署和使用系统

## 系统架构

```
┌─────────────────┐
│   前端浏览器     │
│  (localhost:8000)│
└────────┬────────┘
         │ HTTP请求
         ▼
┌─────────────────┐
│  阿里云服务器    │
│  (47.114.85.2)  │
│                 │
│  ┌───────────┐  │
│  │ Node.js   │  │
│  │ Express   │  │
│  │ Server    │  │
│  │ (3001)    │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │  SQLite   │  │
│  │ Database  │  │
│  └───────────┘  │
└─────────────────┘
```

## 部署步骤

### 1. 部署后端到阿里云

```bash
cd "/Users/wanghao/Desktop/Trae/orgnization trust/data/academic_questionnaire"
./deploy-to-aliyun.sh
```

### 2. 测试API

```bash
./test-api.sh
```

### 3. 启动前端

```bash
bash start.sh
```

### 4. 访问系统

打开浏览器访问：`http://localhost:8000`

## API端点

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| POST | `/api/questionnaire/save` | 保存/更新问卷数据 |
| GET | `/api/questionnaire/:id` | 获取指定问卷数据 |
| GET | `/api/admin/questionnaires` | 获取所有问卷（管理员） |
| GET | `/api/admin/export` | 导出所有数据 |
| GET | `/api/admin/stats` | 获取统计信息 |
| DELETE | `/api/admin/questionnaire/:id` | 删除问卷数据 |

## 数据流程

1. 用户填写问卷
2. 前端自动保存到本地存储
3. 前端通过`api.js`发送数据到云服务器
4. 云服务器保存到SQLite数据库
5. 管理员通过数据导出功能查看和下载数据

## 安全配置

- 数据导出密码：`2025311741`（可在config.js中修改）
- API限流：每IP每分钟最多100次请求
- CORS：已配置允许跨域请求
- 建议生产环境添加HTTPS和API密钥认证

## 数据备份

### 自动备份（建议）

在服务器上创建定时任务：

```bash
# SSH登录服务器
ssh root@47.114.85.2

# 创建备份脚本
cat > /root/backup-questionnaire.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups/questionnaire"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp /root/questionnaire-backend/data/questionnaire.db $BACKUP_DIR/questionnaire.db.$DATE
# 保留最近7天的备份
find $BACKUP_DIR -name "questionnaire.db.*" -mtime +7 -delete
EOF

chmod +x /root/backup-questionnaire.sh

# 添加到crontab（每天凌晨2点备份）
crontab -e
# 添加以下行：
0 2 * * * /root/backup-questionnaire.sh
```

### 手动备份

```bash
# 在服务器上
ssh root@47.114.85.2
cd /root/questionnaire-backend/data
cp questionnaire.db questionnaire.db.backup.$(date +%Y%m%d)

# 下载到本地
exit
scp root@47.114.85.2:/root/questionnaire-backend/data/questionnaire.db ./
```

## 监控和维护

### 查看服务状态

```bash
ssh root@47.114.85.2
systemctl status questionnaire-backend
```

### 查看日志

```bash
# 实时查看日志
journalctl -u questionnaire-backend -f

# 查看最近100行
journalctl -u questionnaire-backend -n 100
```

### 重启服务

```bash
systemctl restart questionnaire-backend
```

## 故障排查

### 服务无法启动

```bash
# 查看详细错误
journalctl -u questionnaire-backend -n 50 --no-pager

# 检查端口占用
netstat -tlnp | grep 3001
```

### 数据无法保存

1. 检查服务器是否运行
2. 检查网络连接
3. 查看浏览器控制台错误
4. 检查服务器日志

### 性能问题

```bash
# 查看数据库大小
ls -lh /root/questionnaire-backend/data/

# 清理旧数据（谨慎操作）
sqlite3 /root/questionnaire-backend/data/questionnaire.db
DELETE FROM questionnaires WHERE completed = 1 AND datetime(startTime) < datetime('now', '-30 days');
.quit
```

## 下一步建议

1. **立即执行**：
   - 运行`./deploy-to-aliyun.sh`部署后端
   - 运行`./test-api.sh`测试API
   - 启动前端服务开始收集数据

2. **短期优化**：
   - 设置自动备份
   - 配置HTTPS（生产环境）
   - 添加API密钥认证

3. **长期规划**：
   - 考虑迁移到MySQL/PostgreSQL
   - 添加数据分析和可视化功能
   - 实现用户认证系统

## 联系信息

如有问题，请查看：
- 详细文档：`README.md`
- 快速指南：`QUICK_START.md`
- 服务器日志：`journalctl -u questionnaire-backend -f`

---

**部署日期**: 2025-01-01
**版本**: v1.0.0
**状态**: 准备就绪，等待部署
