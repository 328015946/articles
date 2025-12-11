<script setup>
  const user = useUser()
  const messages = ref([])
  const inputContent = ref('')
  const chatBoxRef = ref(null)
  const isSending = ref(false)
  // ★★★ 新增：在线人数状态 ★★★
  const onlineCount = ref(1)
  let timer = null

  // 1. 获取消息 (修改适配新接口格式)
  const fetchMessages = async () => {
    try {
      const res = await $fetch('/api/fishpond/list')

      // ★ 更新在线人数
      onlineCount.value = res.onlineCount || 1

      // ★ 更新消息列表 (res.list)
      const newMessages = res.list
      const lastMsg = messages.value[messages.value.length - 1]
      const newLastMsg = newMessages[newMessages.length - 1]

      if (!lastMsg || (newLastMsg && newLastMsg._id !== lastMsg._id)) {
        messages.value = newMessages
        scrollToBottom()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // 2. 滚动到底部
  const scrollToBottom = () => {
    nextTick(() => {
      if (chatBoxRef.value) {
        chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight
      }
    })
  }

  // 3. 发送消息
  // 3. 发送消息 (稍微改一下，发送成功后也刷新一下人数)
  const handleSend = async () => {
    if (!user.value) return navigateTo('/login')
    if (!inputContent.value.trim()) return

    isSending.value = true
    try {
      const res = await $fetch('/api/fishpond/send', {
        method: 'POST',
        body: { content: inputContent.value }
      })

      if (res.success) {
        // 这里的 res.data 是单条消息
        messages.value.push(res.data)
        inputContent.value = ''
        scrollToBottom()
        // 发送完立即拉取一次，更新人数
        fetchMessages()
      }
    } catch (e) {
      alert('发送失败')
    } finally {
      isSending.value = false
    }
  }

  // 4. 生命周期
  onMounted(() => {
    fetchMessages()
    // 每 2 秒拉取一次
    timer = setInterval(fetchMessages, 2000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  const formatTime = date => new Date(date).toLocaleTimeString()
</script>

<template>
  <div class="fishpond-page">
    <div class="chat-container">
      <!-- 顶部 -->
      <div class="chat-header">
        <div class="title">
          <h2>🐟 摸鱼鱼塘</h2>
          <span class="status">● {{ onlineCount }} 人在线摸鱼</span>
        </div>
        <div class="notice">文明聊天，禁止广告</div>
      </div>

      <!-- 消息列表 -->
      <div class="chat-box" ref="chatBoxRef">
        <div v-if="messages.length === 0" class="empty">还没有人说话，快来抢沙发...</div>

        <div
          v-for="msg in messages"
          :key="msg._id"
          class="msg-row"
          :class="{ mine: msg.sender._id === (user?._id || user?.id) }">
          <!-- 头像部分 (带头像框) -->
          <div class="avatar-wrap">
            <img :src="msg.sender.avatar || '...'" class="avatar" />
            <!-- ★★★ 显示商城买的头像框 ★★★ -->
            <img v-if="msg.sender.theme?.frame" :src="msg.sender.theme.frame" class="frame" />
          </div>

          <!-- 内容部分 -->
          <div class="msg-content-wrap">
            <div class="msg-info">
              <!-- ★★★ 显示商城买的昵称颜色 ★★★ -->
              <span class="nickname" :style="{ color: msg.sender.theme?.color }">
                {{ msg.sender.nickname }}
              </span>
              <span class="time">{{ formatTime(msg.createdAt) }}</span>
            </div>

            <div class="bubble">
              {{ msg.content }}
            </div>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="input-area">
        <input
          v-model="inputContent"
          @keyup.enter="handleSend"
          placeholder="摸鱼时间到，说点什么..."
          class="chat-input"
          :disabled="isSending" />
        <button class="btn-send" @click="handleSend" :disabled="isSending">发送</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .fishpond-page {
    background: #f4f5f5;
    padding-top: 20px;
    min-height: calc(100vh - 60px);
    display: flex;
    justify-content: center;
  }

  .chat-container {
    width: 1100px;
    max-width: 95%;
    background: white;
    border-radius: 8px;
    height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }

  /* 头部 */
  .chat-header {
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
  }
  .chat-header h2 {
    margin: 0;
    font-size: 18px;
    color: #1e80ff;
    display: inline-block;
    margin-right: 10px;
  }
  .status {
    font-size: 12px;
    color: #52c41a;
  }
  .notice {
    font-size: 12px;
    color: #999;
  }

  /* 消息区域 */
  .chat-box {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f9f9f9;
  }

  .msg-row {
    display: flex;
    margin-bottom: 20px;
    align-items: flex-start;
  }
  /* 自己的消息靠右 */
  .msg-row.mine {
    flex-direction: row-reverse;
  }

  /* 头像与头像框 */
  .avatar-wrap {
    position: relative;
    width: 40px;
    height: 40px;
    margin: 0 10px;
    flex-shrink: 0;
  }
  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px solid #fff;
    object-fit: cover;
  }
  .frame {
    position: absolute;
    top: -18%;
    left: -18%;
    width: 136%;
    height: 136%;
    pointer-events: none;
    z-index: 1;
  }

  .msg-content-wrap {
    display: flex;
    flex-direction: column;
    max-width: 70%;
  }
  .msg-row.mine .msg-content-wrap {
    align-items: flex-end;
  }

  .msg-info {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
  }
  .msg-row.mine .msg-info {
    text-align: right;
  }
  .nickname {
    font-weight: bold;
    margin-right: 5px;
    cursor: pointer;
  }
  .time {
    font-size: 10px;
    opacity: 0.8;
  }

  /* 气泡 */
  .bubble {
    background: white;
    padding: 10px 15px;
    border-radius: 8px;
    border-top-left-radius: 0;
    font-size: 14px;
    color: #333;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    line-height: 1.5;
    word-break: break-all;
    position: relative;
  }
  .msg-row.mine .bubble {
    background: #1e80ff;
    color: white;
    border-top-left-radius: 8px;
    border-top-right-radius: 0;
  }

  /* 输入区域 */
  .input-area {
    padding: 15px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
    background: white;
  }
  .chat-input {
    flex: 1;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    outline: none;
    font-size: 14px;
  }
  .chat-input:focus {
    border-color: #1e80ff;
  }
  .btn-send {
    background: #1e80ff;
    color: white;
    border: none;
    padding: 0 25px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
  .btn-send:hover {
    background: #1171ee;
  }
  .btn-send:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .empty {
    text-align: center;
    color: #ccc;
    margin-top: 50px;
    font-size: 13px;
  }
</style>
