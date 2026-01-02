# VON健康助手

> 星云黑客松 2025 - 企业级 AI 服务专家赛道

## 项目简介

VON健康助手是一个基于星云3D数字人和魔搭社区AI模型的智能健康咨询系统。通过实时语音交互，为用户提供专业的健康建议和医疗知识科普服务。

## 功能特点

- 🎭 **3D数字人交互**: 基于魔珐星云具身驱动SDK，实现逼真的数字人表情和动作
- 🤖 **AI智能对话**: 接入魔搭社区大模型，提供专业的健康咨询服务
- 💬 **流式响应**: 实时流式输出，自然的对话体验
- 🎯 **状态管理**: 智能管理数字人状态（待机/倾听/思考/说话）
- 🔒 **密钥管理**: 本地存储密钥，保护隐私安全
- 🎨 **精美UI**: 现代化渐变设计，流畅的动画效果

## 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **数字人SDK**: 魔珐星云具身驱动SDK (JS版本)
- **AI模型**: 魔搭社区 (ModelScope) API
- **数据存储**: LocalStorage

## 快速开始

### 1. 环境要求

- 现代浏览器（Chrome、Edge、Firefox、Safari）
- 本地开发服务器（SDK要求localhost或HTTPS）

### 2. 安装依赖

无需安装依赖，直接使用即可！

### 3. 启动项目

```bash
# 使用Python启动本地服务器
python -m http.server 8000

# 或使用Node.js
npx serve .

# 或使用PHP
php -S localhost:8000
```

### 4. 访问应用

打开浏览器访问: `http://localhost:8000`

## 使用说明

### 首次使用

1. **配置密钥**
   - 点击页面顶部的"⚙️ 密钥配置"按钮
   - 点击"🎯 使用内置测试密钥"快速开始
   - 或手动填入您自己的密钥信息

2. **连接数字人**
   - 点击"🔌 连接"按钮
   - 等待数字人资源加载（首次可能需要较长时间）
   - 连接成功后，数字人将进入待机状态

3. **开始对话**
   - 在输入框中输入您的健康问题
   - 点击"发送"或按Enter键
   - 数字人将思考并语音回答您的问题

### 内置测试密钥

项目已提供测试密钥供快速体验：

```javascript
星云 App ID: 65254e14e816423da6218e47b2003ea8
星云 App Secret: ba0cb4a582e045d382fd65468937886f
魔搭 API Key: ms-6e0d45c0-1a56-4527-8ddc-fd7cb1dd796b
```

### 主要功能

- **密钥配置**: 管理星云数字人和魔搭AI的密钥
- **连接/断开**: 控制数字人的连接状态
- **清空历史**: 清除所有对话记录
- **实时对话**: 与数字人进行健康咨询

## 项目结构

```
Health_Assistant/
├── index.html          # 主页面（包含所有功能）
├── claude.md          # 开发文档
└── README.md          # 项目说明
```

## 核心功能实现

### 1. 数字人SDK集成

```javascript
const liteSDK = new XmovAvatar({
    containerId: '#avatar-container',
    appId: localStorage.getItem('xingyun_appId'),
    appSecret: localStorage.getItem('xingyun_appSecret'),
    gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',
    onMessage: (message) => console.log('SDK message:', message),
    onStateChange: (state) => console.log('State Change:', state),
    onVoiceStateChange: (status) => console.log('Voice Status:', status),
    enableLogger: true
});
```

### 2. AI流式对话

```javascript
// 启用流式输出
const response = await fetch('https://api-inference.modelscope.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
        model: 'qwen/Qwen2.5-7B-Instruct',
        messages: messages,
        stream: true  // 流式输出
    })
});

// 处理流式响应
const reader = response.body.getReader();
const decoder = new TextDecoder();
let isFirstChunk = true;

while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    // 解析并实时播报
    liteSDK.speak(content, isFirstChunk, false);
    isFirstChunk = false;
}
```

### 3. 状态管理

数字人支持多种状态：
- `idle()`: 待机状态
- `listen()`: 倾听状态
- `think()`: 思考状态
- `speak(text, is_start, is_end)`: 说话
- `offlineMode()`: 离线模式（节省积分）
- `onlineMode()`: 在线模式

## 注意事项

1. **HTTPS要求**: SDK仅支持localhost或HTTPS协议
2. **积分消耗**: 数字人会消耗星云平台积分，建议调试时使用离线模式
3. **网络要求**: 需要稳定的网络连接
4. **浏览器兼容**: 推荐使用Chrome浏览器以获得最佳体验

## 安全建议

- ⚠️ 请勿在公共设备上保存密钥
- ⚠️ 使用完毕后及时清除本地存储的密钥
- ⚠️ 健康建议仅供参考，不能替代专业医生诊断

## 后续优化

- [ ] 语音输入功能（Web Speech API）
- [ ] 健康档案管理
- [ ] 多轮对话上下文增强
- [ ] 图片/图表等多模态展示
- [ ] 移动端适配优化
- [ ] PWA支持

## 常见问题

**Q: 数字人无法连接？**
A: 请检查密钥是否正确，网络是否稳定，并确保使用localhost或HTTPS。

**Q: 流式响应卡顿？**
A: 可能是网络问题，建议检查网络连接或更换AI模型。

**Q: 如何节省积分？**
A: 长时间无交互时切换到离线模式，或使用基础音色。

**Q: 对话历史丢失？**
A: 对话历史保存在LocalStorage中，清除浏览器数据会导致丢失。

## 开发团队

星云黑客松 2025 参赛作品

## 相关链接

- [星云数字人SDK文档](https://xingyun3d.com/developers/52-183)
- [魔搭社区API文档](https://modelscope.cn/docs)
- [黑客松比赛页面](https://pre.xingyun3d.com/hackathon2025/)

## 许可证

MIT License

---

**免责声明**: 本项目提供的健康建议仅供参考，不能替代专业医生的诊断和治疗。如有严重健康问题，请及时就医。
