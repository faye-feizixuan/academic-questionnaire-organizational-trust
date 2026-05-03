# 📦 项目文件清单

## 🎯 项目概述

这是一个学术研究问卷调查系统，支持将问卷数据自动保存到阿里云服务器，便于数据管理和导出。

## 📁 项目结构

```
academic_questionnaire/
├── 📄 HTML文件
│   ├── index.html                    # 问卷入口页面
│   ├── instruction.html              # 实验指导页面
│   ├── pre-test.html                 # 前测问卷
│   ├── attention-test.html           # 注意力测试
│   ├── main-questionnaire.html       # 主问卷
│   ├── demographics.html             # 人口统计学问卷
│   ├── intervention.html             # 干预页面
│   ├── interview.html                # 访谈页面
│   ├── debriefing.html               # 实验说明页面
│   ├── export.html                   # 数据导出页面
│   ├── test-email.html               # 邮件测试页面
│   └── test-api.html                 # API测试页面（新增）
│
├── 🔧 配置文件
│   ├── api.js                        # API服务封装（新增）
│   ├── config.js                     # 配置文件（新增）
│   └── .gitignore                    # Git忽略文件
│
├── 🗄️ 后端服务
│   └── backend/
│       ├── server.js                 # Express后端服务器（新增）
│       └── package.json              # 后端依赖配置（新增）
│
├── 📧 邮件服务
│   └── email-service/
│       ├── server.js                 # 邮件服务器
│       ├── package.json              # 邮件服务依赖
│       └── test-nodemailer.js        # 邮件测试脚本
│
├── 🚀 部署工具
│   ├── start.sh                      # 启动脚本
│   ├── deploy-to-aliyun.sh           # 阿里云部署脚本（新增）
│   ├── test-api.sh                   # API测试脚本（新增）
│   └── test-email.js                 # 邮件测试脚本
│
└── 📚 文档
    ├── README.md                     # 完整系统文档（新增）
    ├── QUICK_START.md                # 快速开始指南（新增）
    ├── DEPLOYMENT_SUMMARY.md         # 部署总结（新增）
    ├── DEPLOYMENT_CHECKLIST.md       # 部署检查清单（新增）
    └── DEPLOYMENT_COMPLETE.md        # 部署完成说明（新增）
```

## 🆕 新增文件说明

### 后端服务

#### `backend/server.js`
- **功能**: Express后端服务器，提供问卷数据API
- **特性**:
  - SQLite数据库存储
  - RESTful API接口
  - CORS配置
  - 请求限流
  - 数据导出和统计
- **端口**: 3001

#### `backend/package.json`
- **功能**: 后端依赖配置
- **主要依赖**:
  - express: Web框架
  - cors: 跨域支持
  - body-parser: 请求体解析
  - better-sqlite3: SQLite数据库

### 前端配置

#### `api.js`
- **功能**: API服务封装
- **主要函数**:
  - `saveQuestionnaireData()` - 保存问卷数据
  - `getQuestionnaireData()` - 获取问卷数据
  - `autoSaveData()` - 自动保存
  - `restoreFromServer()` - 从服务器恢复数据
  - `exportData()` - 导出数据
  - `getStats()` - 获取统计信息

#### `config.js`
- **功能**: 配置文件
- **配置项**:
  - API_BASE_URL: API服务器地址
  - DATA_EXPORT_PASSWORD: 数据导出密码

### 部署工具

#### `deploy-to-aliyun.sh`
- **功能**: 自动化部署脚本
- **操作**:
  - 创建远程目录
  - 上传后端文件
  - 安装Node.js和依赖
  - 配置systemd服务
  - 启动服务
- **使用**: `./deploy-to-aliyun.sh`

#### `test-api.sh`
- **功能**: 命令行API测试脚本
- **测试项**:
  - 健康检查
  - 保存测试数据
  - 获取测试数据
  - 更新测试数据
  - 获取统计信息
  - 获取问卷列表
  - 导出数据
  - 删除测试数据
- **使用**: `./test-api.sh`

#### `test-api.html`
- **功能**: Web版API测试工具
- **特性**:
  - 图形化界面
  - 实时测试
  - 响应详情显示
  - 支持单独测试和批量测试
