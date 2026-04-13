const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'questionnaire.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('数据库连接失败:', err.message);
    } else {
        console.log('数据库连接成功');
        console.log('数据库文件位置:', dbPath);
    }
});

console.log('数据库初始化中...');

// 创建问卷数据表
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS questionnaire_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            participant_id TEXT NOT NULL,
            group_number INTEGER NOT NULL,
            start_time TEXT,
            completion_time TEXT,
            attention_test_attempts INTEGER DEFAULT 0,
            pre_test_data TEXT,
            attention_test_data TEXT,
            main_questionnaire_data TEXT,
            demographics_data TEXT,
            corruption_perception_data TEXT,
            contact_info TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('创建表失败:', err.message);
        } else {
            console.log('数据表创建成功');
        }
    });

    // 创建索引以提高查询性能
    db.run(`CREATE INDEX IF NOT EXISTS idx_participant_id ON questionnaire_data(participant_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_group_number ON questionnaire_data(group_number)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_created_at ON questionnaire_data(created_at)`);
});

console.log('数据库初始化完成！');

module.exports = db;