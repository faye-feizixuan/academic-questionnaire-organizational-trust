// 测试nodemailer
const nodemailer = require('nodemailer');

console.log('nodemailer:', nodemailer);
console.log('nodemailer.createTransporter:', typeof nodemailer.createTransporter);

// 尝试创建transporter
try {
    const transporter = nodemailer.createTransporter({
        host: 'smtp.qq.com',
        port: 587,
        secure: false,
        auth: {
            user: '954079744@qq.com',
            pass: 'ywvjzvtdwckdbdih'
        }
    });
    console.log('Transporter created successfully!');
} catch (error) {
    console.error('Error creating transporter:', error);
}