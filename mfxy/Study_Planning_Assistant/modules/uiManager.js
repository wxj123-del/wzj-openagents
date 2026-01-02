/**
 * 界面管理器 - 管理UI更新和交互
 */
class UIManager {
  constructor() {
    this.elements = {};
    this.initElements();
  }

  /**
   * 初始化UI元素引用
   */
  initElements() {
    // 数字人相关
    this.elements.avatarContainer = document.getElementById('avatar-container');
    this.elements.connectBtn = document.getElementById('connect-btn');
    this.elements.disconnectBtn = document.getElementById('disconnect-btn');
    this.elements.connectionStatus = document.getElementById('connection-status');
    this.elements.avatarState = document.getElementById('avatar-state');

    // 交互相关
    this.elements.messageInput = document.getElementById('message-input');
    this.elements.sendBtn = document.getElementById('send-btn');
    this.elements.chatHistory = document.getElementById('chat-history');

    // 快速操作按钮
    this.elements.quickActions = {
      planning: document.getElementById('action-planning'),
      progress: document.getElementById('action-progress'),
      reminder: document.getElementById('action-reminder')
    };

    // 密钥设置
    this.elements.keysSettingsBtn = document.getElementById('keys-settings-btn');
    this.elements.keysModal = document.getElementById('keys-modal');
  }

  /**
   * 显示连接状态
   * @param {string} status - 状态: 'connecting' | 'connected' | 'disconnected' | 'failed'
   */
  showConnectionStatus(status) {
    const statusElement = this.elements.connectionStatus;
    if (!statusElement) return;

    const statusConfig = {
      connecting: { text: '连接中...', color: '#FF9500', dot: '🟡' },
      connected: { text: '已连接', color: '#4CD964', dot: '🟢' },
      disconnected: { text: '未连接', color: '#8E8E93', dot: '⚪' },
      failed: { text: '连接失败', color: '#FF3B30', dot: '🔴' }
    };

    const config = statusConfig[status] || statusConfig.disconnected;
    statusElement.innerHTML = `${config.dot} ${config.text}`;
    statusElement.style.color = config.color;

    // 更新按钮状态
    if (this.elements.connectBtn && this.elements.disconnectBtn) {
      this.elements.connectBtn.disabled = status === 'connected' || status === 'connecting';
      this.elements.disconnectBtn.disabled = status !== 'connected';
    }
  }

  /**
   * 更新加载进度
   * @param {number} progress - 进度百分比 0-100
   */
  updateLoadingProgress(progress) {
    const statusElement = this.elements.connectionStatus;
    if (statusElement) {
      statusElement.innerHTML = `加载中... ${progress}%`;
    }
  }

  /**
   * 更新数字人状态显示
   * @param {string} state - 状态名称
   */
  updateAvatarState(state) {
    const stateElement = this.elements.avatarState;
    if (!stateElement) return;

    const stateNames = {
      idle: '待机',
      listen: '倾听',
      think: '思考',
      speak: '说话',
      interactive_idle: '互动待机',
      offlineMode: '离线',
      onlineMode: '在线'
    };

    const stateName = stateNames[state] || state;
    stateElement.textContent = `状态: ${stateName}`;
  }

