# 部署检查清单

## ✅ 准备阶段

- [ ] 阿里云服务器已创建（ID: i-bp16zp3nxmzpwetjzao6）
- [ ] 服务器公网IP确认：47.114.85.2
- [ ] 服务器密码已记录
- [ ] 本地SSH客户端可用
- [ ] 服务器安全组已开放3001端口

## ✅ 文件检查

### 后端服务
- [ ] `backend/server.js` - Express后端服务器
- [ ] `backend/package.json` - 后端依赖配置

### 前端配置
- [ ] `api.js` - API服务封装
- [ ] `config.js` - 配置文件

### 部署工具
- [ ] `deploy-to-aliyun.sh` - 自动化部署脚本（已添加执行权限）
- [ ] `test-api.sh` - API测试脚本（已添加执行权限）

### 文档
- [ ] `README.md` - 完整系统文档
- [ ] `QUICK_START.md` - 快速开始指南
- [ ] `DEPLOYMENT_SUMMARY.md` - 部署总结
- [ ] `DEPLOYMENT_CHECKLIST.md` - 本检查清单

### 测试工具
- [ ] `test-api.html` - Web版API测试工具

## ✅ 部署步骤

### 第一步：部署后端到阿里云
```bash
cd "/Users/wanghao/Desktop/Trae/orgnization trust/data/academic_questionnaire"
./deploy-to-aliyun.sh
```

检查项：
- [ ] 脚本成功连接到服务器
- [ ] 文件成功上传
- [ ] Node.js和依赖成功安装
- [ ] 服务成功启动
- [ ] systemctl服务已配置

### 第二步：验证部署

#### 方法1：使用命令行测试
```bash
./test-api.sh
```

检查项：
- [ ] 健康检查通过
- [ ] 保存测试数据成功
- [ ] 获取测试数据成功
- [ ] 统计信息获取成功
- [ ] 数据导出成功

#### 方法2：使用Web界面测试
```bash
# 在浏览器中打开
open test-api.html
```

检查项：
- [ ] 健康检查显示绿色
- [ ] 所有测试通过
- [ ] 响应详情正常显示

#### 方法3：手动测试
```bash
# 测试健康检查
curl http://47.114.85.2:3001/api/health

# 应该返回：
# {"status":"ok","message":"问卷后端服务运行正常"}
```

检查项：
- [ ] curl命令成功执行
- [ ] 返回正确的JSON响应

### 第三步：启动前端服务

#### 方法1：使用现有脚本
```bash
bash start.sh
```

#### 方法2：手动启动
```bash
python3 -m http.server 8000
```

检查项：
- [ ] 服务成功启动
- [ ] 监听8000端口
- [ ] 无错误信息

### 第四步：访问系统

在浏览器中访问：`http://localhost:8000`

检查项：
- [ ] 页面正常加载
- [ ] 可以看到问卷说明
- [ ] "开始问卷"按钮可点击
- [ ] 页脚显示正确

## ✅ 功能测试

### 问卷流程测试
- [ ] 可以开始问卷
- [ ] 可以填写问卷页面
- [ ] 数据自动保存到本地
- [ ] 数据自动同步到服务器
- [ ] 可以完成问卷

### 数据导出测试
- [ ] 可以打开数据导出模态框
- [ ] 输入密码可以验证（密码：2025311741）
- [ ] 可以查看问卷列表
- [ ] 可以按条件筛选
- [ ] 可以导出JSON数据

### 错误处理测试
- [ ] 网络断开时显示错误提示
- [ ] 服务器不可用时显示错误提示
- [ ] 数据验证失败时显示错误提示

## ✅ 服务器管理

### 服务状态检查
```bash
ssh root@47.114.85.2
systemctl status questionnaire-backend
```

检查项：
- [ ] 服务状态为 "active (running)"
- [ ] 无错误日志

### 日志检查
```bash
journalctl -u questionnaire-backend -n 50
```

检查项：
- [ ] 日志正常
- [ ] 无严重错误

### 数据库检查
```bash
ls -lh /root/questionnaire-backend/data/
sqlite3 /root/questionnaire-backend/data/questionnaire.db
.tables
SELECT COUNT(*) FROM questionnaires;
.quit
```

检查项：
- [ ] 数据库文件存在
- [ ] 表结构正确
- [ ] 可以查询数据

## ✅ 安全配置

- [ ] 数据导出密码已记录（默认：2025311741）
- [ ] 考虑修改默认密码
- [ ] 考虑配置HTTPS
- [ ] 考虑添加API密钥认证
- [ ] 考虑设置IP白名单

## ✅ 备份配置

### 手动备份
```bash
ssh root@47.114.85.2
cd /root/questionnaire-backend/data
cp questionnaire.db questionnaire.db.backup.$(date +%Y%m%d)
```

检查项：
- [ ] 备份文件创建成功
- [ ] 备份文件大小正确

### 自动备份（可选）
```bash
# 创建备份脚本
cat > /root/backup-questionnaire.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups/questionnaire"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
cp /root/questionnaire-backend/data/questionnaire.db $BACKUP_DIR/questionnaire.db.$DATE
find $BACKUP_DIR -name "questionnaire.db.*" -mtime +7 -delete
EOF

chmod +x /root/backup-questionnaire.sh

# 添加到crontab
crontab -e
# 添加：0 2 * * * /root/backup-questionnaire.sh
```

检查项：
- [ ] 备份脚本创建成功
- [ ] crontab配置成功
- [ ] 定时任务正常运行

## ✅ 性能优化

- [ ] 数据库索引已优化
- [ ] 日志级别已调整
- [ ] 缓存策略已配置
- [ ] 请求限流已配置

## ✅ 文档完善

- [ ] README.md已阅读
- [ ] QUICK_START.md已阅读
- [ ] DEPLOYMENT_SUMMARY.md已阅读
- [ ] API文档已理解
- [ ] 故障排查指南已了解

## ✅ 最终确认

- [ ] 所有测试通过
- [ ] 服务运行正常
- [ ] 数据可以正常保存和导出
- [ ] 备份策略已配置
- [ ] 监控方案已确定
- [ ] 应急预案已准备

## 📋 部署完成后的下一步

1. **立即执行**
   - [ ] 开始收集问卷数据
   - [ ] 监控数据收集情况
   - [ ] 定期检查服务器状态

2. **短期优化**
   - [ ] 设置自动备份
   - [ ] 配置HTTPS
   - [ ] 添加监控告警

3. **长期规划**
   - [ ] 数据分析和可视化
   - [ ] 用户认证系统
   - [ ] 性能优化

## 📞 技术支持

如遇问题，请按以下顺序排查：

1. 查看服务器日志：`journalctl -u questionnaire-backend -f`
2. 查看浏览器控制台：F12 → Console
3. 查看网络请求：F12 → Network
4. 查阅文档：README.md、QUICK_START.md
5. 检查网络连接：`ping 47.114.85.2`

---

**部署日期**: ___________
**部署人员**: ___________
**验收人员**: ___________
**状态**: ⬜ 待部署 / ⬜ 部署中 / ⬜ 已完成 / ⬜ 验收通过
