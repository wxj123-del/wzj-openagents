# 政务大厅智能指引系统 - 开发文档

## 项目概述

### 项目信息
- **项目名称**: 政务大厅智能办事指引系统
- **参赛赛道**: 大屏交互与智能讲解赛道
- **项目方向**: 政务大厅办事指引：精准政策咨询与流程引导
- **开发周期**: 2025.12.22 - 2026.1.25
- **黑客松官网**: https://pre.xingyun3d.com/hackathon2025/

### 核心功能
1. **数字人智能接待**: 通过3D数字人进行迎宾和基础引导
2. **精准政策咨询**: 用户提问,数字人结合AI模型提供精准政策解答
3. **办事流程引导**: 可视化展示各类业务的办理流程和所需材料
4. **业务办理模拟**: 完成一个完整业务办理流程演示
5. **大屏交互界面**: 适配政务大厅大屏显示的交互UI

### 技术栈
- **前端框架**: Vue 3 + TypeScript
- **UI框架**: Element Plus / Ant Design Vue
- **3D数字人**: 魔珐星云 JS SDK
- **AI模型**: 魔搭社区 API (ModelScope)
- **状态管理**: Pinia
- **构建工具**: Vite
- **样式方案**: SCSS + CSS Modules

---

## 密钥信息

### 魔搭社区密钥 (魔塔)
- **Model ID**: ms-6e0d45c0-1a56-4527-8ddc-fd7cb1dd796b
- **APP ID**: 65254e14e816423da6218e47b2003ea8
- **APP Secret**: ba0cb4a582e045d382fd65468937886f

### 魔珐星云密钥
- **App ID**: [用户填写]
- **App Secret**: [用户填写]

> **注意**: 实际使用时,这些密钥将存储在 localStorage 中,用户手动输入或使用测试密钥

---

## 系统架构

### 整体架构图
```
┌─────────────────────────────────────────────────┐
│              政务大厅大屏显示界面                    │
├─────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐            │
│  │  3D数字人区域 │  │   内容展示区  │            │
│  │ (魔珐星云SDK) │  │ (流程/材料/   │            │
│  │              │  │  政策内容)    │            │
│  └──────────────┘  └──────────────┘            │
│  ┌────────────────────────────────┐            │
│  │      对话交互区                 │            │
│  │  (语音输入 + 文字输入)          │            │
│  └────────────────────────────────┘            │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│            前端应用 (Vue 3)                       │
│  - 密钥管理 (LocalStorage)                       │
│  - 数字人控制模块                                │
│  - AI对话模块                                    │
│  - 业务流程引导模块                              │
│  - 大屏UI适配                                    │
└─────────────────────────────────────────────────┘
                      ↕
┌──────────────┐           ┌──────────────┐
│ 魔珐星云API   │           │ 魔搭社区API  │
│ (数字人驱动)  │           │ (AI模型)     │
└──────────────┘           └──────────────┘
```

---

## 功能模块设计

### 1. 密钥管理模块

#### 功能需求
- 支持用户手动输入密钥并存储到 localStorage
- 提供内置测试密钥供开发测试使用
- 密钥加密存储(建议使用 base64 或简单加密)
- 密钥验证与连接测试

#### 存储数据结构
```typescript
interface StoredKeys {
  // 魔珐星云密钥
  xingyunAppId: string;
  xingyunAppSecret: string;

  // 魔搭社区密钥
  modelScopeApiKey: string;

  // 密钥来源标识
  isTestKey?: boolean;
}
```

#### 内置测试密钥策略
- 提供 `VITE_TEST_XINGYUN_APP_ID` 环境变量
- 提供 `VITE_TEST_XINGYUN_APP_SECRET` 环境变量
- 提供 `VITE_TEST_MODELSCOPE_API_KEY` 环境变量(使用文档中提供的魔搭密钥)
- 仅在开发环境可用

#### 页面设计
```
┌─────────────────────────────────────┐
│    密钥配置                          │
├─────────────────────────────────────┤
│                                     │
│  [使用测试密钥] 切换开关             │
│                                     │
│  或手动输入:                         │
│                                     │
│  魔珐星云 AppID: [_________]        │
│  魔珐星云 Secret: [_________]        │
│                                     │
│  魔搭 API Key: [_________]          │
│                                     │
│  [测试连接]  [保存密钥]              │
│                                     │
└─────────────────────────────────────┘
```

---

