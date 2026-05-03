# 🎉 问卷系统云服务器部署完成

## 📋 项目概述

您的问卷调查系统已经成功配置为将数据保存到阿里云服务器（IP: 47.114.85.2）。

## ✅ 已完成的工作

### 1. 后端服务开发
- ✅ 创建了完整的Express后端服务器（`backend/server.js`）
- ✅ 实现了SQLite数据库存储
- ✅ 提供了完整的RESTful API接口
- ✅ 配置了CORS和请求限流
- ✅ 实现了数据导出和统计功能

### 2. 前端配置
- ✅ 创建了API服务封装（`api.js`）
- ✅ 创建了配置文件（`config.js`）
- ✅ 修改了问卷页面以支持数据同步到云服务器
- ✅ 实现了自动保存和错误处理

### 3. 部署工具
- ✅ 创建了自动化部署脚本（`deploy-to-aliyun.sh`）
- ✅ 创建了命令行API测试脚本（`test-api.sh`）
- ✅ 创建了Web版API测试工具（`test-api.html`）

### 4. 文档
- ✅ 完整的系统文档（`README.md`）
- ✅ 快速开始指南（`QUICK_START.md`）
- ✅ 部署总结（`DEPLOYMENT_SUMMARY.md`）
- ✅ 部署检查清单（`DEPLOYMENT_CHECKLIST.md`）

## 🚀 下一步操作

### 第一步：部署后端到阿里云

```bash
# 进入项目目录
cd "/Users/wanghao/Desktop/Trae/orgnization trust/data/academic_questionnaire"

# 运行部署脚本
./deploy-to-aliyun.sh
```

**注意**：
- 首次运行需要输入服务器密码
- 确保服务器已开放3001端口
- 脚本会自动安装Node.js和依赖

### 第二步：测试API连接

```bash
# 使用命令行测试
./test-api.sh
```

或者使用Web界面测试：

```bash
# 在浏览器中打开
open test-api.html
```

### 第三步：启动前端服务

```bash
# 使用现有脚本
bash start.sh
```

或者手动启动：

```bash
python3 -m http.server 8000
```

### 第四步：访问系统

在浏览器中访问：`http://localhost:8000`

## 📊 系统架构

```
┌─────────────────────────────────┐
│      用户浏览器 (前端)           │
│      http://localhost:8000      │
└────────────┬────────────────────┘
             │
             │ HTTP请求 (api.js)
             │
             ▼
┌─────────────────────────────────┐
│      阿里云服务器                │
│      47.114.85.2:3001           │
│                                 │
│  ┌──────────────────────────┐  │
│  │  Node.js + Express      │  │
│  │  Backend Server         │  │
│  └──────────┬───────────────┘  │
│             │                   │
│  ┌──────────▼───────────────┐  │
│  │  SQLite Database         │  │
│  │  questionnaire.db        │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

## 🔌 API接口

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| POST | `/api/questionnaire/save` | 保存/更新问卷数据 |
| GET | `/api/questionnaire/:id` | 获取指定问卷 |
| GET | `/api/admin/questionnaires` | 获取所有问卷（管理员） |
| GET | `/api/admin/export` | 导出所有数据 |
| GET | `/api/admin/stats` | 获取统计信息 |
| DELETE | `/api/admin/questionnaire/:id` | 删除问卷 |

## 💾 数据管理

### 查看数据
1. 访问问卷首页
2. 点击"数据导出"
3. 输入密码：`2025311741`
4. 查看所有问卷数据

### 导出数据
- 在数据导出页面点击"导出JSON"按钮
- 数据将下载为JSON格式文件

### 备份数据
```bash
# SSH登录服务器
ssh root@47.114.85.2

# 备份数据库
cd /root/questionnaire-backend/data
cp questionnaire.db questionnaire.db.backup.$(date +%Y%m%d)

