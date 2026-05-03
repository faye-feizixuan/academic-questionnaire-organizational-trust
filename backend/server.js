const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// 创建数据目录
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化SQLite数据库
const dbPath = path.join(dataDir, 'questionnaire.db');
const db = new Database(dbPath);

// 创建表结构
db.exec(`
    CREATE TABLE IF NOT EXISTS questionnaires (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant_id TEXT NOT NULL UNIQUE,
        group_number INTEGER NOT NULL,
        pre_test TEXT,
        attention_test TEXT,
        main_questionnaire TEXT,
        demographics TEXT,
        contact_info TEXT,
        start_time TEXT,
        end_time TEXT,
        completed INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questionnaire_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        participant_id TEXT NOT NULL,
        action TEXT NOT NULL,
        page TEXT,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_participant_id ON questionnaires(participant_id);
    CREATE INDEX IF NOT EXISTS idx_created_at ON questionnaires(created_at);
`);

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 限流配置
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制每个IP 15分钟内最多100个请求
    message: { error: '请求过于频繁，请稍后再试' }
});

app.use('/api/', limiter);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '问卷后端服务运行正常' });
});

// 保存或更新问卷数据
app.post('/api/questionnaire/save', (req, res) => {
    try {
        const {
            participantId,
            group,
            preTest,
            attentionTest,
            mainQuestionnaire,
            demographics,
            contactInfo,
            startTime,
            completed = false
        } = req.body;

        if (!participantId) {
            return res.status(400).json({ error: '参与者ID不能为空' });
        }

        const now = new Date().toISOString();
        const completedValue = completed ? 1 : 0;

        // 检查是否已存在
        const existing = db.prepare('SELECT id FROM questionnaires WHERE participant_id = ?').get(participantId);

        if (existing) {
            // 更新现有记录
            // 构建更新语句，只更新非undefined的字段
            let updateFields = [];
            let updateValues = [];
            
            if (group !== undefined) {
                updateFields.push('group_number = ?');
                updateValues.push(group);
            }
            
            if (preTest !== undefined) {
                updateFields.push('pre_test = ?');
                updateValues.push(JSON.stringify(preTest));
            }
            
            if (attentionTest !== undefined) {
                updateFields.push('attention_test = ?');
                updateValues.push(JSON.stringify(attentionTest));
            }
            
            if (mainQuestionnaire !== undefined) {
                updateFields.push('main_questionnaire = ?');
                updateValues.push(JSON.stringify(mainQuestionnaire));
            }
            
            if (demographics !== undefined) {
                updateFields.push('demographics = ?');
                updateValues.push(JSON.stringify(demographics));
            }
            
            if (contactInfo !== undefined) {
                updateFields.push('contact_info = ?');
                updateValues.push(contactInfo);
            }
            
            if (startTime !== undefined) {
                updateFields.push('start_time = ?');
                updateValues.push(startTime);
            }
            
            // 总是更新的字段
            updateFields.push('end_time = ?');
            updateFields.push('completed = ?');
            updateFields.push('updated_at = ?');
            updateValues.push(now);
            updateValues.push(completedValue);
            updateValues.push(now);
            
            // 添加WHERE条件
            updateValues.push(participantId);
            
            // 构建完整的SQL语句
            const updateQuery = `
                UPDATE questionnaires 
                SET ${updateFields.join(', ')}
                WHERE participant_id = ?
            `;
            
            // 执行更新
            const updateStmt = db.prepare(updateQuery);
            updateStmt.run(...updateValues);

            // 记录日志
            db.prepare(`
                INSERT INTO questionnaire_logs (participant_id, action, data)
                VALUES (?, 'update', ?)
            `).run(participantId, JSON.stringify(req.body));

            res.json({ success: true, message: '问卷数据更新成功' });
        } else {
            // 插入新记录
            const insertStmt = db.prepare(`
                INSERT INTO questionnaires (
                    participant_id, group_number, pre_test, attention_test,
                    main_questionnaire, demographics, contact_info,
                    start_time, end_time, completed
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            insertStmt.run(
                participantId,
                group,
                preTest ? JSON.stringify(preTest) : null,
                attentionTest ? JSON.stringify(attentionTest) : null,
                mainQuestionnaire ? JSON.stringify(mainQuestionnaire) : null,
                demographics ? JSON.stringify(demographics) : null,
                contactInfo === undefined ? null : contactInfo,
                startTime || now,
                completed ? now : null,
                completedValue
            );

            // 记录日志
            db.prepare(`
                INSERT INTO questionnaire_logs (participant_id, action, data)
                VALUES (?, 'create', ?)
            `).run(participantId, JSON.stringify(req.body));

            res.json({ success: true, message: '问卷数据保存成功' });
        }
    } catch (error) {
        console.error('保存问卷数据错误:', error);
        res.status(500).json({ error: '保存失败: ' + error.message });
    }
});

// 获取问卷数据
app.get('/api/questionnaire/:participantId', (req, res) => {
    try {
        const { participantId } = req.params;
        
        const row = db.prepare('SELECT * FROM questionnaires WHERE participant_id = ?').get(participantId);
        
        if (!row) {
            return res.status(404).json({ error: '未找到该问卷数据' });
        }

        // 解析JSON字段
        const result = {
            ...row,
            pre_test: row.pre_test ? JSON.parse(row.pre_test) : null,
            attention_test: row.attention_test ? JSON.parse(row.attention_test) : null,
            main_questionnaire: row.main_questionnaire ? JSON.parse(row.main_questionnaire) : null,
            demographics: row.demographics ? JSON.parse(row.demographics) : null
        };

        res.json(result);
    } catch (error) {
        console.error('获取问卷数据错误:', error);
        res.status(500).json({ error: '获取失败: ' + error.message });
    }
});

// 获取所有问卷数据（管理员接口）
app.get('/api/admin/questionnaires', (req, res) => {
    try {
        const { completed, group, limit = 100, offset = 0 } = req.query;
        
        let query = 'SELECT * FROM questionnaires WHERE 1=1';
        const params = [];

        if (completed !== undefined) {
            query += ' AND completed = ?';
            params.push(completed === 'true' ? 1 : 0);
        }

        if (group !== undefined) {
            query += ' AND group_number = ?';
            params.push(parseInt(group));
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const rows = db.prepare(query).all(...params);

        // 解析JSON字段
        const results = rows.map(row => ({
            ...row,
            pre_test: row.pre_test ? JSON.parse(row.pre_test) : null,
            attention_test: row.attention_test ? JSON.parse(row.attention_test) : null,
            main_questionnaire: row.main_questionnaire ? JSON.parse(row.main_questionnaire) : null,
            demographics: row.demographics ? JSON.parse(row.demographics) : null
        }));

        // 获取总数
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total').split('LIMIT')[0];
        const total = db.prepare(countQuery).get(...params.slice(0, -2)).total;

        res.json({
            data: results,
            total: total,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('获取问卷列表错误:', error);
        res.status(500).json({ error: '获取失败: ' + error.message });
    }
});

// 导出问卷数据为JSON
app.get('/api/admin/export', (req, res) => {
    try {
        const { format = 'json' } = req.query;
        
        const rows = db.prepare('SELECT * FROM questionnaires ORDER BY created_at DESC').all();

        // 解析JSON字段
        const results = rows.map(row => ({
            ...row,
            pre_test: row.pre_test ? JSON.parse(row.pre_test) : null,
            attention_test: row.attention_test ? JSON.parse(row.attention_test) : null,
            main_questionnaire: row.main_questionnaire ? JSON.parse(row.main_questionnaire) : null,
            demographics: row.demographics ? JSON.parse(row.demographics) : null
        }));

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=questionnaire_export_${new Date().toISOString().split('T')[0]}.json`);
            res.json(results);
        } else {
            res.status(400).json({ error: '不支持的导出格式' });
        }
    } catch (error) {
        console.error('导出数据错误:', error);
        res.status(500).json({ error: '导出失败: ' + error.message });
    }
});