### 2. 数字人控制模块

#### 核心功能
- 手动连接/断开数字人
- 数字人状态管理(在线/离线/待机/倾听/说话/思考)
- 数字人动作控制(欢迎、引导、告别等KA动作)
- 语音合成与口型同步
- 字幕展示

#### SDK集成要点
```typescript
// 引入SDK
<script src="https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar@latest.js"></script>

// 创建实例
const LiteSDK = new XmovAvatar({
  containerId: '#avatar-container',
  appId: storedKeys.xingyunAppId,
  appSecret: storedKeys.xingyunAppSecret,
  gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',

  // 事件回调
  onMessage(message) {
    console.log('SDK message:', message);
  },

  onStateChange(state: string) {
    // idle | listen | think | speak | offline
    console.log('State changed:', state);
  },

  onVoiceStateChange(status: string) {
    // voice_start | voice_end
    console.log('Voice status:', status);
  }
});
```

#### 数字人状态机
```
离线模式 (offlineMode)
    ↓ [用户点击连接]
在线模式 (onlineMode)
    ↓
待机互动 (interactive_idle)
    ↓ [检测到用户输入]
倾听状态 (listen)
    ↓ [AI处理中]
思考状态 (think)
    ↓ [AI回复生成]
说话状态 (speak)
    ↓ [回答完成]
待机互动 (interactive_idle) 或 倾听 (listen)
```

#### 手动控制按钮
- [连接数字人] / [断开连接]
- [切换在线模式] / [切换离线模式]
- [进入待机]
- [开始倾听]

---

### 3. AI对话模块(魔搭社区集成)

#### 功能需求
- 接入魔搭社区大语言模型
- 实现流式对话响应
- 结合政务知识库提供精准政策咨询
- 支持上下文对话

#### 推荐模型选择
根据魔搭社区,推荐使用以下模型之一:
- **Qwen/Qwen2.5-7B-Instruct**: 通义千问,中文能力强
- **ZhipuAI/glm-4-9b-chat**: 智谱AI,适合对话场景
- **baichuan-inc/Baichuan2-13B-Chat**: 百川,中文优化

#### API调用示例
```typescript
async function callModelScopeAPI(prompt: string, apiKey: string) {
  const response = await fetch('https://api-inference.modelscope.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'Qwen/Qwen2.5-7B-Instruct',
      messages: [
        {
          role: 'system',
          content: '你是政务大厅智能助手,专门解答政务服务相关问题...'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: true  // 启用流式输出
    })
  });

  // 处理流式响应
  const reader = response.body?.getReader();
  // ...流式数据处理
}
```

#### 流式响应与数字人联动
```typescript
// 大模型流式输出 → 数字人流式说话
async function streamResponseToAvatar(text: string) {
  // 1. 切换到思考状态
  LiteSDK.think();

  // 2. 调用AI获取流式响应
  const stream = await callModelScopeAPI(text, apiKey);

  // 3. 切换到说话状态
  let isFirstChunk = true;
  let buffer = '';

  for await (const chunk of stream) {
    buffer += chunk;

    // 积累一定长度后发送给数字人
    if (buffer.length > 20 || isFirstChunk) {
      LiteSDK.speak(buffer, isFirstChunk, false);
      isFirstChunk = false;
      buffer = '';
    }
  }

  // 发送最后一部分
  if (buffer) {
    LiteSDK.speak(buffer, false, true);
  }
}
```

#### 政务知识库设计
```typescript
const governmentKnowledgeBase = {
  // 业务类型
  businessTypes: [
    '身份证办理',
    '户口迁移',
    '社保缴纳',
    '公积金提取',
    '营业执照注册',
    '税务登记',
    // ...
  ],

  // System Prompt
  systemPrompt: `
你是一个专业的政务大厅智能助手,职责是:
1. 准确解答政务政策相关问题
2. 引导用户完成业务办理流程
3. 说明所需材料和办理时间
4. 保持专业、友好的服务态度

请根据用户提问,提供简洁明了的解答。
  `
};
```

---

### 4. 业务流程引导模块

#### 功能需求
- 可视化展示业务办理流程
- 分步骤引导用户完成办理
- 展示所需材料清单
- 预估办理时间

