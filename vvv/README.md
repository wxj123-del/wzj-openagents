# 政务大厅智能指引系统

## 项目简介

这是一个基于 Vue 3 + TypeScript + Element Plus 开发的政务大厅智能指引系统,集成了魔珐星云3D数字人和魔搭社区AI模型,为大屏交互场景提供智能政务咨询服务。

## 功能特性

- 🤖 **3D数字人交互**: 集成魔珐星云SDK,实现实时语音对话
- 🧠 **AI智能问答**: 接入魔搭社区大语言模型,提供精准政策咨询
- 📋 **业务流程引导**: 可视化展示办理流程和所需材料
- 🖥️ **大屏适配**: 专为政务大厅大屏优化,支持触控交互
- 🔐 **密钥管理**: 支持本地存储和测试密钥

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: SCSS
- **3D数字人**: 魔珐星云 JS SDK
- **AI模型**: 魔搭社区 (ModelScope)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.env.development` 文件,填入您的密钥:

```env
VITE_TEST_XINGYUN_APP_ID=your_xingyun_app_id
VITE_TEST_XINGYUN_APP_SECRET=your_xingyun_app_secret
VITE_TEST_MODELSCOPE_API_KEY=your_modelscope_api_key
```

> 获取密钥:
> - 魔珐星云: https://xingyun3d.com
> - 魔搭社区: https://modelscope.cn

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 即可查看应用。

### 4. 构建生产版本

```bash
npm run build
```

## 项目结构

```
vvv/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 资源文件
│   │   └── styles/        # 全局样式
│   ├── components/        # 公共组件
│   ├── data/              # 业务数据
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia状态管理
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── index.html             # HTML模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
└── vite.config.ts         # Vite配置
```

## 使用说明

### 首次使用

1. 打开应用后,点击右上角"设置"按钮
2. 在设置页面选择"使用测试密钥"或手动输入密钥
3. 点击"连接数字人"按钮连接3D数字人
4. 连接成功后,数字人会播放欢迎动画

### 业务咨询

- 点击首页的业务卡片查看详情
- 在聊天框输入问题进行咨询
- 数字人将结合AI模型为您提供解答

### 流程引导

1. 在业务详情页点击"开始办理"
2. 数字人将逐步引导您完成办理流程
3. 屏幕会高亮显示当前步骤

## 参赛信息

- **黑客松**: 魔珐星云具身智能黑客松 2025
- **赛道**: 大屏交互与智能讲解赛道
- **方向**: 政务大厅办事指引:精准政策咨询与流程引导

## 开发团队

本项目为黑客松参赛作品

## 许可证

MIT License
