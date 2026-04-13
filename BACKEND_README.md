# 问卷数据收集系统使用说明

## 系统概述

这是一个完整的学术问卷数据收集系统，包含前端问卷页面和后端数据服务器。系统可以自动收集所有参与者的问卷数据，并提供数据管理和导出功能。

## 系统架构

```
┌─────────────────┐         ┌─────────────────┐
│  前端问卷页面    │         │  后端数据服务器  │
│  (浏览器)       │◄────────►│  (Node.js)      │
│                 │  HTTP    │                 │
│  - index.html   │         │  - API接口      │
│  - pre-test.html│         │  - SQLite数据库 │
│  - ...          │         │  - 数据导出     │
└─────────────────┘         └─────────────────┘
```

## 安装步骤

### 1. 安装Node.js

确保您的系统已安装Node.js（建议版本14.x或更高）：

```bash
node --version
npm --version
```

如果没有安装，请从 https://nodejs.org/ 下载并安装。

### 2. 安装后端依赖

进入backend目录并安装依赖：

```bash
cd backend
npm install
```

### 3. 启动后端服务器

```bash
npm start
```

服务器将在 `http://localhost:3001` 启动。

### 4. 启动前端服务器

在项目根目录启动前端服务器：

```bash
cd ..
python3 -m http.server 8000
```

前端将在 `http://localhost:8000` 启动。

## 使用方法

### 参与者填写问卷

1. 访问 `http://localhost:8000`
2. 按照提示完成问卷
3. 问卷完成后，数据会自动发送到后端服务器

### 研究者管理数据

1. 访问 `http://localhost:8000/admin.html`
2. 可以查看所有参与者的数据
3. 可以搜索和筛选数据
4. 可以导出Excel格式的数据

## API接口说明

### 提交问卷数据

```
POST /api/submit-questionnaire
Content-Type: application/json

{
  "participantId": "string",
  "group": number,
  "startTime": "string",
  "completionTime": "string",
  "attentionTest": {...},
  "preTest": {...},
  "mainQuestionnaire": {...},
  "demographics": {...},
  "corruptionPerception": {...},
  "contactInfo": "string"
}
```

### 获取所有问卷数据

```
GET /api/questionnaires
```

### 获取统计信息

```
GET /api/stats
```

### 导出Excel数据

```
GET /api/export
```

### 删除指定参与者的数据

```
DELETE /api/questionnaires/:participantId
```

### 健康检查

```
GET /api/health
```

## 数据库结构

### questionnaire_data 表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INTEGER | 主键，自增 |
| participant_id | TEXT | 参与者ID |
| group_number | INTEGER | 分组编号 |
| start_time | TEXT | 开始时间 |
| completion_time | TEXT | 完成时间 |
| attention_test_attempts | INTEGER | 注意力测试尝试次数 |
| pre_test_data | TEXT | 预测试数据（JSON） |
| attention_test_data | TEXT | 注意力测试数据（JSON） |
| main_questionnaire_data | TEXT | 主问卷数据（JSON） |
| demographics_data | TEXT | 人口统计学数据（JSON） |
| corruption_perception_data | TEXT | 腐败感知数据（JSON） |
| contact_info | TEXT | 联系方式 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |

## 数据导出格式

导出的Excel文件包含以下列：

- 基本信息：参与者ID、分组、开始时间、完成时间、注意力测试尝试次数
- 预测试数据：所有预测试问题的答案
- 注意力测试数据：注意力测试答案和通过状态
- 主问卷数据：所有主问卷问题的答案
- 人口统计学数据：性别、出生年份、政治面貌等
- 腐败感知数据：案例通报次数、来源、防范效果等
- 联系方式：参与者提供的联系方式

## 注意事项

1. **服务器必须运行**：确保后端服务器始终运行，否则数据无法保存
2. **端口配置**：默认端口为3001，如果需要修改，请同时更新前端代码中的API地址
3. **数据备份**：定期备份 `backend/questionnaire.db` 数据库文件
4. **安全性**：在生产环境中，建议添加身份验证和HTTPS支持
5. **跨域问题**：如果部署到不同域名，需要配置CORS

## 故障排除

### 无法连接到服务器

1. 检查后端服务器是否运行：`http://localhost:3001/api/health`
2. 检查端口是否被占用
3. 检查防火墙设置

### 数据未保存

1. 打开浏览器开发者工具，查看Console是否有错误信息
2. 检查Network标签，确认API请求是否成功
3. 检查后端服务器日志

### 导出失败

1. 确认数据库中有数据
2. 检查浏览器是否允许下载文件
3. 检查后端服务器日志

## 技术支持

如有问题，请检查：
1. 浏览器控制台的错误信息
2. 后端服务器的日志输出
3. 数据库文件是否正常

## 更新日志

### v1.0.0 (2025-04-11)
- 初始版本
- 实现基本的数据收集功能
- 添加数据管理和导出功能
- 支持SQLite数据库存储