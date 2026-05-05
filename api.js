// API配置会从 config.js 中读取

/**
 * 保存问卷数据到服务器
 * @param {Object} data - 问卷数据
 * @param {AbortSignal} signal - 中止信号（可选）
 * @returns {Promise<Object>} - 服务器响应
 */
async function saveDataToServer(data, signal = null) {
    try {
        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        };

        if (signal) {
            fetchOptions.signal = signal;
        }

        const response = await fetch(`${API_BASE_URL}/questionnaire/save`, fetchOptions);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || '保存失败');
        }

        return result;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('保存请求超时');
            throw new Error('保存请求超时');
        }
        console.error('保存问卷数据错误:', error);
        throw error;
    }
}

/**
 * 分步保存问卷数据到服务器（实时保存）
 * @param {number|string} currentPage - 当前页面编号
 * @param {Object} formData - 当前页面的表单数据
 * @param {AbortSignal} signal - 中止信号（可选）
 * @returns {Promise<Object>} - 服务器响应
 */
async function savePartialData(currentPage, formData, signal = null) {
    try {
        // 从localStorage获取基础信息
        const localData = localStorage.getItem('questionnaire_data');
        if (!localData) {
            console.warn('未找到本地问卷数据');
            return { success: false, error: '未找到本地问卷数据' };
        }

        const questionnaireData = JSON.parse(localData);

        // 构建分步保存数据
        const partialData = {
            participantId: questionnaireData.participantId,
            currentPage: currentPage,
            formData: formData,
            group: questionnaireData.group,
            startTime: questionnaireData.startTime,
            completed: false
        };

        console.log('分步保存数据:', partialData);

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(partialData)
        };

        if (signal) {
            fetchOptions.signal = signal;
        }

        const response = await fetch(`${API_BASE_URL}/questionnaire/partial-save`, fetchOptions);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || '保存失败');
        }

        console.log('分步保存成功:', result);
        return result;
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('分步保存请求超时');
            throw new Error('保存请求超时');
        }
        console.error('分步保存问卷数据错误:', error);
        throw error;
    }
}

/**
 * 获取问卷数据
 * @param {string} participantId - 参与者ID
 * @returns {Promise<Object>} - 问卷数据
 */
async function getQuestionnaireData(participantId) {
    try {
        const response = await fetch(`${API_BASE_URL}/questionnaire/${participantId}`);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || '获取失败');
        }

        return result;
    } catch (error) {
        console.error('获取问卷数据错误:', error);
        throw error;
    }
}

/**
 * 显示保存状态提示
 * @param {string} message - 提示消息
 * @param {string} type - 类型: 'success' | 'error' | 'info'
 */
function showSaveStatus(message, type = 'info') {
    // 移除已存在的提示
    const existingToast = document.querySelector('.save-status-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 创建新的提示
    const toast = document.createElement('div');
    toast.className = `save-status-toast fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    toast.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fa ${
                type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle'
            }"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // 3秒后自动消失
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 自动保存问卷数据
 * @param {Object} data - 要保存的数据
 * @param {boolean} showNotification - 是否显示通知
 */
async function autoSaveData(data, showNotification = false) {
    try {
        console.log('开始保存数据到服务器...');

        // 从localStorage获取完整的问卷数据
        const localData = localStorage.getItem('questionnaire_data');
        if (!localData) {
            console.warn('未找到本地问卷数据');
            return;
        }

        const questionnaireData = JSON.parse(localData);
        console.log('从localStorage读取的数据:', questionnaireData);

        // 合并数据
        const mergedData = {
            ...questionnaireData,
            ...data
        };

        // 转换字段名以匹配后端期望的格式
        const formattedData = {
            participantId: mergedData.participantId,
            group: mergedData.group,
            currentPage: mergedData.currentPage,
            preTest: mergedData.preTest,
            attentionTest: mergedData.attentionTest,
            mainQuestionnaire: mergedData.mainQuestionnaire,
            demographics: mergedData.demographics,
            contactInfo: mergedData.contactInfo,
            startTime: mergedData.startTime,
            completed: mergedData.completed,
            completionTime: mergedData.completionTime
        };

        console.log('准备保存到服务器的数据:', formattedData);

        // 设置超时时间
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

        try {
            // 保存到服务器
            const result = await saveDataToServer(formattedData, controller.signal);
            clearTimeout(timeoutId);

            console.log('数据成功保存到服务器:', result);

            if (showNotification) {
                showSaveStatus('数据保存成功', 'success');
            }

            return result;
        } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
        }
    } catch (error) {
        console.error('保存到服务器失败:', error);
        if (showNotification) {
            showSaveStatus('数据保存失败: ' + error.message, 'error');
        }
        throw error;
    }
}

/**
 * 从服务器恢复问卷数据
 * @param {string} participantId - 参与者ID
 * @returns {Promise<Object>} - 问卷数据
 */
async function restoreFromServer(participantId) {
    try {
        const data = await getQuestionnaireData(participantId);

        // 保存到localStorage
        localStorage.setItem('questionnaire_data', JSON.stringify({
            participantId: data.participant_id,
            group: data.group_number,
            currentPage: data.completed ? 9 : 1,
            preTest: data.pre_test || {},
            attentionTest: data.attention_test || {},
            mainQuestionnaire: data.main_questionnaire || {},
            demographics: data.demographics || {},
            contactInfo: data.contact_info || '',
            startTime: data.start_time,
            completed: data.completed === 1
        }));

        return data;
    } catch (error) {
        console.error('从服务器恢复数据错误:', error);
        throw error;
    }
}

/**
 * 检查网络连接状态
 * @returns {boolean} - 是否在线
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * 监听网络状态变化
 * @param {Function} callback - 回调函数
 */
function onNetworkStatusChange(callback) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
}