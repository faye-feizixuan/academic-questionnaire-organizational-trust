const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3002;

// 中间件
app.use(cors({
    origin: '*', // 允许所有来源，包括 Safari 的 localhost
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 处理 OPTIONS 预检请求
app.options('*', cors());

// 邮件配置
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 587,
    secure: false,
    auth: {
        user: '954079744@qq.com',
        pass: 'ywvjzvtdwckdbdih' // QQ邮箱授权码
    }
});

// 发送邮件的API
app.post('/api/send-email', (req, res) => {
    console.log('收到邮件发送请求');
    console.log('请求时间:', new Date().toISOString());
    
    try {
        const { data } = req.body;
        
        console.log('收到的数据:', JSON.stringify(data, null, 2));
        
        if (!data) {
            console.log('错误: 缺少数据');
            return res.status(400).json({ 
                success: false, 
                message: '缺少数据' 
            });
        }
        
        // 准备邮件内容
        const subject = `问卷数据 - 参与者 ${data.participantId} - 第${data.group}组`;
        
        let body = `问卷数据\n`;
        body += `=================================\n`;
        body += `参与者ID: ${data.participantId || 'N/A'}\n`;
        body += `分组: 第${data.group || 'N/A'}组\n`;
        body += `开始时间: ${formatDate(data.startTime) || 'N/A'}\n`;
        body += `完成时间: ${formatDate(data.completionTime) || 'N/A'}\n`;
        body += `=================================\n`;
        
        if (data.preTest) {
            body += `\n预测试答案:\n${JSON.stringify(data.preTest, null, 2)}\n`;
        }
        
        if (data.attentionTest) {
            body += `\n注意力测试:\n${JSON.stringify(data.attentionTest, null, 2)}\n`;
        }
        
        if (data.mainQuestionnaire) {
            body += `\n主问卷答案:\n${JSON.stringify(data.mainQuestionnaire, null, 2)}\n`;
        }
        
        if (data.demographics) {
            body += `\n人口统计学数据:\n${JSON.stringify(data.demographics, null, 2)}\n`;
        }
        
        if (data.corruptionPerception) {
            body += `\n腐败感知数据:\n${JSON.stringify(data.corruptionPerception, null, 2)}\n`;
        }
        
        body += `\n联系方式: ${data.contactInfo || 'N/A'}\n`;
        
        // 邮件选项
        const mailOptions = {
            from: '954079744@qq.com',
            to: '954079744@qq.com',
            subject: subject,
            text: body
        };
        
        console.log('准备发送邮件...');
        console.log('邮件主题:', subject);
        console.log('收件人:', '954079744@qq.com');
        
        // 发送邮件
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('发送邮件失败:', error);
                return res.status(500).json({ 
                    success: false, 
                    message: '发送邮件失败: ' + error.message 
                });
            }
            
            console.log('邮件发送成功:', info.response);
            console.log('邮件ID:', info.messageId);
            res.json({ 
                success: true, 
                message: '邮件发送成功',
                info: info.response
            });
        });
        
    } catch (error) {
        console.error('服务器错误:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误: ' + error.message 
        });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: '邮件服务运行正常',
        timestamp: new Date().toISOString()
    });
});

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`邮件发送服务已启动`);
    console.log(`端口: ${PORT}`);
    console.log(`API地址: http://localhost:${PORT}/api`);
    console.log(`=================================`);
    console.log('注意：请在server.js中设置正确的QQ邮箱授权码');
});