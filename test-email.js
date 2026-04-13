// 测试邮件发送
const testData = {
    participantId: 'TEST-001',
    group: '1',
    startTime: new Date().toISOString(),
    completionTime: new Date().toISOString(),
    preTest: { q1: 'test', q2: 'test' },
    attentionTest: { q1: 'test' },
    mainQuestionnaire: { q1: 'test', q2: 'test' },
    demographics: { age: 25, gender: 'test' },
    corruptionPerception: { q1: 'test' },
    contactInfo: 'test@example.com'
};

fetch('http://localhost:3002/api/send-email', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: testData })
})
.then(response => response.json())
.then(result => {
    console.log('邮件发送结果:', result);
    if (result.success) {
        console.log('✅ 邮件发送成功！');
    } else {
        console.log('❌ 邮件发送失败:', result.message);
    }
})
.catch(error => {
    console.error('❌ 发送邮件时出错:', error);
});