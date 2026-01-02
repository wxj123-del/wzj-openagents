# AI占卜师 - 开发文档

## 📋 项目概述

**项目名称**: AI占卜师
**参赛赛道**: AI创意/灵感交互赛道
**开发周期**: 2025.12.22 - 2026.1.25
**项目类型**: C端娱乐应用

### 项目简介
基于魔珐星云3D数字人和魔搭社区AI模型，打造一个神秘学风格的AI占卜师应用。通过实时对话交互，为用户提供塔罗牌解读、星座运势、心理按摩等沉浸式体验。

### 核心价值
- **新颖体验**: 结合3D数字人形象和AI智能，打造神秘的占卜场景
- **情感陪伴**: 提供心理按摩和情感支持
- **趣味互动**: 多种占卜方式，支持实时对话和个性化解读

---

## 🎯 功能设计

### 1. 核心功能模块

#### 1.1 占卜服务
- **塔罗牌占卜**
  - 单张/三张牌阵选择
  - 正位/逆位解读
  - 实时牌面展示
  - AI个性化解读

- **星座运势**
  - 今日/本周/本月运势
  - 爱情/事业/财运分析
  - 幸运数字/颜色/方位

- **心理测试**
  - 性格测试
  - 情感状态分析
  - 职业倾向评估

#### 1.2 数字人交互
- **实时对话**
  - 流式语音对话
  - 情感化回应
  - 上下文记忆

- **行为控制**
  - Idle状态(待机动画)
  - Listen状态(倾听状态)
  - Think状态(思考状态)
  - Speak状态(说话状态)

- **表情动作**
  - KA动作指令(神秘手势)
  - 情感表达
  - 牌面展示动作

#### 1.3 用户系统
- **密钥管理**
  - localStorage存储API密钥
  - 内置测试密钥
  - 手动输入密钥界面

- **连接控制**
  - 手动连接数字人
  - 手动断开连接
  - 连接状态显示

- **历史记录**
  - 占卜历史查看
  - 收藏解读结果

---

## 🛠 技术栈

### 前端框架
- **Vue 3** + **Vite**: 现代化前端开发框架
- **TypeScript**: 类型安全
- **Pinia**: 状态管理

### UI框架
- **TailwindCSS**: 快速样式开发
- **Animate.css**: 动画效果

### 核心SDK
- **魔珐星云JS SDK**: 3D数字人驱动
- **魔搭社区API**: AI模型调用

### 工具库
- **Axios**: HTTP请求
- **Day.js**: 时间处理
- **Crypto-js**: 加密解密

---

## 🏗 架构设计

### 项目结构
```
AI_Fortune_Teller/
├── public/
│   └── index.html
├── src/
│   ├── assets/           # 静态资源
│   ├── components/       # 组件
│   │   ├── Avatar/       # 数字人组件
│   │   │   ├── AvatarContainer.vue
│   │   │   ├── AvatarControls.vue
│   │   │   └── AvatarSDK.js
│   │   ├── Fortune/      # 占卜组件
│   │   │   ├── TarotReading.vue
│   │   │   ├── Horoscope.vue
│   │   │   └── PsychologyTest.vue
│   │   ├── Common/       # 公共组件
│   │   │   ├── KeyInput.vue
│   │   │   ├── ChatBox.vue
│   │   │   └── HistoryList.vue
│   │   └── Layout/
│   │       ├── Header.vue
│   │       └── Footer.vue
│   ├── views/            # 页面
│   │   ├── Home.vue
│   │   ├── Tarot.vue
│   │   ├── Horoscope.vue
│   │   ├── Profile.vue
│   │   └── History.vue
│   ├── stores/           # Pinia状态管理
│   │   ├── avatar.js     # 数字人状态
│   │   ├── fortune.js    # 占卜数据
│   │   └── user.js       # 用户配置
│   ├── services/         # API服务
│   │   ├── avatarAPI.js  # 数字人API
│   │   ├── modelAPI.js   # 魔搭模型API
│   │   └── fortuneAPI.js # 占卜服务API
│   ├── utils/            # 工具函数
│   │   ├── storage.js    # localStorage封装
│   │   ├── crypto.js     # 加密工具
│   │   └── constants.js  # 常量定义
│   ├── router/           # 路由配置
│   │   └── index.js
│   ├── App.vue
│   └── main.js
├── package.json
├── vite.config.js
└── README.md
```