# 下载到本地
exit
scp root@47.114.85.2:/root/questionnaire-backend/data/questionnaire.db ./
```

## 🔧 服务器管理

```bash
# SSH登录服务器
ssh root@47.114.85.2

# 查看服务状态
systemctl status questionnaire-backend

# 查看日志
journalctl -u questionnaire-backend -f

# 重启服务
systemctl restart questionnaire-backend

# 停止服务
systemctl stop questionnaire-backend
```

## 📝 配置说明

### API地址配置
文件：`api.js`
```javascript
const API_BASE_URL = 'http://47.114.85.2:3001/api';
```

### 数据导出密码
文件：`config.js`
```javascript
const DATA_EXPORT_PASSWORD = "2025311741";
```

## 🔒 安全建议

1. **修改默认密码**：定期更改数据导出密码
2. **配置HTTPS**：生产环境建议配置SSL证书
3. **添加认证**：考虑添加API密钥或用户认证
4. **定期备份**：设置自动备份脚本
5. **监控日志**：定期检查访问日志

## 📚 文档索引

- **README.md** - 完整的系统文档，包含详细的API说明、部署指南、故障排查等
- **QUICK_START.md** - 快速开始指南，帮助您快速部署和使用系统
- **DEPLOYMENT_SUMMARY.md** - 部署总结，包含系统架构和配置说明
- **DEPLOYMENT_CHECKLIST.md** - 部署检查清单，确保所有步骤都已完成

## 🐛 故障排查

### 问题1：无法连接到服务器
```bash
# 检查网络连接
ping 47.114.85.2

# 检查SSH连接
ssh root@47.114.85.2

# 检查服务状态
systemctl status questionnaire-backend
```

### 问题2：数据无法保存
1. 检查浏览器控制台错误（F12）
2. 检查网络请求（F12 → Network）
3. 查看服务器日志：`journalctl -u questionnaire-backend -n 50`
4. 确认API地址配置正确

### 问题3：服务无法启动
```bash
# 查看详细错误
journalctl -u questionnaire-backend -n 100 --no-pager

# 检查端口占用
netstat -tlnp | grep 3001

# 手动启动测试
cd /root/questionnaire-backend
node server.js
```

## 📈 性能优化建议

1. **数据库优化**
   - 添加索引
   - 定期清理旧数据
   - 考虑迁移到MySQL/PostgreSQL

2. **缓存策略**
   - 实现Redis缓存
   - 缓存统计信息
   - 缓存导出结果

3. **负载均衡**
   - 使用Nginx反向代理
   - 配置多实例部署

## 🎯 下一步计划

### 立即执行
- [ ] 运行`./deploy-to-aliyun.sh`部署后端
- [ ] 运行`./test-api.sh`测试API
- [ ] 启动前端服务开始收集数据

### 短期优化
- [ ] 设置自动备份
- [ ] 配置HTTPS
- [ ] 添加监控告警

### 长期规划
- [ ] 数据分析和可视化
- [ ] 用户认证系统
- [ ] 移动端适配

## 📞 技术支持

如需帮助，请按以下顺序查找：

1. **查看文档**
   - README.md - 完整文档
   - QUICK_START.md - 快速指南
   - DEPLOYMENT_CHECKLIST.md - 检查清单

2. **查看日志**
   - 服务器日志：`journalctl -u questionnaire-backend -f`
   - 浏览器控制台：F12 → Console
   - 网络请求：F12 → Network

3. **测试工具**
   - test-api.sh - 命令行测试
   - test-api.html - Web界面测试

## 🎊 总结

您的问卷调查系统已经准备就绪！现在您可以：

1. ✅ 将问卷数据自动保存到阿里云服务器
2. ✅ 通过Web界面查看和管理数据
3. ✅ 导出数据进行分析
4. ✅ 随时随地访问和管理问卷数据

**祝您研究顺利！**

---

**部署日期**: 2025-01-01
**版本**: v1.0.0
**状态**: ✅ 准备就绪
