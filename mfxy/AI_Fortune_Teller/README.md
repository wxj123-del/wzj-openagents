# AI占卜师

> 基于魔珐星云3D数字人和魔搭社区AI模型的神秘占卜应用

## 项目简介

AI占卜师是为魔珐星云黑客松（AI创意/灵感交互赛道）开发的项目，通过3D数字人结合AI模型，为用户提供塔罗牌解读、星座运势等神秘学风格的占卜体验。

## 技术栈

- **前端框架**: Vue 3 + Vite + TypeScript
- **状态管理**: Pinia
- **样式框架**: TailwindCSS
- **核心SDK**: 魔珐星云JS SDK + 魔搭社区AI API
- **工具库**: Axios, Crypto-js, Day.js

## 功能特性

### 1. 数字人交互
- ✅ 实时3D数字人展示
- ✅ 手动连接/断开控制
- ✅ 多状态切换（待机/倾听/思考/说话）
- ✅ 流式语音播报

### 2. 占卜服务
- ✅ 塔罗牌占卜（单张/三张牌阵）
- ✅ 星座运势（今日/本周/本月）
- ✅ AI流式解读
- ✅ 历史记录保存

### 3. 密钥管理
- ✅ localStorage加密存储
- ✅ 内置测试密钥
- ✅ 自定义密钥配置
- ✅ 安全加密传输

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

## 使用指南

### 1. 配置密钥

#### 方式一：使用内置测试密钥
1. 进入"设置"页面
2. 点击"使用内置测试密钥"按钮
3. 密钥自动配置完成

#### 方式二：使用自定义密钥
1. 进入"设置"页面
2. 填入以下密钥：
   - 魔珐星云 App ID
   - 魔珐星云 App Secret
   - 魔搭社区 API Key
3. 点击"保存密钥"

### 2. 连接数字人
1. 在首页点击"连接数字人"按钮
2. 等待SDK加载完成（首次可能需要较长时间）
3. 连接成功后可看到数字人进入待机状态

### 3. 开始占卜
- **塔罗占卜**: 输入问题，选择牌阵，点击抽牌
- **星座运势**: 选择星座和时间范围，点击查询

### 4. 查看历史
- 进入"历史记录"页面查看所有占卜记录
- 支持清空历史记录

## 项目结构

```
AI_Fortune_Teller/
├── public/
├── src/
│   ├── assets/           # 静态资源
│   ├── components/       # 组件
│   │   ├── Avatar/       # 数字人组件
│   │   ├── Common/       # 公共组件
│   │   └── Layout/       # 布局组件
│   ├── views/            # 页面
│   ├── stores/           # Pinia状态管理
│   ├── services/         # API服务
│   ├── utils/            # 工具函数
│   ├── router/           # 路由配置
│   └── styles/           # 样式文件
├── package.json
├── vite.config.js
└── README.md
```

## 核心功能实现

### 数字人SDK集成

```typescript
// 动态加载SDK
import { loadAvatarSDK } from '@/services/avatarAPI'

await loadAvatarSDK()

// 创建实例
avatarStore.createSDK('avatar-container')

// 初始化
await avatarStore.initSDK()

// 状态控制
avatarStore.setState('idle')  // 待机
avatarStore.setState('listen')  // 倾听
avatarStore.setState('think')  // 思考

// 说话
avatarStore.speak('欢迎来到AI占卜师', true, true)
```

### AI流式对话

```typescript
import { callModelStream } from '@/services/modelAPI'

await callModelStream(
  [{ role: 'user', content: prompt }],
  (chunk) => {
    // 处理每个文本块
    console.log(chunk)
  },
  () => {
    // 完成
    console.log('完成')
  },
  (error) => {
    // 错误处理
    console.error(error)
  },
  apiKey
)
```

## 开发文档

详细开发文档请查看 [claude.md](./claude.md)

## 注意事项

1. **HTTPS要求**: 星云SDK必须在HTTPS或localhost环境下运行
2. **首次加载**: 首次连接数字人需要下载资源，请耐心等待
3. **API密钥**: 请妥善保管您的API密钥，不要泄露
4. **积分消耗**: 调试时建议使用基础音色节省积分
5. **网络要求**: 需要稳定的网络连接

## 黑客松信息

- **赛道**: AI创意/灵感交互赛道
- **方向**: AI占卜师
- **时间**: 2025.12.22 - 2026.1.25
- **官网**: [魔珐星云](https://xingyun3d.com)

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎反馈。

---

**让每一行代码，都驱动一个鲜活的数字生命。**
