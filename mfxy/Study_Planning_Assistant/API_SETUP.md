# 🔑 魔搭API配置说明

## ✅ 已修复的问题

1. **API地址已更新**: `https://api-inference.modelscope.cn/v1` (之前是错误的 `api.modelscope.cn`)
2. **模型名称已更新**: `Qwen/Qwen2.5-72B-Instruct` (支持DeepSeek-R1等其他模型)
3. **添加详细日志**: 便于调试API调用问题

## 🚀 现在刷新页面试试

刷新浏览器（Ctrl+R），然后：

### 1. 测试API连接
访问测试页面：`http://localhost:8000/test.html`

点击"测试API连接"按钮，查看结果。

### 2. 测试主应用
访问：`http://localhost:8000/index.html`

1. 连接数字人
2. 发送消息："你好"
3. 查看控制台日志

## 📊 控制台日志示例

**正常情况：**
```
发送消息到AI模型...
API地址: https://api-inference.modelscope.cn/v1/chat/completions
使用模型: Qwen/Qwen2.5-72B-Instruct
消息数量: 2
是否流式: true
API响应状态: 200 OK
```

## 🔧 如果还有问题

### 问题1: DNS解析失败 (ERR_NAME_NOT_RESOLVED)

**原因**: 无法连接到魔搭服务器

**解决方案**:
1. 检查网络连接
2. 尝试访问 https://www.modelscope.cn 确认网站可访问
3. 可能需要配置代理或VPN

### 问题2: API密钥无效

**症状**: 返回 401 Unauthorized

**解决方案**:
1. 访问 https://modelscope.cn/my/myaccesstoken
2. 获取新的API Token
3. 在应用中点击"密钥设置"更新

### 问题3: 模型不存在

**症状**: 返回 400 Model not found

**解决方案**:
尝试更换模型，可选模型：
- `Qwen/Qwen2.5-72B-Instruct` (默认，推荐)
- `Qwen/Qwen2.5-32B-Instruct`
- `deepseek-ai/DeepSeek-R1`
- `THUDM/glm-4-9b-chat`

在 `config.js` 中修改：
```javascript
DEFAULT_MODEL: 'Qwen/Qwen2.5-72B-Instruct'
```

### 问题4: CORS跨域问题

**症状**: 控制台显示CORS错误

**解决方案**:
魔搭API支持跨域，如果仍有问题：
1. 使用代理服务器
2. 或在服务端调用API

## 💡 Python示例（供参考）

你提供的Python代码是正确的：

```python
from openai import OpenAI

client = OpenAI(
    base_url='https://api-inference.modelscope.cn/v1',
    api_key='ms-你的Token'
)

response = client.chat.completions.create(
    model='deepseek-ai/DeepSeek-V3',  # 或其他模型
    messages=[{'role': 'user', 'content': '你好'}],
    stream=True
)
```

JavaScript调用方式相同，只是语法不同。

## 🧪 测试其他模型

如果想测试DeepSeek模型，修改 `config.js`:

```javascript
DEFAULT_MODEL: 'deepseek-ai/DeepSeek-R1'
```

然后刷新页面重试。

## 📝 API调用限制

- 免费额度：可能有限制
- 速率限制：请勿频繁调用
- 超时时间：默认30秒

## 🆘 仍需帮助？

1. **查看控制台** (F12) - 完整的错误信息
2. **查看Network标签** - API请求详情
3. **运行测试页面** - `test.html` 诊断问题

---

**提示**: 确保在localhost或HTTPS环境下运行，否则可能有跨域问题。