- **使用**: 在浏览器中打开

### 文档

#### `README.md`
- **内容**: 完整的系统文档
- **章节**:
  - 系统概述
  - 系统架构
  - 部署步骤
  - API接口文档
  - 数据管理
  - 本地开发
  - 数据导出
  - 安全建议
  - 故障排查
  - 更新日志

#### `QUICK_START.md`
- **内容**: 快速开始指南
- **章节**:
  - 前提条件
  - 部署步骤
  - 数据管理
  - 服务器管理
  - 常见问题
  - 下一步

#### `DEPLOYMENT_SUMMARY.md`
- **内容**: 部署总结
- **章节**:
  - 已创建的文件
  - 系统架构
  - 部署步骤
  - API端点
  - 数据流程
  - 安全配置
  - 数据备份
  - 监控和维护
  - 故障排查
  - 下一步建议

#### `DEPLOYMENT_CHECKLIST.md`
- **内容**: 部署检查清单
- **章节**:
  - 准备阶段
  - 文件检查
  - 部署步骤
  - 功能测试
  - 服务器管理
  - 安全配置
  - 备份配置
  - 性能优化
  - 文档完善
  - 最终确认

#### `DEPLOYMENT_COMPLETE.md`
- **内容**: 部署完成说明
- **章节**:
  - 项目概述
  - 已完成的工作
  - 下一步操作
  - 系统架构
  - API接口
  - 数据管理
  - 服务器管理
  - 配置说明
  - 安全建议
  - 文档索引
  - 故障排查
  - 性能优化建议
  - 下一步计划

## 📋 使用流程

### 1. 部署后端到阿里云

```bash
cd "/Users/wanghao/Desktop/Trae/orgnization trust/data/academic_questionnaire"
./deploy-to-aliyun.sh
```

### 2. 测试API连接

```bash
# 命令行测试
./test-api.sh

# 或使用Web界面测试
open test-api.html
```

### 3. 启动前端服务

```bash
bash start.sh
```

### 4. 访问系统

浏览器访问：`http://localhost:8000`

## 🔌 API端点

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
ssh root@47.114.85.2
cd /root/questionnaire-backend/data
cp questionnaire.db questionnaire.db.backup.$(date +%Y%m%d)
exit
scp root@47.114.85.2:/root/questionnaire-backend/data/questionnaire.db ./
```

## 🔧 服务器管理

```bash
# SSH登录
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

## 📚 文档导航

- **新手入门**: 阅读 `QUICK_START.md`
- **完整文档**: 阅读 `README.md`
- **部署检查**: 使用 `DEPLOYMENT_CHECKLIST.md`
- **部署总结**: 查看 `DEPLOYMENT_SUMMARY.md`
- **完成确认**: 查看 `DEPLOYMENT_COMPLETE.md`

## 🎯 快速开始

如果您想立即开始，请按照以下步骤操作：

1. **阅读快速指南**: `QUICK_START.md`
2. **部署后端**: `./deploy-to-aliyun.sh`
3. **测试API**: `./test-api.sh`
4. **启动前端**: `bash start.sh`
5. **访问系统**: http://localhost:8000

## 📞 技术支持

如需帮助，请查看：

1. **文档**
   - README.md - 完整文档
   - QUICK_START.md - 快速指南
   - DEPLOYMENT_CHECKLIST.md - 检查清单

2. **日志**
   - 服务器日志：`journalctl -u questionnaire-backend -f`
   - 浏览器控制台：F12 → Console

3. **测试工具**
   - test-api.sh - 命令行测试
   - test-api.html - Web界面测试

## ✅ 检查清单

在开始使用前，请确认：

- [ ] 已阅读 `QUICK_START.md`
- [ ] 已运行 `./deploy-to-aliyun.sh` 部署后端
- [ ] 已运行 `./test-api.sh` 测试API
- [ ] 已启动前端服务 `bash start.sh`
- [ ] 已访问系统 http://localhost:8000
- [ ] 已测试问卷填写功能
- [ ] 已测试数据导出功能
- [ ] 已设置数据备份

---

**版本**: v1.0.0
**更新日期**: 2025-01-01
**状态**: ✅ 准备就绪
