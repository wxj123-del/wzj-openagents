# 🔍 数字人显示问题诊断

## 问题：连接成功但看不到3D数字人

### 🚀 快速解决步骤

#### 1. 强制刷新页面
按 **Ctrl + Shift + R** （Windows）或 **Cmd + Shift + R** （Mac）

#### 2. 重新连接
1. 点击"断开连接"
2. 等待2秒
3. 点击"连接数字人"
4. **等待进度达到100%**

#### 3. 查看控制台日志
按 **F12** 打开开发者工具，查看Console标签页。

**应该看到类似这样的日志：**
```
准备连接数字人，容器状态: {exists: true, offsetWidth: xxx, offsetHeight: 500, innerHTML: ""}
正在初始化数字人SDK...
✓ SDK实例已创建
资源加载进度: 0%
资源加载进度: 25%
资源加载进度: 50%
资源加载进度: 75%
资源加载进度: 100%
✓ 数字人已连接
SDK渲染后的容器: {innerHTML: "<canvas...", children: 1, firstChild: "CANVAS", firstChildClasses: "..."}
数字人状态: 待机
```

### 🔑 关键日志

#### ✅ 正常情况
- `SDK渲染后的容器: {innerHTML: "<canvas", children: 1, firstChild: "CANVAS"}`
- 说明SDK在容器中创建了canvas元素

#### ❌ 异常情况
- `SDK渲染后的容器: {innerHTML: "", children: 0}`
- 说明SDK没有在容器中创建任何元素

### 🎨 检查渲染元素

在控制台执行以下命令，检查SDK创建的元素：

```javascript
// 获取容器
const container = document.getElementById('avatar-container');

// 查看容器内容
console.log('容器内容:', container.innerHTML);

// 查看子元素数量
console.log('子元素数量:', container.children.length);

// 查看第一个子元素
console.log('第一个子元素:', container.firstElementChild);

// 如果有canvas，检查尺寸
const canvas = container.querySelector('canvas');
if (canvas) {
  console.log('Canvas尺寸:', canvas.width, canvas.height);
  console.log('Canvas样式:', canvas.style.cssText);
}
```

### 📋 常见问题

#### 问题1: 看到图标而不是数字人

**原因**: SDK可能还在加载资源，或者加载失败

**解决**:
1. 查看控制台是否有红色错误
2. 确认"资源加载进度"达到100%
3. 等待30秒让SDK完全加载

#### 问题2: SDK渲染后的容器为空

**可能原因**:
- SDK初始化失败
- 网络问题导致资源下载失败
- WebGL不支持

**解决**:
1. 检查浏览器是否支持WebGL
2. 查看Network标签页，看资源是否加载成功
3. 尝试更换浏览器（推荐Chrome）

#### 问题3: Canvas元素存在但不显示

**可能原因**:
- Canvas尺寸为0
- Canvas被CSS隐藏
- WebGL上下文创建失败

**解决**:
```javascript
const canvas = document.querySelector('#avatar-container canvas');
if (canvas) {
  // 检查尺寸
  console.log('宽度:', canvas.offsetWidth);
  console.log('高度:', canvas.offsetHeight);

  // 强制设置尺寸
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  // 检查是否隐藏
  console.log('显示状态:', getComputedStyle(canvas).display);
  console.log('可见性:', getComputedStyle(canvas).visibility);
}
```

### 🧪 手动测试

在控制台执行，让数字人说话测试：

```javascript
// 测试说话
window.appInstance.avatarController.speak('你好，我是测试', true, true);
```

如果听到声音但看不到人，说明：
- ✅ SDK连接成功
- ✅ 语音播放正常
- ❌ 渲染有问题

### 🎯 预期效果

连接成功后应该看到：
1. **紫色渐变背景** - 正常
2. **3D数字人形象** - 在中央，清晰可见
3. **自然的表情和动作** - 会眨眼、说话时有口型
4. **听到声音** - 数字人会说话

### 📱 浏览器兼容性

推荐使用：
- ✅ Chrome 90+
- ✅ Edge 90+
- ⚠️ Firefox 85+ (可能需要调整设置)

不支持：
- ❌ IE浏览器
- ❌ Safari (可能需要额外配置)

### 🔧 高级调试

#### 启用SDK详细日志
SDK初始化时已设置 `enableLogger: true`，查看控制台的SDK内部日志。

#### 查看WebGL状态
```javascript
// 检查WebGL支持
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
console.log('WebGL支持:', !!gl);
if (gl) {
  console.log('WebGL版本:', gl.getParameter(gl.VERSION));
  console.log('GLSL版本:', gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
}
```

#### 检查网络请求
1. 按F12打开开发者工具
2. 切换到Network标签
3. 连接数字人
4. 查看是否有加载失败的资源（红色）

### 💡 临时解决方案

如果暂时看不到数字人，但功能正常：
1. 可以继续使用（语音和对话功能正常）
2. 后续可能自动显示
3. 或者刷新页面重试

### 📞 获取帮助

如果以上方法都无法解决，请提供：
1. **完整的控制台日志**（从"准备连接数字人"到所有后续日志）
2. **SDK渲染后的容器日志**
3. **浏览器版本信息**
4. **是否有红色错误**

---

**提示**: 魔珐星云SDK使用WebGL渲染3D数字人，确保显卡驱动已更新，浏览器支持硬件加速。
