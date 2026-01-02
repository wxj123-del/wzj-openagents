# VON健康助手 - 开发文档

## 项目概述

**比赛信息**: 星云黑客松 2025
**赛道**: 企业级 AI 服务专家赛道
**方向**: VON健康助手

本项目是一个基于星云3D数字人 + 魔搭社区AI模型的VON健康助手，通过实时语音交互提供健康咨询服务。

## 技术栈

- **前端框架**: 原生 HTML/CSS/JavaScript (单页面应用)
- **数字人SDK**: 魔珐星云具身驱动SDK (JS版本)
- **AI模型**: 魔搭社区 (ModelScope) API
- **数据存储**: LocalStorage
- **实时通信**: WebSocket (SDK内置)

## 核心功能

### 1. 密钥管理
- 支持手动输入密钥（星云数字人 + 魔搭社区）
- 密钥存储在 LocalStorage 中
- 提供内置测试密钥供快速体验

**内置测试密钥**:
```javascript
xingyun_appId: '65254e14e816423da6218e47b2003ea8'
xingyun_appSecret: 'ba0cb4a582e045d382fd65468937886f'
modelscope_api_key: 'ms-6e0d45c0-1a56-4527-8ddc-fd7cb1dd796b'
```

### 2. 数字人控制
- 手动连接/断开数字人
- 实时语音交互
- 状态管理（待机、倾听、思考、说话）
- 错误处理与重连机制

### 3. AI健康咨询
- 接入魔搭社区AI模型
- 流式响应处理
- 健康知识问答
- 对话历史管理

## 页面结构

```
┌─────────────────────────────────────┐
│     VON健康助手                      │
├─────────────────────────────────────┤
│  [密钥配置] [连接] [断开] [清空历史]  │
├───────────────┬─────────────────────┤
│               │                     │
│   数字人区域   │   对话记录区域        │
│   (3D渲染)    │   (消息列表)         │
│               │                     │
│               │                     │
├───────────────┴─────────────────────┤
│  [输入框] [发送按钮]                  │
└─────────────────────────────────────┘
```

## SDK集成方案

### 星云数字人SDK

**引入方式**:
```html
<script src="https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar@latest.js"></script>
```

**核心初始化代码**:
```javascript
const LiteSDK = new XmovAvatar({
  containerId: '#avatar-container',
  appId: localStorage.getItem('xingyun_appId'),
  appSecret: localStorage.getItem('xingyun_appSecret'),
  gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',

  // 消息回调
  onMessage(message) {
    console.log('SDK message:', message);
  },

  // 状态变化
  onStateChange(state) {
    console.log('State Change:', state);
  },

  // 音频状态
  onVoiceStateChange(status) {
    console.log('Voice Status:', status);
  },

  enableLogger: true
});

// 初始化
await LiteSDK.init({
  onDownloadProgress: (progress) => {
    console.log(`Loading: ${progress}%`);
  }
});
```

**数字人控制方法**:
- `idle()` - 待机状态
- `listen()` - 倾听状态
- `think()` - 思考状态
- `speak(text, is_start, is_end)` - 说话
- `offlineMode()` - 离线模式（节省积分）
- `onlineMode()` - 在线模式
- `destroy()` - 销毁实例

### 魔搭社区API

**API端点**: `https://api-inference.modelscope.cn/v1/chat/completions`

**请求示例**:
```javascript
const response = await fetch('https://api-inference.modelscope.cn/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('modelscope_api_key')}`
  },
  body: JSON.stringify({
    model: 'qwen/Qwen2.5-7B-Instruct',  // 或其他健康相关模型
    messages: [
      {
        role: 'system',
        content: '你是一个专业的健康咨询助手，提供健康建议和医疗知识科普...'
      },
      {
        role: 'user',
        content: userInput
      }
    ],
    stream: true  // 启用流式输出
  })
});
```

## 交互流程

### 用户输入流程
```
1. 用户输入文字/语音
   ↓
2. 前端调用魔搭API
   ↓
3. 数字人切换到 think() 状态
   ↓
4. 接收流式响应
   ↓
5. 数字人切换到 speak() 状态
   ↓
6. 实时播报AI回复
```

### SDK连接流程
```
1. 用户点击"连接"
   ↓
2. 验证密钥完整性
   ↓
3. 调用 LiteSDK.init()
   ↓
4. 显示加载进度
   ↓
5. 连接成功，切换到 idle() 状态
   ↓
