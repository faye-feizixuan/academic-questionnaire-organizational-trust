const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// 提交问卷数据
app.post('/api/submit-questionnaire', (req, res) => {
    try {
        const data = req.body;
        
        // 验证必要字段
        if (!data.participantId || !data.group) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必要字段：participantId 或 group' 
            });
        }
        
        // 检查是否已存在该参与者的数据
        db.get(
            'SELECT id FROM questionnaire_data WHERE participant_id = ?',
            [data.participantId],
            (err, existing) => {
                if (err) {
                    console.error('查询数据时出错:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: '数据库错误：' + err.message 
                    });
                }
                
                if (existing) {
                    // 更新现有数据
                    const updateStmt = `
                        UPDATE questionnaire_data SET
                            group_number = ?,
                            start_time = ?,
                            completion_time = ?,
                            attention_test_attempts = ?,
                            pre_test_data = ?,
                            attention_test_data = ?,
                            main_questionnaire_data = ?,
                            demographics_data = ?,
                            corruption_perception_data = ?,
                            contact_info = ?,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE participant_id = ?
                    `;
                    
                    db.run(updateStmt, [
                        data.group,
                        data.startTime || null,
                        data.completionTime || null,
                        data.attentionTest?.attempts || 0,
                        JSON.stringify(data.preTest || {}),
                        JSON.stringify(data.attentionTest || {}),
                        JSON.stringify(data.mainQuestionnaire || {}),
                        JSON.stringify(data.demographics || {}),
                        JSON.stringify(data.corruptionPerception || {}),
                        data.contactInfo || '',
                        data.participantId
                    ], (err) => {
                        if (err) {
                            console.error('更新数据时出错:', err);
                            return res.status(500).json({ 
                                success: false, 
                                message: '数据库错误：' + err.message 
                            });
                        }
                        
                        console.log(`更新参与者 ${data.participantId} 的数据`);
                        res.json({ 
                            success: true, 
                            message: '数据保存成功' 
                        });
                    });
                } else {
                    // 插入新数据
                    const insertStmt = `
                        INSERT INTO questionnaire_data (
                            participant_id, group_number, start_time, completion_time,
                            attention_test_attempts, pre_test_data, attention_test_data,
                            main_questionnaire_data, demographics_data, corruption_perception_data,
                            contact_info
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    
                    db.run(insertStmt, [
                        data.participantId,
                        data.group,
                        data.startTime || null,
                        data.completionTime || null,
                        data.attentionTest?.attempts || 0,
                        JSON.stringify(data.preTest || {}),
                        JSON.stringify(data.attentionTest || {}),
                        JSON.stringify(data.mainQuestionnaire || {}),
                        JSON.stringify(data.demographics || {}),
                        JSON.stringify(data.corruptionPerception || {}),
                        data.contactInfo || ''
                    ], (err) => {
                        if (err) {
                            console.error('插入数据时出错:', err);
                            return res.status(500).json({ 
                                success: false, 
                                message: '数据库错误：' + err.message 
                            });
                        }
                        
                        console.log(`保存参与者 ${data.participantId} 的新数据`);
                        res.json({ 
                            success: true, 
                            message: '数据保存成功' 
                        });
                    });
                }
            }
        );
        
    } catch (error) {
        console.error('保存数据时出错:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误：' + error.message 
        });
    }
});

// 获取所有问卷数据
app.get('/api/questionnaires', (req, res) => {
    try {
        db.all(`
            SELECT * FROM questionnaire_data 
            ORDER BY created_at DESC
        `, [], (err, rows) => {
            if (err) {
                console.error('获取数据时出错:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: '数据库错误：' + err.message 
                });
            }
            
            // 解析JSON数据
            const formattedData = rows.map(row => ({
                id: row.id,
                participantId: row.participant_id,
                group: row.group_number,
                startTime: row.start_time,
                completionTime: row.completion_time,
                attentionTestAttempts: row.attention_test_attempts,
                preTest: JSON.parse(row.pre_test_data || '{}'),
                attentionTest: JSON.parse(row.attention_test_data || '{}'),
                mainQuestionnaire: JSON.parse(row.main_questionnaire_data || '{}'),
                demographics: JSON.parse(row.demographics_data || '{}'),
                corruptionPerception: JSON.parse(row.corruption_perception_data || '{}'),
                contactInfo: row.contact_info,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));
            
            res.json({ 
                success: true, 
                data: formattedData,
                count: formattedData.length 
            });
        });
        
    } catch (error) {
        console.error('获取数据时出错:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误：' + error.message 
        });
    }
});

// 获取统计信息
app.get('/api/stats', (req, res) => {
    try {
        db.get('SELECT COUNT(*) as count FROM questionnaire_data', [], (err, row) => {
            if (err) {
                console.error('获取总数时出错:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: '数据库错误：' + err.message 
                });
            }
            
            const total = row.count;
            
            db.all(`
                SELECT group_number, COUNT(*) as count 
                FROM questionnaire_data 
                GROUP BY group_number
            `, [], (err, groupStats) => {
                if (err) {
                    console.error('获取分组统计时出错:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: '数据库错误：' + err.message 
                    });
                }
                
                db.get(`
                    SELECT COUNT(*) as count FROM questionnaire_data 
                    WHERE completion_time IS NOT NULL
                `, [], (err, row) => {
                    if (err) {
                        console.error('获取完成数时出错:', err);
                        return res.status(500).json({ 
                            success: false, 
                            message: '数据库错误：' + err.message 
                        });
                    }
                    
                    const completed = row.count;
                    
                    res.json({
                        success: true,
                        data: {
                            total,
                            completed,
                            groups: groupStats
                        }
                    });
                });
            });
        });
        
    } catch (error) {
        console.error('获取统计信息时出错:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误：' + error.message 
        });
    }
});

// 导出数据为Excel
app.get('/api/export', (req, res) => {
    try {
        db.all(`
            SELECT * FROM questionnaire_data 
            ORDER BY created_at DESC
        `, [], (err, rows) => {
            if (err) {
                console.error('导出数据时出错:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: '数据库错误：' + err.message 
                });
            }
            
            if (rows.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: '暂无数据可导出' 
                });
            }
            
            // 准备Excel数据
            const excelData = rows.map(row => {
                const preTest = JSON.parse(row.pre_test_data || '{}');
                const attentionTest = JSON.parse(row.attention_test_data || '{}');
                const mainQuestionnaire = JSON.parse(row.main_questionnaire_data || '{}');
                const demographics = JSON.parse(row.demographics_data || '{}');
                const corruptionPerception = JSON.parse(row.corruption_perception_data || '{}');
                
                const rowData = {
                    '参与者ID': row.participant_id,
                    '分组': row.group_number,
                    '开始时间': row.start_time,
                    '完成时间': row.completion_time,
                    '注意力测试尝试次数': row.attention_test_attempts,
                    '创建时间': row.created_at,
                    '更新时间': row.updated_at
                };
                
                // 添加预测试答案
                if (Object.keys(preTest).length > 0) {
                    Object.keys(preTest).forEach(key => {
                        rowData[`预测试_${key}`] = preTest[key];
                    });
                }
                
                // 添加注意力测试答案
                if (Object.keys(attentionTest).length > 0) {
                    Object.keys(attentionTest).forEach(key => {
                        if (key !== 'answers') {
                            rowData[`注意力测试_${key}`] = attentionTest[key];
                        }
                    });
                    if (attentionTest.answers) {
                        Object.keys(attentionTest.answers).forEach(key => {
                            rowData[`注意力测试答案_${key}`] = attentionTest.answers[key];
                        });
                    }
                }
                
                // 添加主问卷答案
                if (Object.keys(mainQuestionnaire).length > 0) {
                    Object.keys(mainQuestionnaire).forEach(key => {
                        rowData[`主问卷_${key}`] = mainQuestionnaire[key];
                    });
                }
                
                // 添加人口统计学变量
                if (Object.keys(demographics).length > 0) {
                    Object.keys(demographics).forEach(key => {
                        rowData[`人口统计_${key}`] = demographics[key];
                    });
                }
                
                // 添加腐败案件曝光感知数据
                if (Object.keys(corruptionPerception).length > 0) {
                    Object.keys(corruptionPerception).forEach(key => {
                        const value = Array.isArray(corruptionPerception[key]) 
                            ? corruptionPerception[key].join('; ') 
                            : corruptionPerception[key];
                        rowData[`腐败感知_${key}`] = value;
                    });
                }
                
                // 添加联系方式
                if (row.contact_info) {
                    rowData['联系方式'] = row.contact_info;
                }
                
                return rowData;
            });
            
            // 创建工作簿
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);
            
            // 设置列宽
            const colWidths = Object.keys(excelData[0]).map(() => ({ wch: 20 }));
            ws['!cols'] = colWidths;
            
            XLSX.utils.book_append_sheet(wb, ws, '问卷数据');
            
            // 生成文件名
            const fileName = `问卷数据_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            // 发送文件
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
            
            const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.send(buffer);
            
            console.log(`导出数据：${rows.length} 条记录`);
        });
        
    } catch (error) {
        console.error('导出数据时出错:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误：' + error.message 
        });
    }
});

// 删除指定参与者的数据
app.delete('/api/questionnaires/:participantId', (req, res) => {
    try {
        const { participantId } = req.params;
        
        db.run(
            'DELETE FROM questionnaire_data WHERE participant_id = ?',
            [participantId],
            function(err) {
                if (err) {
                    console.error('删除数据时出错:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: '数据库错误：' + err.message 
                    });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ 
                        success: false, 
                        message: '未找到该参与者的数据' 
                    });
                }
                
                res.json({ 
                    success: true, 
                    message: '数据删除成功' 
                });
            }
        );
        
    } catch (error) {
        console.error('删除数据时出错:', error);
        res.status(500).json({ 
            success: false, 
            message: '服务器错误：' + error.message 
        });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: '服务器运行正常',
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`问卷数据收集服务器已启动`);
    console.log(`端口: ${PORT}`);
    console.log(`API地址: http://localhost:${PORT}/api`);
    console.log(`=================================`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    db.close((err) => {
        if (err) {
            console.error('关闭数据库时出错:', err.message);
        } else {
            console.log('数据库连接已关闭');
        }
        process.exit(0);
    });
});