# 🔧 故障排查指南

## 常见问题及解决方案

### 1. SDK加载失败

#### 症状
- 页面显示"SDK加载失败"
- 控制台错误: `XmovAvatar is not defined`

#### 解决方案

**方案1: 检查网络连接**
```bash
# 测试能否访问SDK
curl -I https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar@latest.js
```

**方案2: 使用本地服务器**
确保在localhost或HTTPS环境下运行：
```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

**方案3: 清除浏览器缓存**
- Chrome: F12 → Network → Disable cache
- 或者使用Ctrl+Shift+R强制刷新

**方案4: 检查浏览器控制台**
1. 按F12打开开发者工具
2. 查看Console标签的红色错误信息
3. 查看Network标签，找到xmovAvatar@latest.js
   - 状态码应该是200
   - 如果是404或503，说明网络问题

---

### 2. 数字人连接失败

#### 症状
- 点击"连接数字人"后提示连接失败
- 错误: "Cannot read properties of undefined"

#### 解决方案

**检查1: 确认SDK已加载**
打开控制台，输入：
```javascript
typeof XmovAvatar
```
应该返回 `"function"`，如果是 `"undefined"` 说明SDK未加载

**检查2: 确认密钥配置**
1. 点击"密钥设置"
2. 确保"使用内置测试密钥"已勾选
3. 或填入正确的密钥

**检查3: 查看详细错误信息**
控制台会显示使用的是哪个密钥：
```
使用密钥: {appId: "xxx", hasSecret: true, hasApiKey: true}
```

---

### 3. 密钥验证失败

#### 症状
- 错误: "密钥不完整"

#### 解决方案

**测试密钥是否有效**
```javascript
// 在控制台执行
const keys = {
  xingyun_appId: '65254e14e816423da6218e47b2003ea8',
  xingyun_appSecret: 'ba0cb4a582e045d382fd65468937886f',
  modelscope_api_key: 'ms-6e0d45c0-1a56-4527-8ddc-fd7cb1dd796b'
};
console.log('App ID:', keys.xingyun_appId);
console.log('Secret存在:', !!keys.xingyun_appSecret);
console.log('API Key存在:', !!keys.modelscope_api_key);
```

**更新密钥**
1. 访问[魔珐星云平台](https://xingyun3d.com/)获取新密钥
2. 点击"密钥设置" → 取消勾选"使用内置测试密钥"
3. 填入新的密钥并保存

---

### 4. 数字人不说话

#### 症状
- 数字人连接成功，但播放时没有声音

#### 解决方案

**检查1: 浏览器音频权限**
```javascript
// 检查AudioContext
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
console.log('音频状态:', audioCtx.state);
// 应该是 "running"
```

**检查2: 系统音量**
- 确认电脑音量已打开
- 确认浏览器没有静音

**检查3: 浏览器自动播放策略**
Chrome需要用户交互后才能播放音频：
- 第一次使用时，先点击页面任意位置
- 然后再连接数字人

**检查4: 查看语音状态回调**
控制台会显示：
```
语音状态: voice_start
语音状态: voice_end
```

---

### 5. AI不回复

#### 症状
- 发送消息后没有AI回复

#### 解决方案

**检查1: API Key是否有效**
```javascript
// 测试魔搭API
fetch('https://api.modelscope.cn/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ms-6e0d45c0-1a56-4527-8ddc-fd7cb1dd796b'
  },
  body: JSON.stringify({
    model: 'qwen-plus',
    messages: [{role: 'user', content: '你好'}],
    stream: false
  })
})
.then(r => r.json())
.then(d => console.log('API响应:', d))
.catch(e => console.error('API错误:', e));
```

**检查2: 查看Network标签**
1. F12 → Network
2. 找到发送到modelscope.cn的请求
3. 查看响应状态码和内容

**检查3: API额度是否用完**
- 访问[魔搭社区控制台](https://modelscope.cn/my/myaccesstoken)
- 查看剩余额度

---

### 6. 页面样式异常

#### 症状
- 页面布局错乱
- 按钮位置不对

#### 解决方案

**清除缓存并硬刷新**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**检查styles.css是否加载**
1. F12 → Network
2. 找到styles.css
3. 状态码应该是200

---

### 7. 数字人显示异常

#### 症状
- 数字人区域黑屏或白屏
- 数字人显示不正常

#### 解决方案

**检查容器尺寸**
```javascript
// 控制台执行
const container = document.getElementById('avatar-container');
console.log('容器宽度:', container.offsetWidth);
console.log('容器高度:', container.offsetHeight);
// 应该大于0
```

**检查WebGL支持**
```javascript
// 检查WebGL
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
console.log('WebGL支持:', !!gl);
```

---

## 调试技巧

### 查看应用状态
```javascript
// 获取应用实例
const app = window.appInstance;

// 查看连接状态
console.log(app.avatarController.getConnectionStatus());

// 查看对话历史
console.log(app.storageManager.getConversationHistory());

// 查看密钥
console.log(app.storageManager.getKeys());
```

### 手动触发连接
```javascript
// 在控制台执行
window.appInstance.avatarController.connect();
```

### 查看SDK实例
```javascript
// 查看SDK对象
console.log(window.appInstance.avatarController.avatarSDK);
```

### 重置所有数据
```javascript
// 清空localStorage
localStorage.clear();

// 刷新页面
location.reload();
```

---

## 性能优化建议

### 1. 减少积分消耗
- 长时间不使用时，点击"断开连接"
- 调试时可以使用离线模式

### 2. 提升响应速度
- 使用较短的对话轮次
- 避免一次性发送大量文本

### 3. 内存管理
- 定期清理对话历史
- 避免长时间不刷新页面

---

## 获取帮助

如果以上方案都无法解决问题：

1. **查看浏览器控制台** (F12)
   - Console: 查看错误日志
   - Network: 查看网络请求
   - Application: 查看localStorage

2. **收集诊断信息**
```javascript
// 在控制台执行，复制输出结果
console.log({
  sdkLoaded: typeof XmovAvatar !== 'undefined',
  sdkVersion: XmovAvatar?.version,
  browser: navigator.userAgent,
  keys: window.appInstance?.storageManager?.getKeys(),
  connectionStatus: window.appInstance?.avatarController?.getConnectionStatus()
});
```

3. **联系支持**
   - 魔珐星云开发者社群
   - [魔珐星云文档](https://xingyun3d.com/developers/52-183)
   - [魔搭社区文档](https://modelscope.cn/docs)

---

## 常用调试命令

```javascript
// 重新初始化应用
location.reload();

// 清空对话历史
window.appInstance.storageManager.clearConversationHistory();
window.appInstance.uiManager.clearChatHistory();

// 测试数字人说话
window.appInstance.avatarController.speak('你好，测试中', true, true);

// 查看所有localStorage数据
console.log(localStorage);

// 查看当前状态
console.log('应用状态:', window.appInstance);
```