6. 显示欢迎消息
```

## 技术实现要点

### 1. 流式响应处理
```javascript
async function streamAIResponse(text) {
  const response = await fetch(modelScopeAPI, { ... });
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let isFirstChunk = true;
  let fullResponse = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        const content = data.choices[0].delta.content;

        if (content) {
          // 流式调用speak
          liteSDK.speak(content, isFirstChunk, false);
          isFirstChunk = false;
          fullResponse += content;

          // 更新UI显示
          updateMessageDisplay(fullResponse);
        }
      }
    }
  }

  // 结束speak
  liteSDK.speak('', false, true);
}
```

### 2. 数字人状态管理
```javascript
const AvatarState = {
  IDLE: 'idle',
  LISTEN: 'listen',
  THINK: 'think',
  SPEAK: 'speak'
};

function changeState(newState) {
  switch (newState) {
    case AvatarState.IDLE:
      liteSDK.idle();
      break;
    case AvatarState.LISTEN:
      liteSDK.listen();
      break;
    case AvatarState.THINK:
      liteSDK.think();
      break;
  }
  updateUI(newState);
}
```

### 3. 错误处理
```javascript
function handleSDKError(message) {
  const errorCode = message.code;

  const errorMap = {
    10001: '容器不存在',
    10002: 'Socket连接错误',
    10003: '会话启动失败',
    10004: '会话停止失败',
    50001: '网络离线',
    50004: '网络断开'
  };

  showError(errorMap[errorCode] || `未知错误: ${errorCode}`);

  // 尝试重连
  if ([50001, 50004].includes(errorCode)) {
    setTimeout(() => reconnect(), 3000);
  }
}
```

## 数据结构

### LocalStorage存储
```javascript
// 密钥配置
{
  xingyun_appId: string,
  xingyun_appSecret: string,
  modelscope_api_key: string
}

// 对话历史（可选）
{
  conversations: [
    {
      timestamp: number,
      userMessage: string,
      aiResponse: string
    }
  ]
}
```

## 安全考虑

1. **密钥存储**: 使用 LocalStorage，需提醒用户在公共设备上使用后清除密钥
2. **HTTPS**: 生产环境必须使用 HTTPS（SDK要求）
3. **输入验证**: 对用户输入进行过滤，防止注入攻击
4. **速率限制**: 添加请求频率限制，避免API滥用

## 性能优化

1. **离线模式**: 长时间无交互时自动切换到离线模式节省积分
2. **资源清理**: 页面卸载时调用 `destroy()` 清理资源
3. **流式处理**: 使用流式响应提升用户体验
4. **状态缓存**: 缓存常用状态减少不必要的API调用

## 测试计划

### 功能测试
- [ ] 密钥配置功能
- [ ] 数字人连接/断开
- [ ] 文字输入交互
- [ ] 流式响应播报
- [ ] 状态切换
- [ ] 错误处理

### 兼容性测试
- [ ] Chrome (推荐)
- [ ] Edge
- [ ] Firefox
- [ ] Safari

### 压力测试
- [ ] 长时间对话
- [ ] 快速连续输入
- [ ] 网络中断恢复

## 部署说明

### 开发环境
```bash
# 使用本地服务器
python -m http.server 8000
# 或
npx serve .
```

### 注意事项
1. SDK仅支持 localhost 或 HTTPS
2. 需要在浏览器控制台查看详细日志
3. 积分消耗建议：调试时使用基础音色

## 后续优化方向

1. **语音识别**: 集成浏览器 Web Speech API 实现语音输入
2. **多轮对话**: 增强对话上下文管理
3. **健康档案**: 用户健康数据记录与分析
4. **多模态**: 支持图片、图表等Widget展示
5. **知识库**: 接入专业医学知识库提升准确度

## 参考资料

- [星云数字人SDK文档](https://xingyun3d.com/developers/52-183)
- [魔搭社区API文档](https://modelscope.cn/docs)
- [黑客松比赛页面](https://pre.xingyun3d.com/hackathon2025/)

## 开发检查清单

- [ ] 创建HTML页面结构
- [ ] 集成星云SDK
- [ ] 实现密钥管理UI
- [ ] 集成魔搭API
- [ ] 实现流式对话逻辑
- [ ] 添加状态管理
- [ ] 实现错误处理
- [ ] 优化UI/UX
- [ ] 测试所有功能
- [ ] 编写README