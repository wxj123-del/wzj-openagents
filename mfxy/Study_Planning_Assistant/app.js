/**
 * AI学习规划助手 - 主应用
 */
class App {
  constructor() {
    // 初始化所有管理器
    this.storageManager = new StorageManager();
    this.uiManager = new UIManager();
    this.avatarController = new AvatarController(this.storageManager, this.uiManager);
    this.aiModelClient = new AIModelClient(this.storageManager);
    this.learningPlanner = new LearningPlanner(
      this.storageManager,
      this.avatarController,
      this.aiModelClient,
      this.uiManager
    );

    // 将app实例暴露到全局，方便其他模块访问
    window.app = this;

    // 初始化应用
    this.init();
  }

  /**
   * 初始化应用
   */
  init() {
    console.log('🚀 初始化AI学习规划助手...');

    // 初始化AI模型客户端
    this.aiModelClient.init();

    // 加载保存的对话历史
    this.loadConversationHistory();

    // 加载保存的密钥
    this.loadSavedKeys();

    // 绑定事件
    this.bindEvents();

    console.log('✓ 应用初始化完成');
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 数字人连接控制
    this.uiManager.elements.connectBtn?.addEventListener('click', () => this.handleConnect());
    this.uiManager.elements.disconnectBtn?.addEventListener('click', () => this.handleDisconnect());

    // 消息发送
    this.uiManager.elements.sendBtn?.addEventListener('click', () => this.handleSendMessage());
    this.uiManager.elements.messageInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    // 快速操作
    this.uiManager.elements.quickActions.planning?.addEventListener('click', () => {
      this.handleQuickAction('planning');
    });
    this.uiManager.elements.quickActions.progress?.addEventListener('click', () => {
      this.handleQuickAction('progress');
    });
    this.uiManager.elements.quickActions.reminder?.addEventListener('click', () => {
      this.handleQuickAction('reminder');
    });

    // 密钥设置
    this.uiManager.elements.keysSettingsBtn?.addEventListener('click', () => {
      // 打开弹窗前加载最新的密钥
      this.loadSavedKeys();
      this.uiManager.toggleKeysModal(true);
    });

    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
      this.uiManager.toggleKeysModal(false);
    });

    document.getElementById('save-keys-btn')?.addEventListener('click', () => {
      this.handleSaveKeys();
    });

    document.getElementById('cancel-keys-btn')?.addEventListener('click', () => {
      this.uiManager.toggleKeysModal(false);
    });

    // 使用测试密钥复选框
    document.getElementById('use-test-keys')?.addEventListener('change', (e) => {
      this.handleTestKeysToggle(e.target.checked);
    });

    // 清空历史记录
    document.getElementById('clear-history-btn')?.addEventListener('click', () => {
      this.handleClearHistory();
    });

    // 页面卸载时清理资源
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  /**
   * 处理连接数字人
   */
  async handleConnect() {
    try {
      const success = await this.avatarController.connect();

      if (success) {
        this.uiManager.setSendButtonDisabled(false);

        // 连接成功的问候
        const greeting = '你好！我是学习规划助手小智，很高兴见到你！';
        this.uiManager.addMessage(greeting, 'assistant');

        // 延迟一下让数字人完全加载
        setTimeout(() => {
          this.avatarController.speak(greeting, true, true);
        }, 1000);
      }
    } catch (error) {
      console.error('连接失败:', error);
      this.uiManager.showError('连接失败: ' + error.message);
    }
  }

  /**
   * 处理断开连接
   */
  async handleDisconnect() {
    const confirmed = this.uiManager.confirm('确定要断开数字人连接吗？');

    if (confirmed) {
      await this.avatarController.disconnect();
      this.uiManager.setSendButtonDisabled(true);
    }
  }

  /**
   * 处理发送消息
   */
  async handleSendMessage() {
    const input = this.uiManager.getInputValue();

    if (!input.trim()) {
      return;
    }

    // 检查数字人是否连接
    const connectionStatus = this.avatarController.getConnectionStatus();
    if (!connectionStatus.isConnected) {
      this.uiManager.showError('请先连接数字人');
      return;
    }

    // 清空输入框
    this.uiManager.clearInput();

    // 禁用发送按钮，防止重复发送
    this.uiManager.setSendButtonDisabled(true);

    // 处理用户输入
    await this.learningPlanner.processInput(input);

    // 重新启用发送按钮
    this.uiManager.setSendButtonDisabled(false);
  }

  /**
   * 处理快速操作
   * @param {string} action - 操作类型
   */
  async handleQuickAction(action) {
    const connectionStatus = this.avatarController.getConnectionStatus();

    if (!connectionStatus.isConnected) {
      this.uiManager.showError('请先连接数字人');
      return;
    }

    switch (action) {
      case 'planning':
        await this.learningPlanner.startPlanning();
        break;
      case 'progress':
        await this.learningPlanner.showProgress();
        break;
      case 'reminder':
        await this.learningPlanner.setReminder();
        break;
    }
  }

  /**
   * 处理保存密钥
   */
  handleSaveKeys() {
    const useTestKeys = document.getElementById('use-test-keys')?.checked;

    if (useTestKeys) {
      // 使用测试密钥
      this.storageManager.saveKeys({
        ...CONFIG.TEST_KEYS,
        use_test_keys: true
      });
      this.uiManager.showSuccess('已使用内置测试密钥');
      this.updateKeyStatus({...CONFIG.TEST_KEYS, use_test_keys: true});
    } else {
      // 使用自定义密钥
      const appId = document.getElementById('key-appid')?.value.trim();
      const secret = document.getElementById('key-secret')?.value.trim();
      const apiKey = document.getElementById('key-modelscope')?.value.trim();

      if (!appId || !secret || !apiKey) {
        this.uiManager.showError('请填写完整的密钥信息');
        return;
      }

      const keys = {
        xingyun_appId: appId,
        xingyun_appSecret: secret,
        modelscope_api_key: apiKey,
        use_test_keys: false
      };

      this.storageManager.saveKeys(keys);
      this.uiManager.showSuccess('密钥已保存');
      this.updateKeyStatus(keys);
    }

    // 关闭弹窗
    this.uiManager.toggleKeysModal(false);

    // 如果数字人已连接，提示重新连接
    const connectionStatus = this.avatarController.getConnectionStatus();
    if (connectionStatus.isConnected) {
      this.uiManager.showSuccess('密钥已更新，请重新连接数字人');
      this.avatarController.disconnect();
    }
  }

  /**
   * 处理测试密钥切换
   * @param {boolean} checked - 是否选中
   */
  handleTestKeysToggle(checked) {
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.disabled = checked;
      if (checked) {
        input.value = '';
      }
    });
  }

  /**
   * 加载保存的密钥
   */
  loadSavedKeys() {
    const savedKeys = this.storageManager.getKeys();

    // 始终填充密钥到输入框（即使使用测试密钥也填充）
    document.getElementById('key-appid').value = savedKeys.xingyun_appId || '';
    document.getElementById('key-secret').value = savedKeys.xingyun_appSecret || '';
    document.getElementById('key-modelscope').value = savedKeys.modelscope_api_key || '';

    // 根据设置决定是否使用测试密钥
    if (savedKeys.use_test_keys) {
      document.getElementById('use-test-keys').checked = true;
      this.handleTestKeysToggle(true);
    } else {
      document.getElementById('use-test-keys').checked = false;
      this.handleTestKeysToggle(false);
    }

    // 更新密钥状态显示
    this.updateKeyStatus(savedKeys);

    console.log('✓ 已加载保存的密钥配置');
  }

  /**
   * 更新密钥状态显示
   * @param {Object} keys - 密钥对象
   */
  updateKeyStatus(keys) {
    const statusText = document.getElementById('key-status-text');
    if (!statusText) return;

    if (keys.use_test_keys) {
      statusText.innerHTML = '<span style="color: #4CAF50;">✓ 使用内置测试密钥</span>';
    } else {
      const hasAppId = !!keys.xingyun_appId;
      const hasSecret = !!keys.xingyun_appSecret;
      const hasApiKey = !!keys.modelscope_api_key;

      if (hasAppId && hasSecret && hasApiKey) {
        statusText.innerHTML = '<span style="color: #4CAF50;">✓ 使用自定义密钥（已配置完整）</span>';
      } else {
        statusText.innerHTML = '<span style="color: #FF9800;">⚠ 密钥配置不完整</span>';
      }
    }
  }

  /**
   * 加载对话历史
   */
  loadConversationHistory() {
    const history = this.storageManager.getConversationHistory();

    if (history.length > 0) {
      // 清空默认欢迎消息
      this.uiManager.clearChatHistory();

      // 加载历史消息
      history.forEach(msg => {
        this.uiManager.addMessage(msg.content, msg.role);
      });
    }
  }

  /**
   * 处理清空历史
   */
  handleClearHistory() {
    const confirmed = this.uiManager.confirm('确定要清空所有对话记录吗？');

    if (confirmed) {
      this.storageManager.clearConversationHistory();
      this.uiManager.clearChatHistory();
      this.uiManager.showSuccess('对话记录已清空');
    }
  }

  /**
   * 清理资源
   */
  async cleanup() {
    console.log('清理应用资源...');

    // 断开数字人连接
    if (this.avatarController) {
      await this.avatarController.disconnect();
    }

    console.log('✓ 资源清理完成');
  }
}

