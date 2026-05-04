// 草稿管理器
// 提供问卷中途退出保存和恢复功能

// 问卷常量配置
const SURVEY_ID = "corruption_exposure_trust_experiment_2026";
const DRAFT_KEY = `survey_draft_${SURVEY_ID}`;
const DRAFT_EXPIRY_DAYS = 30; // 草稿有效期30天
const MATERIAL_VERSION = "v1.0"; // 材料版本

/**
 * 保存草稿到 localStorage
 * @param {Object} data - 问卷数据
 */
function saveDraft(data) {
    try {
        const draftData = {
            ...data,
            surveyId: SURVEY_ID,
            materialVersion: MATERIAL_VERSION,
            lastSavedAt: new Date().toISOString()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
        console.log('草稿已保存:', draftData);
        return true;
    } catch (error) {
        console.error('保存草稿失败:', error);
        return false;
    }
}

/**
 * 从 localStorage 加载草稿
 * @returns {Object|null} - 草稿数据
 */
function loadDraft() {
    try {
        const draftString = localStorage.getItem(DRAFT_KEY);
        if (!draftString) {
            return null;
        }

        const draftData = JSON.parse(draftString);

        // 检查是否是同一问卷
        if (draftData.surveyId !== SURVEY_ID) {
            console.warn('草稿属于不同问卷，忽略');
            return null;
        }

        // 检查材料版本是否一致
        if (draftData.materialVersion !== MATERIAL_VERSION) {
            console.warn('材料版本不匹配，忽略旧草稿');
            return null;
        }

        // 检查草稿是否过期
        if (isDraftExpired(draftData)) {
            console.warn('草稿已过期，自动清除');
            clearDraft();
            return null;
        }

        // 检查是否已完成
        if (draftData.completed) {
            console.log('草稿对应的问卷已完成');
            return null;
        }

        console.log('草稿加载成功:', draftData);
        return draftData;
    } catch (error) {
        console.error('加载草稿失败:', error);
        return null;
    }
}

/**
 * 清除草稿
 */
function clearDraft() {
    try {
        localStorage.removeItem(DRAFT_KEY);
        console.log('草稿已清除');
    } catch (error) {
        console.error('清除草稿失败:', error);
    }
}

/**
 * 检查是否存在有效的草稿
 * @returns {boolean} - 是否存在有效草稿
 */
function hasValidDraft() {
    const draft = loadDraft();
    return draft !== null;
}

/**
 * 检查草稿是否过期
 * @param {Object} draftData - 草稿数据
 * @returns {boolean} - 是否过期
 */
function isDraftExpired(draftData) {
    if (!draftData.lastSavedAt) {
        return true;
    }

    const lastSaved = new Date(draftData.lastSavedAt);
    const now = new Date();
    const diffDays = (now - lastSaved) / (1000 * 60 * 60 * 24);

    return diffDays > DRAFT_EXPIRY_DAYS;
}

/**
 * 更新草稿中的当前页码
 * @param {number} currentPage - 当前页码
 */
function updateDraftPage(currentPage) {
    const draft = loadDraft();
    if (draft) {
        draft.currentPage = currentPage;
        saveDraft(draft);
    }
}

/**
 * 更新草稿中的表单数据
 * @param {Object} formData - 表单数据
 */
function updateDraftFormData(formData) {
    const draft = loadDraft();
    if (draft) {
        // 合并数据，保留原有结构
        const mergedDraft = {
            ...draft,
            ...formData,
            lastSavedAt: new Date().toISOString()
        };
        saveDraft(mergedDraft);
    }
}

/**
 * 获取页面对应的文件名
 * @param {number} pageNumber - 页码
 * @returns {string} - 文件名
 */
function getPageFileName(pageNumber) {
    const pageMap = {
        0: 'index.html',
        1: 'pre-test.html',
        2: 'intervention.html',
        3: 'instruction.html',
        4: 'attention-test.html',
        5: 'main-questionnaire.html',
        6: 'demographics.html',
        7: 'interview.html',
        8: 'debriefing.html'
    };
    return pageMap[pageNumber] || 'index.html';
}

/**
 * 显示保存成功提示
 */
function showSaveSuccessToast() {
    showSaveStatus('系统已自动保存您的填写进度。', 'success');
}

/**
 * 显示恢复确认模态框
 * @param {Function} onContinue - 继续填写回调
 * @param {Function} onRestart - 重新开始回调
 */
function showRestoreModal(onContinue, onRestart) {
    // 检查是否已存在模态框
    let modal = document.getElementById('draft-restore-modal');
    if (modal) {
        modal.classList.remove('hidden');
        return;
    }

    // 创建模态框
    modal = document.createElement('div');
    modal.id = 'draft-restore-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4">
            <div class="text-center mb-6">
                <div class="text-blue-500 text-5xl mb-4">
                    <i class="fa fa-clock-o"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">检测到未完成的填写记录</h3>
                <p class="text-gray-600">您上次有未完成的填写记录，是否继续填写？</p>
            </div>
            
            <div class="flex space-x-3">
                <button id="restart-btn" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-all duration-300">
                    重新开始
                </button>
                <button id="continue-btn" class="flex-1 bg-primary hover:bg-accent text-white font-medium py-2 px-4 rounded-md transition-all duration-300">
                    继续填写
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // 绑定事件
    document.getElementById('continue-btn').addEventListener('click', function() {
        modal.classList.add('hidden');
        if (onContinue) onContinue();
    });

    document.getElementById('restart-btn').addEventListener('click', function() {
        modal.classList.add('hidden');
        if (onRestart) onRestart();
    });
}

/**
 * 显示暂时退出确认模态框
 * @param {Function} onExit - 退出回调
 */
function showExitModal(onExit) {
    const modal = document.createElement('div');
    modal.id = 'exit-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4">
            <div class="text-center mb-6">
                <div class="text-yellow-500 text-5xl mb-4">
                    <i class="fa fa-save"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">确认暂时退出？</h3>
                <p class="text-gray-600">您的填写进度将自动保存，下次打开问卷可继续填写。</p>
            </div>
            
            <div class="flex space-x-3">
                <button id="cancel-exit-btn" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-all duration-300">
                    继续填写
                </button>
                <button id="confirm-exit-btn" class="flex-1 bg-primary hover:bg-accent text-white font-medium py-2 px-4 rounded-md transition-all duration-300">
                    暂时退出
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('confirm-exit-btn').addEventListener('click', function() {
        modal.remove();
        alert('当前填写进度已保存。您下次打开问卷链接时可继续填写。');
        if (onExit) onExit();
    });

    document.getElementById('cancel-exit-btn').addEventListener('click', function() {
        modal.remove();
    });
}

/**
 * 添加"暂时退出"按钮到页面
 * @param {string} containerSelector - 容器选择器
 */
function addExitButton(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // 检查是否已存在按钮
    if (document.getElementById('exit-btn')) return;

    const exitBtn = document.createElement('button');
    exitBtn.id = 'exit-btn';
    exitBtn.className = 'bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-all duration-300 mr-3';
    exitBtn.innerHTML = '<i class="fa fa-sign-out mr-2"></i>暂时退出';

    // 插入到容器开头
    container.insertBefore(exitBtn, container.firstChild);

    exitBtn.addEventListener('click', function() {
        showExitModal(function() {
            window.location.href = 'index.html';
        });
    });
}

/**
 * 初始化页面，自动保存当前进度
 * @param {number} currentPage - 当前页码
 */
function initPageAutoSave(currentPage) {
    // 页面加载时更新草稿
    updateDraftPage(currentPage);

    // 监听页面离开前保存
    window.addEventListener('beforeunload', function(event) {
        const draft = loadDraft();
        if (draft) {
            draft.lastSavedAt = new Date().toISOString();
            saveDraft(draft);
        }
    });
}

/**
 * 初始化表单自动保存
 * @param {string} formSelector - 表单选择器
 */
function initFormAutoSave(formSelector) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    // 监听表单变化
    form.addEventListener('change', function() {
        saveDraftFromPage();
    });

    form.addEventListener('input', function() {
        // 使用防抖，避免频繁保存
        debounce(function() {
            saveDraftFromPage();
        }, 1000)();
    });
}

/**
 * 从当前页面收集数据并保存草稿
 * 需要各页面实现自己的收集逻辑
 */
function saveDraftFromPage() {
    // 这个函数需要在各页面中重写
    // 因为不同页面有不同的数据结构
    console.log('saveDraftFromPage 需要在具体页面中实现');
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