#### 数据结构设计
```typescript
interface BusinessProcess {
  id: string;
  name: string;
  category: string;  // 公安/人社/税务/市场监管等
  description: string;
  estimatedTime: string;  // 如: 3-5个工作日

  // 办理流程步骤
  steps: Array<{
    order: number;
    title: string;
    description: string;
    location?: string;  // 办理窗口/地点
    required: boolean;
  }>;

  // 所需材料
  materials: Array<{
    name: string;
    required: boolean;
    format: string[];  // 原件/复印件/电子版
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
```

#### 示例数据
```typescript
const exampleProcess: BusinessProcess = {
  id: 'id-card-new',
  name: '身份证首次申领',
  category: '公安',
  description: '年满16周岁的中国公民应当自年满十六周岁之日起三个月内,向常住户口所在地的公安机关申请领取居民身份证。',
  estimatedTime: '20个工作日',

  steps: [
    {
      order: 1,
      title: '预约取号',
      description: '通过政务大厅微信公众号或现场取号机预约',
      location: '1号楼自助服务区',
      required: true
    },
    {
      order: 2,
      title: '窗口受理',
      description: '到指定窗口提交申请材料',
      location: '1号楼2层公安窗口',
      required: true
    },
    {
      order: 3,
      title: '信息采集',
      description: '采集指纹信息和人像照片',
      location: '1号楼2层公安窗口',
      required: true
    },
    {
      order: 4,
      title: '缴纳费用',
      description: '首次申领免费,到期换领20元',
      location: '1号楼1层缴费处',
      required: true
    },
    {
      order: 5,
      title: '领取证件',
      description: '可选择自领或邮寄到家',
      location: '1号楼1层发证窗口',
      required: true
    }
  ],

  materials: [
    {
      name: '居民户口簿',
      required: true,
      format: ['原件', '复印件'],
      remark: '需复印户主页和本人页'
    },
    {
      name: '本人到场',
      required: true,
      format: [],
      remark: '必须本人亲自办理'
    }
  ],

  notes: [
    '未满16周岁公民自愿申请居民身份证的,由监护人代为申请',
    '公民在申请领取、换领、补领居民身份证期间,急需使用居民身份证的,可以申请领取临时居民身份证'
  ],

  policies: [
    {
      title: '《中华人民共和国居民身份证法》',
      content: '第二条 居住在中华人民共和国境内的中国公民,在申请领取、换领、补领居民身份证期间,急需使用居民身份证的,可以申请领取临时居民身份证。'
    }
  ]
};
```

#### UI展示设计
```
┌────────────────────────────────────────┐
│  身份证首次申领                          │
│  预计办理时间: 20个工作日                │
├────────────────────────────────────────┤
│                                         │
│  【办理流程】                            │
│  ┌─────────────────────────────────┐  │
│  │ ① 预约取号 → ② 窗口受理          │  │
│  │    ↓              ↓              │  │
│  │ ③ 信息采集 → ④ 缴纳费用          │  │
│  │    ↓                              │  │
│  │ ⑤ 领取证件                       │  │
│  └─────────────────────────────────┘  │
│                                         │
│  【所需材料】                            │
│  ✓ 居民户口簿 (原件+复印件)             │
│  ✓ 本人到场                             │
│                                         │
│  【注意事项】                            │
│  • 未满16周岁需监护人代为申请            │
│  • 可申请临时居民身份证                 │
│                                         │
│  [开始办理]  [查看政策详情]              │
└────────────────────────────────────────┘
```

---

### 5. 大屏交互界面