// 等待SDK加载完成后初始化应用
function initializeApp() {
  console.log('📚 AI学习规划助手 v1.0.0');
  console.log('=================================');

  // 检查必需的依赖
  if (typeof XmovAvatar === 'undefined') {
    console.error('✗ 魔珐星云SDK未加载，请检查网络连接');
    alert('数字人SDK加载失败，请刷新页面重试');
    return;
  }

  console.log('✓ 魔珐星云SDK已加载');

  // 创建应用实例
  try {
    window.appInstance = new App();
  } catch (error) {
    console.error('✗ 应用初始化失败:', error);
    alert('应用初始化失败: ' + error.message);
  }
}

// 页面加载完成后等待SDK加载
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM已加载完成，等待SDK加载...');

  // 等待最多10秒让SDK加载
  let attempts = 0;
  const maxAttempts = 100; // 10秒 (100ms * 100)

  const checkSDKLoaded = setInterval(() => {
    attempts++;

    if (typeof XmovAvatar !== 'undefined') {
      clearInterval(checkSDKLoaded);
      console.log(`✓ SDK在第${attempts * 100}ms加载完成`);
      initializeApp();
    } else if (attempts >= maxAttempts) {
      clearInterval(checkSDKLoaded);
      console.error('✗ SDK加载超时');
      alert('数字人SDK加载超时，请检查网络连接后刷新页面重试');
    }
  }, 100);
});

// 暴露到全局，方便调试
if (typeof window !== 'undefined') {
  window.App = App;
  window.CONFIG = CONFIG;
}
