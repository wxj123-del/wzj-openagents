/**
 * 存储管理器 - 管理密钥和数据的存储
 */
class StorageManager {
  constructor() {
    this.storageKeys = CONFIG.APP.STORAGE_KEYS;
  }

  /**
   * 保存密钥到localStorage
   * @param {Object} keys - 密钥对象
   */
  saveKeys(keys) {
    try {
      const keyData = {
        xingyun_appId: keys.xingyun_appId || '',
        xingyun_appSecret: keys.xingyun_appSecret || '',
        modelscope_api_key: keys.modelscope_api_key || '',
        use_test_keys: keys.use_test_keys || false,
        saved_at: new Date().toISOString()
      };
      localStorage.setItem(this.storageKeys.API_KEYS, JSON.stringify(keyData));
      console.log('✓ 密钥已保存');
      return true;
    } catch (error) {
      console.error('✗ 保存密钥失败:', error);
      return false;
    }
  }

  /**
   * 从localStorage获取密钥
   * @returns {Object} 密钥对象
   */
  getKeys() {
    try {
      const savedKeys = localStorage.getItem(this.storageKeys.API_KEYS);
      if (savedKeys) {
        return JSON.parse(savedKeys);
      }

      // 如果没有保存的密钥，返回测试密钥
      return {
        ...CONFIG.TEST_KEYS,
        use_test_keys: true
      };
    } catch (error) {
      console.error('✗ 读取密钥失败:', error);
      // 返回测试密钥作为后备
      return {
        ...CONFIG.TEST_KEYS,
        use_test_keys: true
      };
    }
  }

  /**
   * 清除保存的密钥
   */
  clearKeys() {
    try {
      localStorage.removeItem(this.storageKeys.API_KEYS);
      console.log('✓ 密钥已清除');
      return true;
    } catch (error) {
      console.error('✗ 清除密钥失败:', error);
      return false;
    }
  }

  /**
   * 验证密钥是否完整
   * @param {Object} keys - 密钥对象
   * @returns {boolean} 是否有效
   */
  validateKeys(keys) {
    return !!(
      keys &&
      keys.xingyun_appId &&
      keys.xingyun_appSecret &&
      keys.modelscope_api_key
    );
  }

  /**
   * 保存对话历史
   * @param {Array} messages - 消息数组
   */
  saveConversationHistory(messages) {
    try {
      localStorage.setItem(this.storageKeys.CONVERSATION_HISTORY, JSON.stringify(messages));
      return true;
    } catch (error) {
      console.error('✗ 保存对话历史失败:', error);
      return false;
    }
  }

  /**
   * 获取对话历史
   * @returns {Array} 消息数组
   */
  getConversationHistory() {
    try {
      const history = localStorage.getItem(this.storageKeys.CONVERSATION_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('✗ 读取对话历史失败:', error);
      return [];
    }
  }

  /**
   * 清除对话历史
   */
  clearConversationHistory() {
    try {
      localStorage.removeItem(this.storageKeys.CONVERSATION_HISTORY);
      console.log('✓ 对话历史已清除');
      return true;
    } catch (error) {
      console.error('✗ 清除对话历史失败:', error);
      return false;
    }
  }

  /**
   * 保存学习计划
   * @param {Object} plan - 学习计划对象
   */
  saveLearningPlan(plan) {
    try {
      const plans = this.getLearningPlans();
      plans.push(plan);
      localStorage.setItem(this.storageKeys.LEARNING_PLANS, JSON.stringify(plans));
      console.log('✓ 学习计划已保存');
      return true;
    } catch (error) {
      console.error('✗ 保存学习计划失败:', error);
      return false;
    }
  }

  /**
   * 获取学习计划列表
   * @returns {Array} 学习计划数组
   */
  getLearningPlans() {
    try {
      const plans = localStorage.getItem(this.storageKeys.LEARNING_PLANS);
      return plans ? JSON.parse(plans) : [];
    } catch (error) {
      console.error('✗ 读取学习计划失败:', error);
      return [];
    }
  }

  /**
   * 保存学习进度记录
   * @param {Object} progress - 进度记录对象
   */
  saveProgressRecord(progress) {
    try {
      const records = this.getProgressRecords();
      records.push(progress);
      localStorage.setItem(this.storageKeys.PROGRESS_RECORDS, JSON.stringify(records));
      console.log('✓ 学习进度已记录');
      return true;
    } catch (error) {
      console.error('✗ 保存学习进度失败:', error);
      return false;
    }
  }

  /**
   * 获取学习进度记录
   * @returns {Array} 进度记录数组
   */
  getProgressRecords() {
    try {
      const records = localStorage.getItem(this.storageKeys.PROGRESS_RECORDS);
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error('✗ 读取学习进度失败:', error);
      return [];
    }
  }

  /**
   * 清除所有应用数据
   */
  clearAllData() {
    try {
      Object.values(this.storageKeys).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('✓ 所有数据已清除');
      return true;
    } catch (error) {
      console.error('✗ 清除数据失败:', error);
      return false;
    }
  }
}
