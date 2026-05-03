# 快速部署指南

## 前提条件

- 阿里云服务器已创建（IP: 47.114.85.2）
- 本地已安装SSH客户端
- 服务器已开放3001端口

## 部署步骤

### 第一步：部署后端服务到阿里云

```bash
# 进入项目目录
cd "/Users/wanghao/Desktop/Trae/orgnization trust/data/academic_questionnaire"

# 运行部署脚本
./deploy-to-aliyun.sh
```

**注意**：首次运行可能需要输入服务器密码。

### 第二步：验证部署

```bash
# 测试API是否正常工作
./test-api.sh
```

如果看到所有测试都通过，说明部署成功！

### 第三步：启动前端服务

```bash
# 使用现有的启动脚本
bash start.sh
```

或者手动启动：

```bash
# 启动前端服务（端口8000）
python3 -m http.server 8000
```

### 第四步：访问系统

打开浏览器访问：`http://localhost:8000`

## 数据管理

### 查看实时数据

1. 访问问卷首页
2. 点击"数据导出"按钮
3. 输入密码：`2025311741`
4. 查看所有问卷数据

### 导出数据

在数据导出页面，可以：
- 查看所有问卷数据
- 按完成状态筛选
- 按分组筛选
- 导出为JSON格式

### 服务器管理

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

### 备份数据

```bash
# 在服务器上备份数据库
ssh root@47.114.85.2
cd /root/questionnaire-backend/data
cp questionnaire.db questionnaire.db.backup.$(date +%Y%m%d)

# 下载到本地
exit
scp root@47.114.85.2:/root/questionnaire-backend/data/questionnaire.db ./
```

## 常见问题

### Q1: 部署脚本无法连接服务器

**解决方案**：
- 检查服务器IP是否正确
- 检查SSH端口（默认22）是否开放
- 检查服务器密码是否正确
- 尝试手动SSH连接：`ssh root@47.114.85.2`

### Q2: API测试失败

**解决方案**：
```bash
# 检查服务是否运行
ssh root@47.114.85.2
systemctl status questionnaire-backend

# 如果服务未运行，启动它
systemctl start questionnaire-backend

# 检查防火墙
firewall-cmd --list-ports
# 如果没有3001端口，添加它
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --reload
```

### Q3: 数据无法保存

**解决方案**：
1. 检查浏览器控制台是否有错误（F12）
2. 检查网络连接
3. 检查服务器日志：`journalctl -u questionnaire-backend -n 50`
4. 确认API地址配置正确（查看api.js文件）

### Q4: 如何修改数据导出密码

编辑`config.js`文件：

```javascript
const DATA_EXPORT_PASSWORD = "你的新密码";
```

然后重启前端服务。

## 下一步

部署完成后，您可以：

1. **开始收集数据**：让参与者访问问卷系统
2. **监控数据收集**：定期查看数据导出页面
3. **数据分析**：导出数据后使用Excel、SPSS或R进行分析
4. **定期备份**：设置自动备份脚本保护数据

## 技术支持

如需帮助，请查看：
- 详细文档：`README.md`
- API文档：`README.md`中的"API接口文档"部分
- 服务器日志：`journalctl -u questionnaire-backend -f`

---

**祝您研究顺利！**