  /**
   * 添加消息到聊天历史
   * @param {string} content - 消息内容
   * @param {string} type - 类型: 'user' | 'assistant' | 'system'
   */
  addMessage(content, type = 'assistant') {
    const chatHistory = this.elements.chatHistory;
    if (!chatHistory) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message-${type}`;

    const label = type === 'user' ? '你' : type === 'system' ? '系统' : '助手';
    const timestamp = new Date().toLocaleTimeString();

    messageDiv.innerHTML = `
      <div class="message-header">
        <span class="message-label">${label}</span>
        <span class="message-time">${timestamp}</span>
      </div>
      <div class="message-content">${this.escapeHtml(content)}</div>
    `;

    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // 保存到localStorage
    const history = this.getChatHistoryFromDOM();
    if (window.app && window.app.storageManager) {
      window.app.storageManager.saveConversationHistory(history);
    }
  }

  /**
   * 清空聊天历史显示
   */
  clearChatHistory() {
    const chatHistory = this.elements.chatHistory;
    if (chatHistory) {
      chatHistory.innerHTML = '';
    }
  }

  /**
   * 从DOM获取聊天历史
   * @returns {Array} 消息数组
   */
  getChatHistoryFromDOM() {
    const messages = [];
    const messageElements = document.querySelectorAll('.chat-message');

    messageElements.forEach(element => {
      const type = element.classList.contains('chat-message-user') ? 'user' : 'assistant';
      const content = element.querySelector('.message-content')?.textContent || '';
      if (content) {
        messages.push({ role: type, content });
      }
    });

    return messages;
  }

  /**
   * 显示SDK消息
   * @param {Object} message - SDK消息对象
   */
  handleSDKMessage(message) {
    console.log('SDK消息:', message);
    // 可以根据需要处理SDK消息
    if (message.code !== 0) {
      this.showError(`SDK错误 [${message.code}]: ${message.message}`);
    }
  }

  /**
   * 显示错误提示
   * @param {string} message - 错误消息
   */
  showError(message) {
    alert('错误: ' + message);
    console.error(message);
  }

  /**
   * 显示成功提示
   * @param {string} message - 成功消息
   */
  showSuccess(message) {
    // 可以使用更友好的提示组件
    alert('✓ ' + message);
    console.log(message);
  }

  /**
   * 设置输入框的值
   * @param {string} value - 输入值
   */
  setInputValue(value) {
    if (this.elements.messageInput) {
      this.elements.messageInput.value = value;
    }
  }

  /**
   * 获取输入框的值
   * @returns {string} 输入值
   */
  getInputValue() {
    return this.elements.messageInput ? this.elements.messageInput.value : '';
  }

  /**
   * 清空输入框
   */
  clearInput() {
    if (this.elements.messageInput) {
      this.elements.messageInput.value = '';
    }
  }

  /**
   * 禁用/启用发送按钮
   * @param {boolean} disabled - 是否禁用
   */
  setSendButtonDisabled(disabled) {
    if (this.elements.sendBtn) {
      this.elements.sendBtn.disabled = disabled;
    }
  }

  /**
   * 显示/隐藏密钥设置弹窗
   * @param {boolean} show - 是否显示
   */
  toggleKeysModal(show) {
    if (this.elements.keysModal) {
      this.elements.keysModal.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * HTML转义
   * @param {string} text - 文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 显示加载动画
   * @param {string} message - 加载消息
   */
  showLoading(message = '加载中...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.id = 'loading-indicator';
    loadingDiv.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">${message}</div>
    `;

    document.body.appendChild(loadingDiv);
  }

  /**
   * 隐藏加载动画
   */
  hideLoading() {
    const loadingDiv = document.getElementById('loading-indicator');
    if (loadingDiv) {
      loadingDiv.remove();
    }
  }

  /**
   * 显示确认对话框
   * @param {string} message - 确认消息
   * @returns {boolean} 用户是否确认
   */
  confirm(message) {
    return window.confirm(message);
  }

  /**
   * 显示学习计划
   * @param {Object} plan - 学习计划对象
   */
  showLearningPlan(plan) {
    // 可以在侧边栏或弹窗中显示学习计划
    console.log('显示学习计划:', plan);
    this.addMessage(`已为您制定学习计划:\n${plan.content}`, 'assistant');
  }

  /**
   * 显示学习进度
   * @param {Object} progress - 进度对象
   */
  showProgress(progress) {
    console.log('显示学习进度:', progress);
    this.addMessage(`学习进度:\n完成: ${progress.completed}/${progress.total}\n学习时长: ${progress.duration}分钟`, 'assistant');
  }
}