// 获取统计信息
app.get('/api/admin/stats', (req, res) => {
    try {
        const total = db.prepare('SELECT COUNT(*) as count FROM questionnaires').get().count;
        const completed = db.prepare('SELECT COUNT(*) as count FROM questionnaires WHERE completed = 1').get().count;
        const incomplete = total - completed;

        const groupStats = db.prepare(`
            SELECT group_number, COUNT(*) as count 
            FROM questionnaires 
            GROUP BY group_number
        `).all();

        res.json({
            total,
            completed,
            incomplete,
            groups: groupStats
        });
    } catch (error) {
        console.error('获取统计信息错误:', error);
        res.status(500).json({ error: '获取统计失败: ' + error.message });
    }
});

// 删除问卷数据
app.delete('/api/admin/questionnaire/:participantId', (req, res) => {
    try {
        const { participantId } = req.params;
        
        const result = db.prepare('DELETE FROM questionnaires WHERE participant_id = ?').run(participantId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: '未找到该问卷数据' });
        }

        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('删除问卷数据错误:', error);
        res.status(500).json({ error: '删除失败: ' + error.message });
    }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log('问卷后端服务已启动');
    console.log('端口:', PORT);
    console.log('API地址: http://0.0.0.0:' + PORT + '/api');
    console.log('=================================');
    console.log('数据库路径:', dbPath);
    console.log('');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭数据库连接...');
    db.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n正在关闭数据库连接...');
    db.close();
    process.exit(0);
});
