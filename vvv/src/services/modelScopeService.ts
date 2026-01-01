import type { ChatMessage } from '@/types'

/**
 * 调用魔搭社区AI模型
 */
export async function callModelScopeAPI(
  messages: ChatMessage[],
  apiKey: string,
  onStreamChunk?: (chunk: string) => void
): Promise<string> {
  if (!apiKey) {
    throw new Error('API Key未配置')
  }

  // 使用通义千问模型
  const model = 'Qwen/Qwen2.5-7B-Instruct'

  // 构建政务知识库系统提示词
  const systemPrompt = `你是一个专业的政务大厅智能助手,名叫"小政"。你的职责是:

1. 准确解答政务政策相关问题
2. 引导用户完成业务办理流程
3. 说明所需材料和办理时间
4. 保持专业、友好的服务态度
5. 回答要简洁明了,重点突出

当前可办理的业务包括:
- 身份证首次申领、到期换领、丢失补领
- 户口迁移
- 社保缴纳
- 公积金提取
- 营业执照注册
- 税务登记

请根据用户提问,提供准确、专业的解答。如果不确定答案,诚实告知用户并建议咨询窗口工作人员。`

  try {
    const response = await fetch('https://api-inference.modelscope.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        stream: true, // 启用流式输出
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API请求失败: ${response.status} ${errorText}`)
    }

    // 处理流式响应
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    const decoder = new TextDecoder()
    let fullResponse = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content

              if (content) {
                fullResponse += content
                if (onStreamChunk) {
                  onStreamChunk(content)
                }
              }
            } catch (e) {
              // 忽略解析错误
              console.warn('解析SSE数据失败:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return fullResponse
  } catch (error: any) {
    console.error('调用魔搭API失败:', error)
    throw error
  }
}

/**
 * 不使用流式的简化版本
 */
export async function callModelScopeAPISimple(
  userMessage: string,
  apiKey: string
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      id: '1',
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    }
  ]

  return callModelScopeAPI(messages, apiKey)
}