### 数据流设计

#### 1. 密钥管理流程
```
用户输入密钥
    ↓
加密存储到localStorage
    ↓
应用启动时读取
    ↓
解密后使用
```

#### 2. 占卜流程
```
用户选择占卜类型
    ↓
前端收集用户信息
    ↓
调用魔搭AI模型生成解读
    ↓
流式返回AI响应
    ↓
数字人流式播报(使用SSML)
```

#### 3. 数字人交互流程
```
用户点击连接
    ↓
初始化SDK实例
    ↓
加载资源(init)
    ↓
切换到Idle状态
    ↓
用户开始占卜
    ↓
切换到Listen状态
    ↓
AI思考中(Think状态)
    ↓
流式播报结果(Speak状态)
    ↓
返回Interactive_Idle状态
```

---

## 🔌 API集成方案

### 1. 魔珐星云数字人SDK

#### 引入SDK
```html
<script src="https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar@latest.js"></script>
```

#### 初始化配置
```javascript
const avatarSDK = new XmovAvatar({
  containerId: '#avatar-container',
  appId: localStorage.getItem('xingyun_appId'),
  appSecret: localStorage.getItem('xingyun_appSecret'),
  gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',

  // 回调函数
  onMessage(message) {
    console.log('SDK消息:', message);
  },
  onStateChange(state) {
    console.log('状态变化:', state);
  },
  onVoiceStateChange(status) {
    console.log('语音状态:', status);
  }
});
```

#### 核心方法调用
```javascript
// 初始化
await avatarSDK.init({
  onDownloadProgress: (progress) => {
    console.log('加载进度:', progress);
  }
});

// 状态控制
avatarSDK.idle();              // 待机
avatarSDK.listen();            // 倾听
avatarSDK.think();             // 思考
avatarSDK.interactiveidle();   // 互动待机

// 说话(流式)
avatarSDK.speak("欢迎来到AI占卜师", true, true);

// 销毁
avatarSDK.destroy();
```

### 2. 魔搭社区AI模型

#### API调用
```javascript
import axios from 'axios';

const MODEL_API = 'https://api.modelscope.cn/v1/chat/completions';

async function callModel(prompt, streamCallback) {
  const response = await axios.post(MODEL_API, {
    model: 'Qwen/Qwen2.5-7B-Instruct', // 或其他模型
    messages: [
      {
        role: 'system',
        content: '你是一位神秘的占卜师,擅长塔罗牌解读和星座分析...'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    stream: true
  }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('modelscope_api_key')}`,
      'Content-Type': 'application/json'
    },
    responseType: 'stream'
  });

  // 处理流式响应
  return streamCallback(response);
}
```

---

## 🎨 UI/UX设计

### 设计风格
- **主题**: 神秘学风格
- **配色**:
  - 主色: 深紫色 (#6B46C1)
  - 辅色: 金色 (#F6E05E)
  - 背景: 深蓝渐变
- **元素**: 星星、月亮、塔罗牌图案

### 页面布局

#### 1. 首页
- 顶部: 标题 + 连接状态
- 中间: 3D数字人展示区
- 底部: 功能导航(塔罗/星座/测试)

#### 2. 塔罗占卜页
- 左侧: 牌面选择区
- 中间: 数字人对话区
- 右侧: 解读结果展示

#### 3. 密钥设置页
- API密钥输入框
- 数字人密钥输入框
- 测试连接按钮
- 内置密钥切换

---

## 📦 开发计划

### Phase 1: 基础框架搭建 (1-2天)
- [x] 初始化Vue3+Vite项目
- [ ] 配置TailwindCSS
- [ ] 创建基础路由
- [ ] 搭建页面布局

### Phase 2: 数字人SDK集成 (2-3天)
- [ ] 引入星云SDK
- [ ] 创建Avatar组件
- [ ] 实现连接/断开功能
- [ ] 实现状态控制(Idle/Listen/Think/Speak)
- [ ] 测试数字人流式对话

### Phase 3: 魔搭AI集成 (2-3天)
- [ ] 封装魔搭API调用
- [ ] 实现流式响应处理
- [ ] 创建Prompt模板
- [ ] 测试AI模型效果

### Phase 4: 占卜功能开发 (3-4天)
- [ ] 塔罗牌数据准备
- [ ] 塔罗占卜功能
- [ ] 星座运势功能
- [ ] 心理测试功能
- [ ] 历史记录功能

### Phase 5: 用户系统 (2天)
- [ ] 密钥管理页面
- [ ] localStorage加密存储
- [ ] 内置测试密钥
- [ ] 连接控制逻辑

### Phase 6: UI优化与交互 (2-3天)
- [ ] 神秘学UI设计
- [ ] 动画效果添加
- [ ] 响应式布局
- [ ] 加载状态优化

### Phase 7: 测试与优化 (2-3天)
- [ ] 功能测试
- [ ] 性能优化
- [ ] 错误处理
- [ ] Demo视频录制

---

## 🔐 安全与配置

### 密钥存储
```javascript
// 加密存储
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'ai-fortune-teller-2025';

