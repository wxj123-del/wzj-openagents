// API端点
export const API_ENDPOINTS = {
  MODELSCOPE_CHAT: 'https://api-inference.modelscope.cn/v1/chat/completions',
  XINGYUN_GATEWAY: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session'
}

// 内置测试密钥 - 多组备用
export const TEST_KEYS = {
  xingyun_appId: '65254e14e816423da6218e47b2003ea8',
  xingyun_appSecret: 'ba0cb4a582e045d382fd65468937886f',
  modelscope_api_key: 'ms-6e0d45c0-1a56-4527-8ddc-fd7cb1dd796b'
}

// 备用密钥组 - 当主密钥被限流时使用
export const BACKUP_KEYS = [
  {
    xingyun_appId: '65254e14e816423da6218e47b2003ea8',
    xingyun_appSecret: 'ba0cb4a582e045d382fd65468937886f',
    modelscope_api_key: 'ms-6e0d45c0-1a56-4527-8ddc-fd7cb1dd796b',
    name: '测试密钥1'
  }
  // 可以添加更多备用密钥
  // {
  //   xingyun_appId: 'your-app-id-2',
  //   xingyun_appSecret: 'your-app-secret-2',
  //   modelscope_api_key: 'your-modelscope-key-2',
  //   name: '备用密钥2'
  // }
]

// 数字人状态
export const AVATAR_STATES = {
  IDLE: 'idle',
  LISTEN: 'listen',
  THINK: 'think',
  SPEAK: 'speak',
  INTERACTIVE_IDLE: 'interactive_idle',
  ONLINE: 'onlineMode',
  OFFLINE: 'offlineMode'
}

// AI模型配置
export const MODEL_CONFIG = {
  // Qwen2.5系列模型（稳定支持）
  MODEL_NAME: 'Qwen/Qwen2.5-7B-Instruct',
  TEMPERATURE: 0.8,
  MAX_TOKENS: 2000
}

// 可选的其他模型（如果Qwen不可用，可以尝试这些）
export const ALTERNATIVE_MODELS = [
  'Qwen/Qwen2.5-72B-Instruct',
  'Qwen/Qwen2.5-14B-Instruct',
  'deepseek-ai/DeepSeek-R1',
  'THUDM/glm-4-9b-chat'
]

// 占卜类型
export const FORTUNE_TYPES = {
  TAROT: 'tarot',
  HOROSCOPE: 'horoscope',
  PSYCHOLOGY: 'psychology'
}

// 星座列表
export const ZODIAC_SIGNS = [
  { name: '白羊座', date: '3.21-4.19', element: '火' },
  { name: '金牛座', date: '4.20-5.20', element: '土' },
  { name: '双子座', date: '5.21-6.21', element: '风' },
  { name: '巨蟹座', date: '6.22-7.22', element: '水' },
  { name: '狮子座', date: '7.23-8.22', element: '火' },
  { name: '处女座', date: '8.23-9.22', element: '土' },
  { name: '天秤座', date: '9.23-10.23', element: '风' },
  { name: '天蝎座', date: '10.24-11.22', element: '水' },
  { name: '射手座', date: '11.23-12.21', element: '火' },
  { name: '摩羯座', date: '12.22-1.19', element: '土' },
  { name: '水瓶座', date: '1.20-2.18', element: '风' },
  { name: '双鱼座', date: '2.19-3.20', element: '水' }
]
