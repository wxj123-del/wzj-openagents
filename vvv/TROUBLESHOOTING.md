# 数字人连接故障排查指南

## 问题: "Cannot read properties of undefined (reading 'load')"

这个错误通常表示SDK未正确加载或初始化时序问题。

## 排查步骤

### 1. 检查SDK加载状态

访问设置页面 (http://localhost:5174/settings),查看"SDK状态检查"卡片:

- ✅ **已加载** (绿色标签) = SDK已成功加载,可以继续下一步
- ❌ **未加载** (红色标签) = SDK未加载,需要检查网络或刷新页面

**如果SDK未加载:**
- 刷新浏览器页面 (F5)
- 检查网络连接
- 打开浏览器控制台 (F12) 查看是否有加载错误

### 2. 检查浏览器控制台

按F12打开开发者工具,查看Console标签:

**正常情况应该看到:**
```
开始初始化数字人SDK...
容器ID: avatar-container
AppID: 65254e14e816423da6218e47b2003ea8
SDK已加载
创建SDK实例,配置: {...}
SDK实例已创建
开始初始化SDK...
SDK初始化完成
```

**错误情况可能看到:**
```
SDK未加载,请检查网络连接
找不到容器元素: avatar-container
SDK加载超时
```

### 3. 检查网络请求

在开发者工具的Network标签中,查找以下请求:

- `xmovAvatar@latest.js` - SDK脚本加载
- `nebula-agent.xingyun3d.com` - 数字人服务连接

**如果SDK脚本加载失败:**
- 检查是否能访问: https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar@latest.js
- 可能被防火墙或网络策略阻止
- 尝试使用VPN或更换网络

**如果数字人服务连接失败:**
- 检查密钥是否正确
- 确认AppID和Secret匹配
- 查看服务器返回的错误信息

### 4. 验证密钥配置

在设置页面确认:

1. 点击"使用测试密钥"开关
2. 密钥字段应自动填充:
   - **魔珐星云 AppID**: 65254e14e816423da6218e47b2003ea8
   - **魔珐星云 Secret**: ba0cb4a582e045d382fd65468937886f
   - **魔搭 API Key**: 65254e14e816423da6218e47b2003ea8
3. 点击"测试连接"按钮

### 5. 检查容器元素

确保首页的数字人容器元素存在:

```html
<div id="avatar-container"></div>
```

**验证方法:**
1. 访问首页 http://localhost:5174/
2. 按F12打开开发者工具
3. 在Console标签输入: `document.getElementById('avatar-container')`
4. 应该返回一个div元素,而不是null

### 6. 尝试手动初始化

在浏览器控制台执行以下代码:

```javascript
// 检查SDK是否加载
console.log('SDK类:', window.XmovAvatar)

// 检查容器是否存在
console.log('容器:', document.getElementById('avatar-container'))

// 尝试创建SDK实例
if (window.XmovAvatar) {
  const sdk = new window.XmovAvatar({
    containerId: 'avatar-container',
    appId: '65254e14e816423da6218e47b2003ea8',
    appSecret: 'ba0cb4a582e045d382fd65468937886f',
    gatewayServer: 'https://nebula-agent.xingyun3d.com/user/v1/ttsa/session',
    enableLogger: true
  })

  // 初始化
  sdk.init({
    onDownloadProgress: (progress) => console.log('进度:', progress)
  })
}
```

### 7. 清除缓存和重新加载

1. 清除浏览器缓存:
   - Chrome: Ctrl+Shift+Delete
   - 选择"缓存的图片和文件"
   - 点击"清除数据"

2. 硬刷新页面:
   - Windows: Ctrl+F5
   - Mac: Cmd+Shift+R

3. 重启开发服务器:
   ```bash
   # 停止服务器 (Ctrl+C)
   # 重新启动
   npm run dev
   ```

## 常见问题解决

### 问题1: SDK加载404错误

**原因**: 无法访问魔珐星云CDN

**解决方案**:
- 检查网络连接
- 尝试使用手机热点
- 检查是否被公司防火墙阻止

### 问题2: CORS跨域错误

**原因**: 浏览器安全策略限制

**解决方案**:
- 使用localhost或HTTPS访问
- 不要使用IP地址访问 (SDK限制)
- 开发环境使用localhost:5174

### 问题3: 容器元素未找到

**原因**: Vue组件未完全渲染

**解决方案**:
- 等待页面完全加载后再连接数字人
- 确保在首页而不是其他页面尝试连接

### 问题4: 积分不足

**原因**: 魔珐星云账户积分不足

**解决方案**:
- 登录魔珐星云平台查看积分余额
- 充值积分或获取免费额度
- 使用离线模式进行开发调试

## 联系支持

如果以上方法都无法解决问题:

1. 查看完整的控制台错误信息
2. 截图错误信息和网络请求
3. 访问魔珐星云开发者社区: https://xingyun3d.com/developers
4. 联系魔珐星云技术支持

## 调试技巧

### 启用详细日志

SDK已经启用详细日志 (`enableLogger: true`),在控制台可以看到所有SDK内部日志。

### 监控事件

添加事件监听来调试:

```javascript
// 在avatar.ts的init函数中添加
onMessage: (message) => console.log('消息:', message),
onStateChange: (state) => console.log('状态:', state),
onVoiceStateChange: (status) => console.log('语音:', status),
onStatusChange: (status) => console.log('连接:', status),
```

### 性能分析

使用浏览器Performance标签分析加载性能,找出加载瓶颈。
