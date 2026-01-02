/**
 * 学习规划器 - 核心业务逻辑
 */
class LearningPlanner {
  constructor(storageManager, avatarController, aiModelClient, uiManager) {
    this.storageManager = storageManager;
    this.avatarController = avatarController;
    this.aiModelClient = aiModelClient;
    this.uiManager = uiManager;
    this.isPlanning = false;
    this.planningState = 'idle'; // 'idle' | 'collecting' | 'generating' | 'completed'
    this.studentInfo = {};
  }

  /**
   * 开始制定学习计划
   */
  async startPlanning() {
    if (this.isPlanning) {
      this.uiManager.addMessage('学习计划制定中...', 'system');
      return;
    }

    this.isPlanning = true;
    this.planningState = 'collecting';
    this.studentInfo = {};

    // 加载对话历史
    const history = this.storageManager.getConversationHistory();

    // 数字人进入倾听状态
    this.avatarController.listen();

    // 发送开场问候
    const greeting = '你好！我是你的学习规划助手小智。让我们开始制定你的学习计划吧！首先，请问你现在是几年级呢？';
    this.uiManager.addMessage(greeting, 'assistant');
    this.avatarController.speak(greeting, true, true);
  }

  /**
   * 处理用户输入
   * @param {string} userInput - 用户输入
   */
  async processInput(userInput) {
    if (!userInput.trim()) return;

    // 显示用户消息
    this.uiManager.addMessage(userInput, 'user');

    // 数字人进入思考状态
    this.avatarController.think();

    // 获取对话历史
    let conversationHistory = this.storageManager.getConversationHistory();

    // 添加当前用户消息到历史
    conversationHistory.push({ role: 'user', content: userInput });

    try {
      // 调用AI生成回复
      const aiStream = await this.aiModelClient.generateLearningPlanResponse(
        userInput,
        conversationHistory
      );

      // 数字人进入说话状态
      let fullResponse = '';

      // 使用真正的流式说话，以句子为单位分段
      let isFirstChunk = true;
      let accumulatedText = '';

      for await (const chunk of aiStream) {
        const content = chunk.content || chunk.delta?.content || '';
        if (content) {
          fullResponse += content;
          accumulatedText += content;

          // 遇到句子结束符就发送一次（句号、问号、感叹号、分号）
          if (/[。？！；]/.test(accumulatedText) && accumulatedText.length > 5) {
            this.avatarController.speak(accumulatedText, isFirstChunk, false);
            accumulatedText = '';
            isFirstChunk = false;
          }
        }
      }

      // 发送剩余的文本
      if (accumulatedText.length > 0) {
        this.avatarController.speak(accumulatedText, isFirstChunk, true);
      } else {
        // 如果没有剩余文本，只发送结束标记
        this.avatarController.speak('', false, true);
      }

      // 显示AI回复
      this.uiManager.addMessage(fullResponse, 'assistant');

      // 保存对话历史
      conversationHistory.push({ role: 'assistant', content: fullResponse });
      this.storageManager.saveConversationHistory(conversationHistory);

      // 说话结束后回到倾听状态
      setTimeout(() => {
        this.avatarController.listen();
      }, 3000);

    } catch (error) {
      console.error('处理用户输入失败:', error);
      this.uiManager.showError('处理失败: ' + error.message);
      this.avatarController.setIdle();
    }
  }

  /**
   * 快速操作：查看进度
   */
  async showProgress() {
    const progressRecords = this.storageManager.getProgressRecords();

    if (progressRecords.length === 0) {
      const message = '还没有学习记录哦。开始学习吧！';
      this.uiManager.addMessage(message, 'assistant');
      this.avatarController.speak(message, true, true);
      return;
    }

    const latestRecord = progressRecords[progressRecords.length - 1];
    const progressMessage = `你的学习进度：已完成 ${latestRecord.tasks_completed}/${latestRecord.tasks_total} 个任务，学习时长 ${latestRecord.study_duration} 分钟。加油！`;

    this.uiManager.addMessage(progressMessage, 'assistant');
    this.avatarController.speak(progressMessage, true, true);
  }

  /**
   * 快速操作：学习提醒
   */
  async setReminder() {
    const encouragements = [
      '该开始学习啦！今天的任务完成了吗？',
      '学习时间到了，保持专注，你可以的！',
      '记得按时完成今天的学习计划哦！',
      '学习就像爬山，每一步都很重要，继续加油！'
    ];

    const message = encouragements[Math.floor(Math.random() * encouragements.length)];
    this.uiManager.addMessage(message, 'assistant');
    this.avatarController.speak(message, true, true);
  }

  /**
   * 生成鼓励消息
   * @param {string} situation - 情境
   */
  async encourage(situation = 'default') {
    try {
      const message = await this.aiModelClient.generateEncouragement(situation);
      this.uiManager.addMessage(message, 'assistant');
      this.avatarController.speak(message, true, true);
    } catch (error) {
      console.error('生成鼓励消息失败:', error);
    }
  }

  /**
   * 记录学习进度
   * @param {Object} progressData - 进度数据
   */
  recordProgress(progressData) {
    const progress = {
      progress_id: `progress_${Date.now()}`,
      date: new Date().toISOString(),
      ...progressData
    };

    this.storageManager.saveProgressRecord(progress);
    console.log('学习进度已记录:', progress);
  }

  /**
   * 分析学习进度并给出建议
   */
  async analyzeAndAdvise() {
    const progressRecords = this.storageManager.getProgressRecords();

    if (progressRecords.length === 0) {
      this.uiManager.addMessage('还没有学习记录，开始学习后我会给你建议哦！', 'assistant');
      return;
    }

    try {
      const latestRecord = progressRecords[progressRecords.length - 1];
      const advice = await this.aiModelClient.analyzeProgress({
        duration: latestRecord.study_duration,
        completed: latestRecord.tasks_completed,
        total: latestRecord.tasks_total,
        mood: latestRecord.mood
      });

      this.uiManager.addMessage(advice, 'assistant');
      this.avatarController.speak(advice, true, true);
    } catch (error) {
      console.error('分析进度失败:', error);
    }
  }

  /**
   * 完成学习计划制定
   */
  async completePlanning() {
    this.isPlanning = false;
    this.planningState = 'completed';

    const completionMessage = '学习计划制定完成！记得按照计划执行哦，我会督促你的。有什么问题随时问我！';
    this.uiManager.addMessage(completionMessage, 'assistant');
    this.avatarController.speak(completionMessage, true, true);

    // 保存学习计划
    const plan = {
      plan_id: `plan_${Date.now()}`,
      student_info: this.studentInfo,
      content: completionMessage,
      created_at: new Date().toISOString()
    };

    this.storageManager.saveLearningPlan(plan);
  }

  /**
   * 重置规划器
   */
  reset() {
    this.isPlanning = false;
    this.planningState = 'idle';
    this.studentInfo = {};
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      isPlanning: this.isPlanning,
      planningState: this.planningState,
      studentInfo: this.studentInfo
    };
  }
}
