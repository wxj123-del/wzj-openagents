// 配置文件 - 包含测试密钥和应用配置

const CONFIG = {
  // 测试密钥配置
  TEST_KEYS: {
    xingyun_appId: '65254e14e816423da6218e47b2003ea8',
    xingyun_appSecret: 'ba0cb4a582e045d382fd65468937886f',
    modelscope_api_key: 'ms-6e0d45c0-1a56-4527-8ddc-fd7cb1dd796b'
  },

  // 魔珐星云SDK配置
  XINGYUN: {
    SDK_URL: 'https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar@latest.js',
    GATEWAY_SERVER: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session'
  },

  // 魔搭社区API配置
  MODELSCOPE: {
    API_BASE: 'https://api-inference.modelscope.cn/v1',
    CHAT_ENDPOINT: '/chat/completions',
    DEFAULT_MODEL: 'Qwen/Qwen2.5-72B-Instruct' // 或 'deepseek-ai/DeepSeek-R1'
  },

  // 应用配置
  APP: {
    NAME: 'AI学习规划助手',
    VERSION: '1.0.0',
    STORAGE_KEYS: {
      API_KEYS: 'learning_planner_keys',
      CONVERSATION_HISTORY: 'learning_planner_history',
      LEARNING_PLANS: 'learning_planner_plans',
      PROGRESS_RECORDS: 'learning_planner_progress'
    }
  },

  // 数字人状态
  AVATAR_STATES: {
    OFFLINE_MODE: 'offlineMode',
    ONLINE_MODE: 'onlineMode',
    IDLE: 'idle',
    INTERACTIVE_IDLE: 'interactive_idle',
    LISTEN: 'listen',
    THINK: 'think',
    SPEAK: 'speak'
  }
};

// 导出配置（根据环境选择导出方式）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