#### 屏幕布局设计
```
┌──────────────────────────────────────────────────┐
│  VON政务大厅智能指引系统            [设置] [退出] │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────┐  ┌─────────────────────────┐   │
│  │            │  │  热门业务分类            │   │
│  │            │  │  ┌───┐ ┌───┐ ┌───┐       │   │
│  │            │  │  │身份证│ │社保│ │公积金│    │   │
│  │   3D       │  │  └───┘ └───┘ └───┘       │   │
│  │   数字人    │  │  ┌───┐ ┌───┐ ┌───┐       │   │
│  │            │  │  │户籍│ │税务│ │工商│       │   │
│  │            │  │  └───┘ └───┘ └───┘       │   │
│  │            │  │                         │   │
│  │            │  │  [查看全部业务 →]        │   │
│  └────────────┘  └─────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  智能问答                                 │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │  您好!我是政务智能助手,请问有什么可以帮您? │  │  │
│  │  │                                    │  │  │
│  │  │  历史对话记录...                    │  │  │
│  │  └────────────────────────────────────┘  │  │
│  │  ┌─────────────────┐  ┌──────────┐     │  │
│  │  │ [输入您的问题...] │  │ [🎤语音] │     │  │
│  │  └─────────────────┘  └──────────┘     │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

#### 交互特点
- **大字体设计**: 适配大屏显示,字体不小于24px
- **高对比度**: 确保在各种光线下清晰可见
- **触控优化**: 按钮尺寸不小于60x60px,方便点击
- **响应式布局**: 适配不同尺寸大屏(1920x1080, 3840x2160)
- **快捷入口**: 常用业务一键直达

#### 颜色方案
```scss
// 政务蓝色主题
$primary-color: #1890ff;        // 主色调
$secondary-color: #0050b3;      // 深蓝色
$success-color: #52c41a;        // 成功提示
$warning-color: #faad14;        // 警告提示
$info-color: #1890ff;           // 信息提示
$text-primary: #262626;         // 主要文字
$text-secondary: #595959;       // 次要文字
$background-color: #f0f2f5;     // 背景色
$card-background: #ffffff;      // 卡片背景
```

---

## 开发计划

### 阶段一: 项目搭建(1-2天)
- [ ] 初始化 Vue 3 + Vite 项目
- [ ] 配置 TypeScript
- [ ] 安装依赖(Element Plus, Pinia等)
- [ ] 搭建基础路由结构
- [ ] 创建基础布局组件

### 阶段二: 密钥管理模块(1天)
- [ ] 创建密钥配置页面
- [ ] 实现 localStorage 存储逻辑
- [ ] 添加测试密钥功能
- [ ] 实现密钥验证与测试连接

### 阶段三: 数字人集成(2-3天)
- [ ] 引入魔珐星云SDK
- [ ] 实现数字人初始化
- [ ] 实现连接/断开控制
- [ ] 实现状态管理
- [ ] 实现基础speak功能
- [ ] 添加调试信息展示

### 阶段四: AI对话模块(2-3天)
- [ ] 接入魔搭社区API
- [ ] 实现流式响应处理
- [ ] 实现数字人流式说话
- [ ] 构建政务知识库Prompt
- [ ] 实现对话上下文管理
- [ ] 添加对话历史记录

### 阶段五: 业务流程模块(2-3天)
- [ ] 设计业务数据结构
- [ ] 创建示例业务数据(5-10个常见业务)
- [ ] 实现业务分类展示
- [ ] 实现业务详情页
- [ ] 实现流程可视化
- [ ] 实现材料清单展示

### 阶段六: 大屏UI优化(2天)
- [ ] 实现响应式布局
- [ ] 优化字体与间距
- [ ] 适配大屏显示
- [ ] 添加动画效果
- [ ] 优化交互体验

### 阶段七: 集成测试(1-2天)
- [ ] 端到端功能测试
- [ ] 数字人与AI联动测试
- [ ] 异常处理测试
- [ ] 性能优化

### 阶段八: Demo制作(1-2天)
- [ ] 录制操作流程视频
- [ ] 准备演示脚本
- [ ] 制作PPT展示材料

---

## 技术要点

### 1. 数字人流式说话实现
```typescript
// 确保流式输出时数字人说话不中断
class AvatarStreamManager {
  private buffer: string = '';
  private isSpeaking: boolean = false;
  private isFirstChunk: boolean = true;

  async processStream(stream: ReadableStream) {
    const reader = stream.getReader();
    let decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        this.buffer += this.extractContent(chunk); // 提取实际内容

        // 达到阈值时发送给数字人
        if (this.buffer.length > 30) {
          await this.sendToAvatar();
        }
      }

