import axios from 'axios'
import { MODEL_CONFIG, API_ENDPOINTS } from '@/utils/constants'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// AI响应结构
export interface AIResponse {
  interpretation: string // 解读内容
  confidence: number // 置信度 (0-100)
  sources: string[] // 知识库来源
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
 * 解析AI响应的JSON格式
 */
export function parseAIResponse(text: string): AIResponse | null {
  try {
    // 尝试提取JSON部分
    let jsonText = text.trim()

    // 如果包含```json标记，提取中间的JSON
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch && jsonMatch[1]) {
      jsonText = jsonMatch[1].trim()
    }

    // 尝试查找第一个{和最后一个}
    const firstBrace = jsonText.indexOf('{')
    const lastBrace = jsonText.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1)
    }

    console.log('解析JSON:', jsonText)
    const parsed = JSON.parse(jsonText)

    // 验证结构
    if (!parsed.interpretation || typeof parsed.interpretation !== 'string') {
      console.error('JSON缺少interpretation字段')
      return null
    }

    // 确保confidence是数字
    if (typeof parsed.confidence !== 'number') {
      parsed.confidence = 75 // 默认置信度
    }
    parsed.confidence = Math.min(100, Math.max(0, parsed.confidence))

    // 确保sources是数组
    if (!Array.isArray(parsed.sources)) {
      parsed.sources = ['AI知识库']
    }

    return {
      interpretation: parsed.interpretation,
      confidence: parsed.confidence,
      sources: parsed.sources
    }
  } catch (error) {
    console.error('JSON解析失败:', error)
    console.error('原始文本:', text)

    // 降级处理：如果解析失败，返回原始文本作为interpretation
    return {
      interpretation: text,
      confidence: 60,
      sources: ['AI知识库']
    }
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

请用第一人称，让用户感受到你的关怀和智慧。

**重要：请严格按照以下JSON格式返回回答，不要包含任何其他文字：**
\`\`\`json
{
  "interpretation": "你的详细解读内容...",
  "confidence": 85,
  "sources": ["塔罗牌权威指南", "占星学原理", "心理学研究"]
}
\`\`\`

其中：
- interpretation: 详细解读内容（200-400字）
- confidence: 解读置信度（0-100之间的整数，基于牌意与问题的相关性）
- sources: 知识来源列表（3-5个，参考：塔罗牌经典著作、占星学理论、心理学原理等）`
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

请用温暖而神秘的语气，给予用户积极的力量和实用的建议。

**重要：请严格按照以下JSON格式返回回答，不要包含任何其他文字：**
\`\`\`json
{
  "interpretation": "你的详细运势分析...",
  "confidence": 90,
  "sources": ["西方占星学", "行星运行理论", "星座运势统计"]
}
\`\`\`

其中：
- interpretation: 详细运势分析（300-500字）
- confidence: 预测置信度（0-100之间的整数，基于星座与当前星相的相关性）
- sources: 知识来源列表（3-5个，参考：占星学经典、行星运行理论、统计分析等）`
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

请用温和而专业的语气，让用户感受到被理解和支持。

**重要：请严格按照以下JSON格式返回回答，不要包含任何其他文字：**
\`\`\`json
{
  "interpretation": "你的详细性格分析...",
  "confidence": 88,
  "sources": ["MBTI性格理论", "心理学经典研究", "人格心理学"]
}
\`\`\`

其中：
- interpretation: 详细性格分析（300-400字）
- confidence: 分析置信度（0-100之间的整数，基于回答完整性和理论相关性）
- sources: 知识来源列表（3-5个，参考：心理学理论、性格研究、学术文献等）`
}