export function saveKeys(keys) {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(keys),
    SECRET_KEY
  ).toString();
  localStorage.setItem('api_keys', encrypted);
}

export function loadKeys() {
  const encrypted = localStorage.getItem('api_keys');
  if (!encrypted) return null;

  const decrypted = CryptoJS.AES.decrypt(
    encrypted,
    SECRET_KEY
  ).toString(CryptoJS.enc.Utf8);

  return JSON.parse(decrypted);
}
```

### 内置测试密钥
```javascript
export const TEST_KEYS = {
  xingyun_appId: '65254e14e816423da6218e47b2003ea8',
  xingyun_appSecret: 'ba0cb4a582e045d382fd65468937886f',
  modelscope_api_key: 'ms-6e0d45c0-1a56-4527-8ddc-fd7cb1dd796b'
};
```

---

## 📝 注意事项

### 1. SDK使用限制
- 必须使用https或localhost
- 避免频繁销毁重建实例
- 流式调用时注意控制速度
- 调试时使用基础音色节省积分

### 2. AI模型选择
- 建议使用Qwen2.5-7B-Instruct
- 支持流式输出
- 成本与效果平衡

### 3. 性能优化
- 数字人资源懒加载
- 对话历史分页加载
- 图片资源CDN加速

### 4. 用户体验
- 首次加载显示进度
- 网络错误友好提示
- 支持中途中断占卜

---

## 🎯 评审标准对照

### 商业潜力 (50%)
- ✅ C端娱乐市场定位明确
- ✅ 多样化占卜服务可扩展性
- ✅ 付费解锁高级解读模式
- ✅ 社交分享功能增加传播

### 产品体验设计 (30%)
- ✅ 神秘学沉浸式UI设计
- ✅ 流畅的数字人交互体验
- ✅ 直观的操作流程
- ✅ 情感化对话设计

### 技术完成度 (20%)
- ✅ 星云SDK深度应用
- ✅ 流式AI对话实现
- ✅ 完整的功能模块
- ✅ 稳定的错误处理

---

## 📚 参考资料

- [魔珐星云官网](https://xingyun3d.com)
- [具身驱动SDK文档](https://xingyun3d.com/developers/52-183)
- [魔搭社区API文档](https://modelscope.cn/docs)
- [Vue3官方文档](https://cn.vuejs.org)
- [TailwindCSS文档](https://tailwindcss.com)

---

## 🎬 Demo视频规划

### 视频结构 (不超过5分钟)
1. **开场** (30秒)
   - 项目介绍
   - 应用场景展示

2. **功能演示** (3分钟)
   - 塔罗牌占卜完整流程
   - 星座运势查询
   - 数字人交互对话
   - 密钥配置过程

3. **技术亮点** (1分钟)
   - 流式AI对话
   - 数字人状态控制
   - 神秘学UI设计

4. **结尾** (30秒)
   - 商业价值总结
   - 未来规划

---

**文档版本**: v1.0
**创建日期**: 2026-01-02
**最后更新**: 2026-01-02
