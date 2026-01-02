import axios from 'axios'
import { MODEL_CONFIG, API_ENDPOINTS } from '@/utils/constants'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * 调用魔搭AI模型 - 流式响应（使用fetch API）
 */
export async function callModelStream(
  messages: Message[],
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void,
  apiKey: string
) {
  try {
    console.log('调用魔搭API:', API_ENDPOINTS.MODELSCOPE_CHAT)
    console.log('模型:', MODEL_CONFIG.MODEL_NAME)

    const response = await fetch(API_ENDPOINTS.MODELSCOPE_CHAT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_CONFIG.MODEL_NAME,
        messages,
        stream: true,
        temperature: MODEL_CONFIG.TEMPERATURE,
        max_tokens: MODEL_CONFIG.MAX_TOKENS
      })
    })

    console.log('响应状态:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API错误:', response.status, errorText)
      throw new Error(`API错误 ${response.status}: ${errorText}`)
    }

    // 处理流式响应
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法获取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        console.log('流式响应完成')
        onComplete()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个不完整的行

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6).trim()
        if (data === '[DONE]') {
          console.log('收到结束标记')
          onComplete()
          return
        }

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content || ''

          if (content) {
            console.log('收到内容块:', content.substring(0, 50))
            onChunk(content)
          }
        } catch (e) {
          console.warn('解析失败:', data)
        }
      }
    }

  } catch (error: any) {
    console.error('调用模型失败:', error)
    const errorMsg = error.message || '请求失败'
    console.error('错误详情:', errorMsg)
    onError(errorMsg)
  }
}

/**
 * 非流式调用（备用）
 */
export async function callModel(
  messages: Message[],
  apiKey: string
): Promise<string> {
  try {
    console.log('非流式调用魔搭API')

    const response = await axios.post(
      API_ENDPOINTS.MODELSCOPE_CHAT,
      {
        model: MODEL_CONFIG.MODEL_NAME,
        messages,
        stream: false,
        temperature: MODEL_CONFIG.TEMPERATURE,
        max_tokens: MODEL_CONFIG.MAX_TOKENS
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    )

    const content = response.data.choices?.[0]?.message?.content || ''
    console.log('API响应长度:', content.length)
    return content
  } catch (error: any) {
    console.error('调用模型失败:', error)
    throw new Error(error.response?.data?.message || error.message || '请求失败')
  }
}

/**
 * 生成塔罗牌解读Prompt
 */
export function generateTarotPrompt(cards: string[], question: string): string {
  return `你是一位神秘的塔罗牌占卜师。请根据用户抽到的塔罗牌进行解读。

抽到的牌：${cards.join('、')}
用户问题：${question}

请以神秘而温和的语气，从以下几个方面进行解读：
1. 牌面含义
2. 对问题的启示
3. 建议和指引

请用第一人称，让用户感受到你的关怀和智慧。`
}

/**
 * 生成星座运势Prompt
 */
export function generateHoroscopePrompt(zodiac: string, period: string): string {
  return `你是一位专业的占星师。请为${zodiac}分析${period}的运势。

请从以下几个维度进行预测：
1. 整体运势
2. 爱情运势
3. 事业学业
4. 财运分析
5. 幸运元素（数字、颜色、方位）

请用温暖而神秘的语气，给予用户积极的力量和实用的建议。`
}

/**
 * 生成心理测试Prompt
 */
export function generatePsychologyPrompt(answers: string[]): string {
  return `你是一位洞察力极强的心理咨询师。请根据用户的回答进行性格分析。

用户的回答：${answers.join('；')}

请从以下角度分析：
1. 性格特点
2. 优势与潜力
3. 待提升方面
4. 人生建议

请用温和而专业的语气，让用户感受到被理解和支持。`
}