      // 发送剩余内容
      if (this.buffer.length > 0) {
        await this.sendToAvatar(true); // is_end = true
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async sendToAvatar(isEnd: boolean = false) {
    if (this.buffer.length === 0) return;

    LiteSDK.speak(
      this.buffer,
      this.isFirstChunk,
      isEnd
    );

    this.buffer = '';
    this.isFirstChunk = false;

    // 等待数字人消耗一部分内容
    await this.delay(1000);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractContent(chunk: string): string {
    // 解析 SSE 格式数据
    // 提取 delta.content
    // ...
  }
}
```

### 2. 状态机管理
```typescript
import { defineStore } from 'pinia';

export const useAvatarStore = defineStore('avatar', {
  state: () => ({
    isConnected: false,
    currentStatus: 'offline', // offline | online | close
    currentState: 'idle',     // idle | interactive_idle | listen | think | speak
    isVoicePlaying: false,
    sdkInstance: null as any,
  }),

  actions: {
    async connect() {
      // 初始化SDK
      // 连接服务
    },

    async disconnect() {
      // 销毁实例
    },

    async setState(state: string) {
      this.currentState = state;
      // 调用SDK方法
      switch(state) {
        case 'idle':
          this.sdkInstance?.idle();
          break;
        case 'listen':
          this.sdkInstance?.listen();
          break;
        case 'think':
          this.sdkInstance?.think();
          break;
        case 'speak':
          // 由speak方法自动处理
          break;
        case 'offline':
          this.sdkInstance?.offlineMode();
          break;
        case 'online':
          this.sdkInstance?.onlineMode();
          break;
      }
    }
  }
});
```

### 3. localStorage密钥存储
```typescript
const KEY_STORAGE_KEY = 'gov_hall_keys';

export const useKeyManager = () => {
  const savedKeys = ref<StoredKeys | null>(null);

  // 加载密钥
  const loadKeys = () => {
    const stored = localStorage.getItem(KEY_STORAGE_KEY);
    if (stored) {
      try {
        // 简单的base64解码
        const decoded = atob(stored);
        savedKeys.value = JSON.parse(decoded);
      } catch (e) {
        console.error('Failed to load keys:', e);
      }
    }
  };

  // 保存密钥
  const saveKeys = (keys: StoredKeys) => {
    const encoded = btoa(JSON.stringify(keys));
    localStorage.setItem(KEY_STORAGE_KEY, encoded);
    savedKeys.value = keys;
  };

  // 清除密钥
  const clearKeys = () => {
    localStorage.removeItem(KEY_STORAGE_KEY);
    savedKeys.value = null;
  };

  // 获取测试密钥
  const getTestKeys = (): StoredKeys => {
    return {
      xingyunAppId: import.meta.env.VITE_TEST_XINGYUN_APP_ID || '',
      xingyunAppSecret: import.meta.env.VITE_TEST_XINGYUN_APP_SECRET || '',
      modelScopeApiKey: import.meta.env.VITE_TEST_MODELSCOPE_API_KEY || '',
      isTestKey: true
    };
  };

  return {
    savedKeys,
    loadKeys,
    saveKeys,
    clearKeys,
    getTestKeys
  };
};
```

### 4. 大屏适配CSS
```scss
// 响应式断点
$screen-lg: 1920px;
$screen-2k: 2560px;
$screen-4k: 3840px;

@mixin large-screen-adapter {
  // 根据屏幕尺寸调整
  @media (min-width: $screen-2k) {
    font-size: 18px;
  }

  @media (min-width: $screen-4k) {
    font-size: 24px;
  }
}

.container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  @include large-screen-adapter;
}

// 按钮触控优化
.touch-button {
  min-width: 120px;
  min-height: 60px;
  font-size: 24px;
  padding: 15px 30px;
}
```

---

## 环境变量配置

```bash
# .env.development
VITE_TEST_XINGYUN_APP_ID=your_test_app_id
VITE_TEST_XINGYUN_APP_SECRET=your_test_app_secret
VITE_TEST_MODELSCOPE_API_KEY=65254e14e816423da6218e47b2003ea8

# .env.production
# 生产环境不提供测试密钥
```

---

## 项目结构

```
vvv/
├── public/
│   └── ...
├── src/
│   ├── assets/
│   │   ├── styles/
│   │   │   ├── variables.scss       # 全局样式变量
│   │   │   ├── mixins.scss          # 样式混入
│   │   │   └── global.scss          # 全局样式
│   │   └── images/
│   ├── components/
│   │   ├── Avatar/
│   │   │   ├── AvatarContainer.vue  # 数字人容器
│   │   │   └── AvatarControls.vue   # 数字人控制面板
│   │   ├── Chat/
│   │   │   ├── ChatBox.vue          # 对话框
│   │   │   ├── ChatInput.vue        # 输入框
│   │   │   └── ChatHistory.vue      # 对话历史
│   │   ├── Business/
│   │   │   ├── BusinessCard.vue     # 业务卡片
│   │   │   ├── BusinessDetail.vue   # 业务详情
│   │   │   ├── ProcessFlow.vue      # 流程图
│   │   │   └── MaterialList.vue     # 材料清单
│   │   ├── Layout/
│   │   │   ├── Header.vue           # 顶部导航
│   │   │   ├── Sidebar.vue          # 侧边栏
│   │   │   └── MainLayout.vue       # 主布局
│   │   └── Common/
│   │       ├── ConfigModal.vue      # 密钥配置弹窗
│   │       └── StatusDisplay.vue    # 状态显示
│   ├── stores/
│   │   ├── avatar.ts                # 数字人状态管理
│   │   ├── chat.ts                  # 对话状态管理
│   │   └── config.ts                # 配置状态管理
│   ├── services/
│   │   ├── avatarService.ts         # 数字人SDK封装
│   │   ├── modelScopeService.ts     # 魔搭API封装
│   │   └── keyManager.ts            # 密钥管理
│   ├── data/
│   │   └── businessData.ts          # 业务数据
│   ├── utils/
│   │   ├── storage.ts               # localStorage工具
│   │   └── streamParser.ts          # 流式数据解析
│   ├── views/
│   │   ├── Home.vue                 # 主页
│   │   ├── BusinessList.vue         # 业务列表
│   │   ├── BusinessDetail.vue       # 业务详情页
│   │   └── Settings.vue             # 设置页
│   ├── router/
│   │   └── index.ts                 # 路由配置
│   ├── App.vue
│   └── main.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Demo演示流程设计

### 场景一: 首次进入
1. 打开系统,显示密钥配置界面
2. 点击"使用测试密钥",自动填充测试密钥
3. 点击"连接数字人",数字人初始化并显示
4. 数字人播放欢迎动作:"欢迎使用xx市政务大厅智能指引系统"
5. 进入主界面

### 场景二: 业务咨询
1. 用户点击热门业务中的"身份证办理"
2. 数字人:"身份证办理包括首次申领、到期换领、丢失补领等业务,请问您需要办理哪种?"
3. 用户语音/文字输入:"首次申领"
4. 屏幕显示身份证首次申领的办理流程
5. 数字人逐条讲解办理步骤和所需材料

### 场景三: 政策问答
1. 用户提问:"户籍迁移需要什么条件?"
2. 数字人切换到思考状态
3. AI后台检索政务知识库
4. 数字人流式回答:"户籍迁移需要满足以下条件..."
5. 屏幕同步显示文字和相关信息

### 场景四: 流程引导
1. 用户选择"开始办理"某个业务
2. 数字人:"好的,我来引导您完成办理,请先到1号楼自助服务区取号"
3. 屏幕高亮显示当前步骤
4. 用户点击"下一步",继续引导
5. 完成整个流程演示

---

## 评分要点对照

### 商业潜力 (50%)
- ✓ 解决真实痛点:政务大厅排队咨询、流程不清晰
- ✓ 市场需求:各级政务大厅均有需求
- ✓ 可扩展性:支持多种业务类型,易扩展
- ✓ 技术可行性:基于成熟SDK和AI模型

### 产品体验设计 (30%)
- ✓ 大屏UI友好设计
- ✓ 数字人自然交互
- ✓ 流程可视化清晰
- ✓ 多模态交互(语音+触控)

### 技术完成度 (20%)
- ✓ 数字人SDK完整集成
- ✓ AI流式对话实现
- ✓ 状态管理完善
- ✓ 代码结构清晰

---

## 注意事项

1. **浏览器兼容性**:
   - Chrome 90+
   - Edge 90+
   - Safari 14+
   - 微信浏览器需要特殊处理

2. **HTTPS要求**:
   - SDK某些功能仅支持 localhost 或 HTTPS
   - 部署时需要配置SSL证书

3. **积分消耗**:
   - 开发时使用离线模式节省积分
   - 避免频繁连接/断开
   - 优先使用基础音色测试

4. **错误处理**:
   - 网络断开时的降级方案
   - API调用失败的友好提示
   - 数字人连接失败的错误提示

5. **性能优化**:
   - 懒加载业务数据
   - 虚拟滚动长列表
   - 防抖/节流用户输入

---

## 参考资料

- 魔珐星云官网: https://xingyun3d.com/
- JS SDK文档: https://xingyun3d.com/developers/52-183
- 魔搭社区: https://modelscope.cn/
- 黑客松主页: https://pre.xingyun3d.com/hackathon2025/
- 魔搭API文档: https://help.modelscope.cn/

---
