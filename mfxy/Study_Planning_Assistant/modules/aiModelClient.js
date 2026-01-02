/**
 * AI模型客户端 - 调用魔搭社区API
 */
class AIModelClient {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.apiKey = null;
    this.apiBase = CONFIG.MODELSCOPE.API_BASE;
    this.model = CONFIG.MODELSCOPE.DEFAULT_MODEL;
  }

  /**
   * 初始化客户端
   */
  init() {
    const keys = this.storageManager.getKeys();
    this.apiKey = keys.modelscope_api_key;
    console.log('✓ AI模型客户端已初始化');
    return true;
  }

  /**
   * 发送消息到AI模型
   * @param {Array} messages - 消息数组
   * @param {boolean} stream - 是否使用流式响应
   * @returns {Promise<Object>} AI响应
   */
  async sendMessage(messages, stream = true) {
    try {
      if (!this.apiKey) {
        throw new Error('API密钥未设置');
      }

      const url = `${this.apiBase}${CONFIG.MODELSCOPE.CHAT_ENDPOINT}`;
      console.log('发送消息到AI模型...');
      console.log('API地址:', url);
      console.log('使用模型:', this.model);
      console.log('消息数量:', messages.length);
      console.log('是否流式:', stream);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          stream: stream
        })
      });

      console.log('API响应状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API错误详情:', errorData);
        throw new Error(`API请求失败: ${response.status} ${response.statusText}\n${JSON.stringify(errorData)}`);
      }

      if (stream) {
        return this.parseStreamResponse(response.body);
      } else {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error('AI模型调用失败:', error);
      throw error;
    }
  }

  /**
   * 解析流式响应
   * @param {ReadableStream} stream - 响应流
   * @returns {AsyncIterable} 流式响应迭代器
   */
  async *parseStreamResponse(stream) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // 处理SSE格式的数据
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留不完整的行

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (trimmedLine === '' || trimmedLine.startsWith(':')) {
            continue;
          }

          if (trimmedLine === 'data: [DONE]') {
            return;
          }

          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6);
              const data = JSON.parse(jsonStr);

              // 提取内容
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                yield { content };
              }
            } catch (parseError) {
              console.warn('解析SSE数据失败:', parseError, trimmedLine);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 生成学习计划对话
   * @param {string} userMessage - 用户消息
   * @param {Array} conversationHistory - 对话历史
   * @returns {AsyncIterable} AI响应流
   */
  async generateLearningPlanResponse(userMessage, conversationHistory = []) {
    const systemPrompt = `你是一个专业的学习规划助手，名叫"小智"。你的职责是：

1. **了解学生情况**：通过对话了解学生的年级、科目、学习目标、可用时间等信息
2. **制定学习计划**：根据学生情况，制定科学合理的学习计划
3. **提供学习建议**：给出具体的学习方法和建议
4. **督促和鼓励**：在适当的时候给学生鼓励和督促

对话风格：
- 友好、专业、耐心
- 使用简洁易懂的语言
- 适当使用表情符号增加亲和力
- 说话要简短，适合数字人朗读（每段不超过100字）

重要提示：
- 回复要简短，每段不超过2-3句话
- 避免使用复杂的标点符号和数字
- 使用自然的口语化表达
- 如果需要展示学习计划，请用清晰的格式列出`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // 只保留最近10条历史
      { role: 'user', content: userMessage }
    ];

    return this.sendMessage(messages, true);
  }

  /**
   * 获取学习计划建议
   * @param {Object} studentInfo - 学生信息
   * @returns {Promise<string>} 学习计划建议
   */
  async getLearningPlanSuggestion(studentInfo) {
    const prompt = `请根据以下学生信息，制定一个详细的学习计划：

学生信息：
- 年级：${studentInfo.grade}
- 重点科目：${studentInfo.subjects.join('、')}
- 学习目标：${studentInfo.goals.join('、')}
- 每天可用时间：${studentInfo.available_time}

请提供：
1. 每日学习时间安排
2. 各科学习重点
3. 学习方法和建议

回复要简短清晰，适合数字人朗读。`;

    const messages = [
      { role: 'system', content: '你是一个专业的学习规划助手。' },
      { role: 'user', content: prompt }
    ];

    const response = await this.sendMessage(messages, false);
    return response;
  }

  /**
   * 生成鼓励消息
   * @param {string} situation - 情境类型
   * @returns {Promise<string>} 鼓励消息
   */
  async generateEncouragement(situation) {
    const prompts = {
      'start': '请给我一句简短的学习鼓励，激励学生开始学习',
      'progress': '请表扬学生的学习进步，肯定他的努力',
      'tired': '学生学习累了，请给他一段简短的鼓励和休息建议',
      'goal_achieved': '学生达成了学习目标，请给予祝贺和鼓励',
      'default': '请给学生一句简短的学习鼓励'
    };

    const prompt = prompts[situation] || prompts['default'];

    const messages = [
      { role: 'system', content: '你是学习规划助手小智。回复要简短温暖，适合数字人朗读。' },
      { role: 'user', content: prompt }
    ];

    const response = await this.sendMessage(messages, false);
    return response;
  }

  /**
   * 分析学习进度并给出建议
   * @param {Object} progressData - 进度数据
   * @returns {Promise<string>} 进度分析和建议
   */
  async analyzeProgress(progressData) {
    const prompt = `请分析学生的学习进度并给出建议：

学习时长：${progressData.duration}分钟
完成任务：${progressData.completed}/${progressData.total}
学习状态：${progressData.mood}

请给出简短的分析和建议（不超过100字）。`;

    const messages = [
      { role: 'system', content: '你是学习规划助手小智。回复要简短专业。' },
      { role: 'user', content: prompt }
    ];

    const response = await this.sendMessage(messages, false);
    return response;
  }
}
