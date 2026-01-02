/**
 * 数字人控制器 - 管理魔珐星云SDK的初始化、连接和交互
 */
class AvatarController {
  constructor(storageManager, uiManager) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.avatarSDK = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.currentVoiceState = 'stopped'; // 'playing' | 'stopped'
  }

  /**
   * 初始化SDK
   */
  async init() {
    try {
      console.log('正在初始化数字人SDK...');

      // 检查SDK是否已加载
      if (typeof XmovAvatar === 'undefined') {
        throw new Error('魔珐星云SDK未加载，请检查网络连接或刷新页面重试');
      }

      const keys = this.storageManager.getKeys();

      if (!this.storageManager.validateKeys(keys)) {
        throw new Error('密钥不完整，请检查密钥设置');
      }

      console.log('使用密钥:', {
        appId: keys.xingyun_appId,
        hasSecret: !!keys.xingyun_appSecret,
        hasApiKey: !!keys.modelscope_api_key
      });

      // 检查容器是否存在
      const container = document.getElementById('avatar-container');
      if (!container) {
        throw new Error('找不到容器元素 #avatar-container');
      }

      console.log('容器尺寸:', {
        width: container.offsetWidth,
        height: container.offsetHeight,
        display: getComputedStyle(container).display
      });

      // 创建SDK实例
      this.avatarSDK = new XmovAvatar({
        containerId: '#avatar-container',  // 注意：需要带 # 前缀
        appId: keys.xingyun_appId,
        appSecret: keys.xingyun_appSecret,
        gatewayServer: CONFIG.XINGYUN.GATEWAY_SERVER,

        // 消息回调
        onMessage: (message) => {
          console.log('SDK消息:', message);
          this.uiManager.handleSDKMessage(message);
        },

        // 状态变化回调
        onStateChange: (state) => {
          console.log('数字人状态变化:', state);
          this.uiManager.updateAvatarState(state);
        },

        // 语音状态变化回调
        onVoiceStateChange: (status) => {
          console.log('语音状态:', status);
          this.currentVoiceState = status === 'voice_start' ? 'playing' : 'stopped';
        },

        // 网络信息回调
        onNetworkInfo: (networkInfo) => {
          console.log('网络信息:', networkInfo);
        },

        enableLogger: true // 开发阶段开启日志
      });

      console.log('✓ SDK实例已创建');
      return true;
    } catch (error) {
      console.error('✗ 初始化SDK失败:', error);
      this.uiManager.showError('初始化数字人失败: ' + error.message);
      return false;
    }
  }

  /**
   * 连接数字人
   */
  async connect() {
    // 如果已连接，先断开
    if (this.isConnected) {
      console.log('检测到已连接，先断开旧连接...');
      await this.disconnect();
      // 等待清理完成
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (this.isConnecting) {
      console.log('数字人正在连接中...');
      return false;
    }

    this.isConnecting = true;
    this.uiManager.showConnectionStatus('connecting');

    try {
      // 等待DOM完全加载
      await new Promise(resolve => setTimeout(resolve, 100));

      // 如果有旧SDK实例，先清理
      if (this.avatarSDK) {
        console.log('清理旧的SDK实例...');
        try {
          this.avatarSDK.destroy();
        } catch (e) {
          console.warn('清理旧SDK时出错:', e);
        }
        this.avatarSDK = null;
      }

      // 获取容器
      const container = document.getElementById('avatar-container');
      if (!container) {
        throw new Error('容器 #avatar-container 不存在');
      }

      // 注意：不要手动清空容器，让SDK自己管理
      console.log('容器状态检查:', {
        exists: !!container,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        currentChildren: container.children.length
      });

      console.log('准备连接数字人，容器状态:', {
        exists: !!container,
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
        innerHTML: container.innerHTML.substring(0, 100)
      });

      // 初始化SDK
      const initSuccess = await this.init();
      if (!initSuccess) {
        throw new Error('SDK初始化失败');
      }

      // 初始化连接并加载资源
      await this.avatarSDK.init({
        onDownloadProgress: (progress) => {
          console.log(`资源加载进度: ${progress}%`);
          this.uiManager.updateLoadingProgress(progress);
        }
      });

      // 检查SDK渲染后的容器内容
      setTimeout(() => {
        const containerAfter = document.getElementById('avatar-container');
        if (containerAfter) {
          console.log('=== SDK渲染后的容器检查 ===');
          console.log('容器HTML（前200字符）:', containerAfter.innerHTML.substring(0, 200));
          console.log('直接子元素数量:', containerAfter.children.length);
          console.log('所有子节点数量:', containerAfter.childNodes.length);
          console.log('第一个元素:', containerAfter.firstElementChild?.tagName);
          console.log('第一个元素class:', containerAfter.firstElementChild?.className);
          console.log('第一个元素id:', containerAfter.firstElementChild?.id);

          // 查找canvas或video
          const canvas = containerAfter.querySelector('canvas');
          const video = containerAfter.querySelector('video');
          console.log('Canvas存在:', !!canvas);
          console.log('Video存在:', !!video);

          if (canvas) {
            console.log('Canvas尺寸:', canvas.width, 'x', canvas.height);
            console.log('Canvas样式:', canvas.style.cssText);
            console.log('Canvas显示:', getComputedStyle(canvas).display);
            console.log('Canvas可见性:', getComputedStyle(canvas).visibility);
          }

          // 判断容器是否为空（CSS :empty 伪元素判断的是否有子节点）
          const isEmpty = containerAfter.children.length === 0;
          console.log('容器是否为空:', isEmpty);
          console.log('========================');
        }
      }, 3000);

      this.isConnected = true;
      this.isConnecting = false;
      this.uiManager.showConnectionStatus('connected');
      console.log('✓ 数字人已连接');

      // 暂时注释掉，避免干扰SDK渲染
      // this.setIdle();

      return true;
    } catch (error) {
      console.error('✗ 连接数字人失败:', error);
      this.isConnected = false;
      this.isConnecting = false;
      this.uiManager.showConnectionStatus('failed');
      this.uiManager.showError('连接数字人失败: ' + error.message);
      return false;
    }
  }

  /**
   * 断开连接并销毁SDK
   */
  async disconnect() {
    try {
      console.log('开始断开数字人连接...');

      // 停止当前状态
      this.isConnected = false;
      this.isConnecting = false;

      // 销毁SDK实例
      if (this.avatarSDK) {
        try {
          this.avatarSDK.destroy();
          console.log('✓ SDK实例已销毁');
        } catch (e) {
          console.warn('销毁SDK时出错:', e);
        }
        this.avatarSDK = null;
      }

      // 清空容器
      const container = document.getElementById('avatar-container');
      if (container && container.innerHTML) {
        container.innerHTML = '';
        console.log('✓ 容器已清空');
      }

      // 更新UI状态
      this.uiManager.showConnectionStatus('disconnected');
      console.log('✓ 数字人已断开');
      return true;
    } catch (error) {
      console.error('✗ 断开数字人失败:', error);
      // 确保状态被重置
      this.avatarSDK = null;
      this.isConnected = false;
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * 让数字人说话
   * @param {string} text - 说话内容
   * @param {boolean} isStart - 是否是流式开始
   * @param {boolean} isEnd - 是否是流式结束
   */
  speak(text, isStart = true, isEnd = true) {
    if (!this.isConnected || !this.avatarSDK) {
      console.warn('数字人未连接，无法说话');
      return false;
    }

    try {
      this.avatarSDK.speak(text, isStart, isEnd);
      console.log(`数字人说话: ${text.substring(0, 50)}...`);
      return true;
    } catch (error) {
      console.error('让数字人说话失败:', error);
      return false;
    }
  }

  /**
   * 流式说话 - 用于AI流式响应
   * @param {AsyncIterable} stream - AI响应流
   */
  async streamSpeak(stream) {
    if (!this.isConnected || !this.avatarSDK) {
      console.warn('数字人未连接，无法说话');
      return;
    }

    try {
      let isFirstChunk = true;
      let fullText = '';

      for await (const chunk of stream) {
        const text = chunk.content || chunk.delta?.content || '';
        if (text) {
          fullText += text;
          // 流式调用speak，中间的chunk isStart和isEnd都是false
          this.speak(text, isFirstChunk, false);
          isFirstChunk = false;
        }
      }

      // 最后一次调用，标记结束
      this.speak('', false, true);
      console.log('✓ 流式说话完成');
    } catch (error) {
      console.error('流式说话失败:', error);
    }
  }

  /**
   * 设置数字人为倾听状态
   */
  listen() {
    if (this.avatarSDK && this.isConnected) {
      try {
        this.avatarSDK.listen();
        console.log('数字人状态: 倾听');
      } catch (error) {
        console.error('设置倾听状态失败:', error);
      }
    }
  }

  /**
   * 设置数字人为思考状态
   */
  think() {
    if (this.avatarSDK && this.isConnected) {
      try {
        this.avatarSDK.think();
        console.log('数字人状态: 思考');
      } catch (error) {
        console.error('设置思考状态失败:', error);
      }
    }
  }

  /**
   * 设置数字人为待机状态
   */
  setIdle() {
    if (this.avatarSDK && this.isConnected) {
      try {
        this.avatarSDK.idle();
        console.log('数字人状态: 待机');
      } catch (error) {
        console.error('设置待机状态失败:', error);
      }
    }
  }

  /**
   * 设置数字人为待机互动状态
   */
  setInteractiveIdle() {
    if (this.avatarSDK && this.isConnected) {
      try {
        this.avatarSDK.interactiveidle();
        console.log('数字人状态: 待机互动');
      } catch (error) {
        console.error('设置待机互动状态失败:', error);
      }
    }
  }

  /**
   * 进入离线模式（不消耗积分）
   */
  setOfflineMode() {
    if (this.avatarSDK && this.isConnected) {
      try {
        this.avatarSDK.offlineMode();
        console.log('数字人模式: 离线');
      } catch (error) {
        console.error('设置离线模式失败:', error);
      }
    }
  }

  /**
   * 进入在线模式
   */
  setOnlineMode() {
    if (this.avatarSDK && this.isConnected) {
      try {
        this.avatarSDK.onlineMode();
        console.log('数字人模式: 在线');
      } catch (error) {
        console.error('设置在线模式失败:', error);
      }
    }
  }

  /**
   * 设置音量
   * @param {number} volume - 音量值 0-1
   */
  setVolume(volume) {
    if (this.avatarSDK && this.isConnected) {
      try {
        this.avatarSDK.setVolume(volume);
        console.log(`音量设置为: ${volume}`);
      } catch (error) {
        console.error('设置音量失败:', error);
      }
    }
  }

  /**
   * 获取当前连接状态
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      voiceState: this.currentVoiceState
    };
  }
}
