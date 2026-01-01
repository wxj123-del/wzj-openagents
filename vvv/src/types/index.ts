// 密钥存储结构
export interface StoredKeys {
  // 魔珐星云密钥
  xingyunAppId: string;
  xingyunAppSecret: string;

  // 魔搭社区密钥
  modelScopeApiKey: string;

  // 密钥来源标识
  isTestKey?: boolean;
}

// 业务流程数据结构
export interface BusinessProcess {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedTime: string;
  icon?: string;

  // 办理流程步骤
  steps: Array<{
    order: number;
    title: string;
    description: string;
    location?: string;
    required: boolean;
  }>;

  // 所需材料
  materials: Array<{
    name: string;
    required: boolean;
    format: string[];
    remark?: string;
  }>;

  // 注意事项
  notes: string[];

  // 相关政策
  policies: Array<{
    title: string;
    url?: string;
    content: string;
  }>;
}

// 数字人状态
export type AvatarState = 'idle' | 'interactive_idle' | 'listen' | 'think' | 'speak' | 'offline'
export type AvatarStatus = 'offline' | 'online' | 'close'

// 对话消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// SDK消息类型
export interface SDKMessage {
  code: number;
  message: string;
  timestamp: number;
  originalError?: string;
}

// SDK网络信息
export interface SDKNetworkInfo {
  rtt: number;
  downlink: number;
}
