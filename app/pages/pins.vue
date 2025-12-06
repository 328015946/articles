<!-- pages/pins.vue -->
<script setup>
  const user = useUser()
  const sortType = ref('new')

  // 1. 获取列表
  const { data: pins, refresh } = await useFetch('/api/pins', {
    query: computed(() => ({ sort: sortType.value })),
    deep: true
  })

  // === 右侧数据 ===
  const { data: userStats } = await useFetch('/api/users/stats', { immediate: !!user.value })
  const { data: featuredPins } = await useFetch('/api/pins/featured')

  // === 发布逻辑 ===
  const content = ref('')
  const imageList = ref([])
  const isPublishing = ref(false)
  const showEmoji = ref(false)
  const emojis = ['😂', '🙌', '👍', '❤️', '🔥', '🥰', '🤔', '👀', '😭', '🎉', '🚀', '🐛', '💻', '☕', '🐶']

  const addEmoji = char => {
    content.value += char
    showEmoji.value = false
  }

  const handleUpload = async e => {
    const file = e.target.files[0]
    if (!file) return
    if (imageList.value.length >= 9) return alert('最多上传9张图片')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await $fetch('/api/upload', { method: 'POST', body: formData })
      if (res.url) imageList.value.push(res.url)
    } catch (err) {
      alert('图片上传失败')
    } finally {
      e.target.value = ''
    }
  }

  const removeImage = index => imageList.value.splice(index, 1)
  // === 新增：红包配置 ===
  const showRpInput = ref(false) // 控制输入框显示
  const rpConfig = ref({
    coin: '', // 总金额
    count: '' // 包的个数
  })
  const handlePublish = async () => {
    if (!user.value) return navigateTo('/login')
    // 基础校验
    if (!content.value.trim() && imageList.value.length === 0) return alert('内容不能为空')

    // ★★★ 新增：红包校验 ★★★
    let redPacketData = null
    if (showRpInput.value) {
      const coin = Number(rpConfig.value.coin)
      const count = Number(rpConfig.value.count)

      // 简单的校验
      if (!coin || !count) return alert('请输入红包金额和个数')
      if (coin < count) return alert('每人至少分 1 个牛马币')
      if (coin > (userStats.value?.coin || 0)) return alert('余额不足，请去搬砖')

      redPacketData = { coin, count }
    }

    isPublishing.value = true
    try {
      const res = await $fetch('/api/pins', {
        method: 'POST',
        body: {
          content: content.value,
          images: imageList.value,
          redPacket: redPacketData // ★ 传给后端
        }
      })

      alert(res.message || '发布成功')

      // 重置所有状态
      content.value = ''
      imageList.value = []
      showRpInput.value = false
      rpConfig.value = { coin: '', count: '' }

      refresh()

      // 刷新余额 (因为发红包扣钱了)
      const { data: newStats } = await useFetch('/api/users/stats')
      if (userStats.value && newStats.value) {
        userStats.value.coin = newStats.value.coin
      }
    } catch (e) {
      console.error(e)
      alert(e.data?.message || '发布失败')
    } finally {
      isPublishing.value = false
    }
  }

  // === 图片预览逻辑 (新增) ===
  const showViewer = ref(false)
  const previewImage = ref('')

  const openPreview = url => {
    previewImage.value = url
    showViewer.value = true
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden'
  }

  const closePreview = () => {
    showViewer.value = false
    previewImage.value = ''
    if (typeof document !== 'undefined') document.body.style.overflow = ''
  }

  // === 互动逻辑 (保持不变) ===
  const handleLike = async pin => {
    if (!user.value) return navigateTo('/login')
    const oldIsLiked = pin.isLiked
    pin.isLiked = !pin.isLiked
    pin.likeCount = pin.isLiked ? pin.likeCount + 1 : pin.likeCount - 1
    try {
      await $fetch('/api/pins/like', { method: 'POST', body: { id: pin._id } })
    } catch (e) {
      pin.isLiked = oldIsLiked
      pin.likeCount = oldIsLiked ? pin.likeCount + 1 : pin.likeCount - 1
    }
  }

  const toggleComments = async pin => {
    pin.showComments = !pin.showComments
    if (pin.showComments && !pin.commentsList) {
      pin.commentsLoading = true
      try {
        const res = await $fetch(`/api/pins/${pin._id}/comments`)
        pin.commentsList = res
      } catch (e) {
      } finally {
        pin.commentsLoading = false
      }
    }
  }

  const handleReply = (pin, comment) => {
    if (!user.value) return navigateTo('/login')
    pin.replyTarget = comment
    if (!pin.showComments) toggleComments(pin)
  }

  const submitComment = async pin => {
    if (!user.value) return navigateTo('/login')
    if (!pin.inputContent?.trim()) return alert('写点什么吧')
    pin.submitting = true
    try {
      const payload = {
        pinId: pin._id,
        content: pin.inputContent,
        parentId: pin.replyTarget ? pin.replyTarget._id : null,
        replyTo: pin.replyTarget ? pin.replyTarget.user._id : null
      }
      const newComment = await $fetch('/api/pins/comment', { method: 'POST', body: payload })
      if (!pin.commentsList) pin.commentsList = []
      pin.commentsList.unshift(newComment)
      pin.commentCount++
      pin.inputContent = ''
      pin.replyTarget = null
    } catch (e) {
      alert('评论失败')
    } finally {
      pin.submitting = false
    }
  }

  const formatTime = dateStr => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString()
  }
  const grabRedPacket = async pin => {
    if (!user.value) return navigateTo('/login')

    try {
      const res = await $fetch('/api/pins/grab', {
        method: 'POST',
        body: { pinId: pin._id }
      })

      if (res.success) {
        alert(`🎉 ${res.message}`)
        // 手动更新前端显示
        pin.redPacket.remainCount--
        // 刷新一下个人余额
        const { data } = await useFetch('/api/user/stats')
        if (userStats.value) userStats.value.coin = data.value.coin
      } else {
        alert(res.message)
      }
    } catch (e) {
      alert('网络拥堵，没抢到')
    }
  }
</script>

<template>
  <div class="pins-layout">
    <div class="container">
      <!-- 左侧 -->
      <aside class="left-col">
        <div class="nav-menu">
          <a class="nav-item" :class="{ active: sortType === 'new' }" @click="sortType = 'new'">🕒 最新</a>
          <a class="nav-item" :class="{ active: sortType === 'hot' }" @click="sortType = 'hot'">🔥 热门</a>
        </div>
      </aside>

      <!-- 中间 -->
      <main class="center-col">
        <!-- 发布框 -->
        <div class="publish-box">
          <textarea v-model="content" placeholder="快和掘友一起分享新鲜事！" :disabled="isPublishing"></textarea>
          <div class="img-preview-grid" v-if="imageList.length > 0">
            <div v-for="(img, idx) in imageList" :key="idx" class="preview-item">
              <img :src="img" />
              <span class="remove-btn" @click="removeImage(idx)">×</span>
            </div>
          </div>
          <!-- ★★★ 新增：红包设置面板 (放在 action-bar 上面) ★★★ -->
          <div v-if="showRpInput" class="rp-settings">
            <div class="rp-row">
              <span class="rp-label">总金额</span>
              <input type="number" v-model="rpConfig.coin" placeholder="0" class="rp-input" />
              <span class="rp-unit">牛马币</span>
            </div>
            <div class="rp-row">
              <span class="rp-label">红包个数</span>
              <input type="number" v-model="rpConfig.count" placeholder="0" class="rp-input" />
              <span class="rp-unit">个</span>
            </div>
            <div class="rp-tip">
              当前余额: <span class="highlight">{{ userStats?.coin || 0 }}</span>
            </div>
          </div>
          <div class="action-bar">
            <div class="tools">
              <!-- 表情按钮 -->
              <div class="tool-wrap">
                <span class="tool-btn" @click="showEmoji = !showEmoji">😊 表情</span>
                <div v-if="showEmoji" class="emoji-picker" @mouseleave="showEmoji = false">
                  <span v-for="e in emojis" :key="e" @click="addEmoji(e)">{{ e }}</span>
                </div>
              </div>

              <!-- 图片按钮 -->
              <label class="tool-btn">
                🖼️ 图片
                <input type="file" accept="image/*" hidden @change="handleUpload" />
              </label>

              <!-- ★★★ 新增：红包开关 ★★★ -->
              <span class="tool-btn" :class="{ active: showRpInput }" @click="showRpInput = !showRpInput">
                🧧 发红包
              </span>
            </div>

            <button class="btn-pub" :disabled="isPublishing" @click="handlePublish">发布</button>
          </div>
        </div>

        <!-- 列表 -->
        <div class="pin-list">
          <div v-for="pin in pins" :key="pin._id" class="pin-card">
            <div class="pin-header">
              <NuxtLink :to="`/user/${pin.author._id}`">
                <img :src="pin.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'" class="avatar" />
              </NuxtLink>
              <div class="info">
                <NuxtLink :to="`/user/${pin.author._id}`" class="name">{{ pin.author?.nickname }}</NuxtLink>
                <span class="meta">{{ pin.author?.jobTitle || '' }} · {{ formatTime(pin.createdAt) }}</span>
              </div>
            </div>

            <div class="pin-content">{{ pin.content }}</div>
            <!-- 在 pin-content 下面添加 -->
            <div v-if="pin.redPacket && pin.redPacket.totalCoin > 0" class="red-packet-box">
              <div class="rp-left">
                <span class="rp-icon">🧧</span>
              </div>
              <div class="rp-center">
                <div class="rp-title">牛马福利红包</div>
                <div class="rp-status">
                  <span v-if="pin.redPacket.remainCount > 0">
                    剩余 {{ pin.redPacket.remainCount }}/{{ pin.redPacket.totalCount }} 个
                  </span>
                  <span v-else>已抢光</span>
                </div>
              </div>
              <button class="rp-btn" :class="{ disabled: pin.redPacket.remainCount <= 0 }" @click="grabRedPacket(pin)">
                {{ pin.redPacket.remainCount > 0 ? '抢' : '空' }}
              </button>
            </div>
            <!-- 图片区 (加了点击事件) -->
            <div class="pin-images" v-if="pin.images && pin.images.length > 0">
              <div
                v-for="(img, idx) in pin.images"
                :key="idx"
                class="img-item"
                :class="{ single: pin.images.length === 1 }"
                @click.stop="openPreview(img)">
                <img :src="img" />
              </div>
            </div>

            <div class="pin-actions">
              <div class="action-item"><span class="icon">↗</span> 分享</div>
              <div class="action-item" :class="{ active: pin.showComments }" @click="toggleComments(pin)">
                <span class="icon">💬</span> {{ pin.commentCount || '评论' }}
              </div>
              <div class="action-item" :class="{ active: pin.isLiked }" @click="handleLike(pin)">
                <span class="icon">{{ pin.isLiked ? '❤️' : '👍' }}</span> {{ pin.likeCount || '点赞' }}
              </div>
            </div>

            <div class="comment-area" v-if="pin.showComments">
              <div class="comment-input-box" v-if="user">
                <img :src="user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'" class="my-avatar" />
                <div class="input-wrapper">
                  <textarea
                    v-model="pin.inputContent"
                    :placeholder="pin.replyTarget ? `回复 @${pin.replyTarget.user?.nickname} :` : '输入评论...'"
                    rows="1"></textarea>
                  <div class="input-actions" v-if="pin.inputContent">
                    <button @click="submitComment(pin)" :disabled="pin.submitting">发送</button>
                  </div>
                </div>
              </div>
              <div class="comment-list">
                <div v-for="c in pin.commentsList" :key="c._id" class="c-item">
                  <img :src="c.user?.avatar" class="c-avatar" />
                  <div class="c-content">
                    <div class="c-user">
                      {{ c.user?.nickname }}
                      <span v-if="c.replyTo" style="color: #8a919f; margin: 0 4px">回复</span>
                      <span v-if="c.replyTo" style="color: #1e80ff">{{ c.replyTo.nickname }}</span>
                    </div>
                    <div class="c-text">{{ c.content }}</div>
                    <div class="c-meta">
                      {{ formatTime(c.createdAt) }}
                      <span class="c-action" @click="handleReply(pin, c)">回复</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 右侧 -->
      <aside class="right-col">
        <div class="user-card" v-if="user">
          <div class="uc-header">
            <NuxtLink :to="`/user/${user._id || user.id}`" class="avatar-link">
              <img :src="user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'" class="uc-avatar" />
            </NuxtLink>
            <div class="uc-info">
              <NuxtLink :to="`/user/${user._id || user.id}`" class="uc-name">{{ user.nickname }}</NuxtLink>
              <div class="uc-job">{{ user.jobTitle || '' }}</div>
            </div>
          </div>
          <div class="uc-stats">
            <div class="stat-item">
              <div class="count">{{ userStats?.pinCount || 0 }}</div>
              <div class="label">沸点</div>
            </div>
            <div class="stat-item">
              <div class="count">{{ userStats?.followingCount || 0 }}</div>
              <div class="label">关注</div>
            </div>
            <div class="stat-item">
              <div class="count">{{ userStats?.followerCount || 0 }}</div>
              <div class="label">关注者</div>
            </div>
          </div>
        </div>
        <div class="featured-card">
          <div class="card-title">精选沸点</div>
          <div class="featured-list">
            <NuxtLink v-for="pin in featuredPins" :key="pin._id" to="/pins" class="featured-item">
              <div class="f-content">{{ pin.content.substring(0, 30) }}...</div>
              <div class="f-meta">{{ pin.likeCount }}赞 · {{ pin.commentCount }}评论</div>
            </NuxtLink>
          </div>
        </div>
      </aside>
    </div>

    <!-- ★★★ 全屏图片查看器 ★★★ -->
    <div v-if="showViewer" class="image-viewer" @click="closePreview">
      <div class="viewer-content">
        <img :src="previewImage" @click.stop />
        <span class="close-btn" @click="closePreview">×</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 原有样式保持不变... */
  .pins-layout {
    background: #f4f5f5;
    min-height: 100vh;
    padding-top: 20px;
  }
  .container {
    max-width: 1300px;
    margin: 0 auto;
    display: grid;
    gap: 20px;
    grid-template-columns: 180px 1fr 240px;
    align-items: start;
  }
  /* ... (复制你之前的 nav-menu, publish-box 等样式) ... */
  .nav-menu {
    background: white;
    border-radius: 4px;
    padding: 8px;
    position: sticky;
    top: 80px;
  }
  .nav-item {
    display: block;
    padding: 10px 20px;
    color: #515767;
    cursor: pointer;
    border-radius: 4px;
    margin-bottom: 2px;
  }
  .nav-item:hover {
    background: #f4f5f5;
  }
  .nav-item.active {
    background: #eaf2ff;
    color: #1e80ff;
    font-weight: 500;
  }

  .publish-box {
    background: white;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
  }
  .publish-box textarea {
    width: 100%;
    height: 80px;
    border: 1px solid #f0f0f0;
    background: #f2f3f5;
    padding: 10px;
    border-radius: 4px;
    resize: none;
    outline: none;
    box-sizing: border-box;
  }
  .publish-box textarea:focus {
    background: white;
    border-color: #1e80ff;
  }
  .img-preview-grid {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 10px;
  }
  .preview-item {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 4px;
    overflow: hidden;
  }
  .preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .remove-btn {
    position: absolute;
    top: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 18px;
    cursor: pointer;
    font-size: 14px;
  }
  .action-bar {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    align-items: center;
  }
  .tools {
    display: flex;
    align-items: center;
    position: relative;
  }
  .tool-wrap {
    position: relative;
  }
  .tool-btn {
    cursor: pointer;
    color: #1e80ff;
    font-size: 14px;
    margin-right: 15px;
    display: inline-block;
  }
  .emoji-picker {
    position: absolute;
    top: 25px;
    left: 0;
    background: white;
    border: 1px solid #ddd;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 10px;
    width: 200px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    border-radius: 4px;
    z-index: 10;
  }
  .emoji-picker span {
    cursor: pointer;
    padding: 4px;
    font-size: 18px;
  }
  .emoji-picker span:hover {
    background: #f0f0f0;
    border-radius: 4px;
  }
  .btn-pub {
    background: #1e80ff;
    color: white;
    border: none;
    padding: 6px 24px;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-pub:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pin-card {
    background: white;
    padding: 20px 20px 0 20px;
    border-radius: 4px;
    margin-bottom: 10px;
  }
  .pin-header {
    display: flex;
    margin-bottom: 10px;
  }
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 12px;
  }
  .name {
    font-weight: 600;
    color: #252933;
    font-size: 15px;
    text-decoration: none;
  }
  .meta {
    font-size: 12px;
    color: #8a919f;
    margin-top: 2px;
  }
  .pin-content {
    font-size: 15px;
    color: #17181a;
    line-height: 1.6;
    margin-bottom: 10px;
    white-space: pre-wrap;
  }
  .pin-images {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .img-item {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    overflow: hidden;
    cursor: zoom-in;
  }
  .img-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .img-item.single {
    width: 200px;
    height: auto;
    max-height: 300px;
  }
  .pin-actions {
    display: flex;
    border-top: 1px solid #e4e6eb;
    margin: 0 -20px;
  }
  .action-item {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    color: #8a919f;
    cursor: pointer;
  }
  .action-item:hover {
    color: #515767;
  }
  .action-item.active {
    color: #1e80ff;
  }

  .comment-area {
    background: #f9fafb;
    margin: 0 -20px;
    padding: 20px;
    border-top: 1px solid #e4e6eb;
  }
  .comment-input-box {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }
  .my-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }
  .input-wrapper {
    flex: 1;
  }
  .input-wrapper textarea {
    width: 100%;
    border: 1px solid #ddd;
    padding: 5px;
    border-radius: 4px;
    font-size: 13px;
  }
  .input-actions button {
    float: right;
    margin-top: 5px;
    background: #1e80ff;
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 2px;
    cursor: pointer;
  }
  .c-item {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }
  .c-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }
  .c-content {
    flex: 1;
    font-size: 13px;
  }
  .c-user {
    font-weight: bold;
    margin-bottom: 4px;
  }
  .c-meta {
    color: #999;
    font-size: 12px;
    margin-top: 4px;
  }
  .c-action {
    margin-left: 10px;
    color: #1e80ff;
    cursor: pointer;
  }

  .user-card,
  .featured-card {
    background: white;
    border-radius: 4px;
    margin-bottom: 20px;
    padding: 15px;
  }
  .uc-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  .uc-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 10px;
  }
  .uc-name {
    font-weight: bold;
    font-size: 16px;
    color: #252933;
    text-decoration: none;
    cursor: pointer;
    display: block;
  }
  .uc-name:hover {
    color: #1e80ff;
  }
  .uc-job {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
  .uc-stats {
    display: flex;
    justify-content: space-around;
    text-align: center;
  }
  .stat-item .count {
    font-weight: bold;
    font-size: 16px;
  }
  .stat-item .label {
    font-size: 12px;
    color: #999;
  }
  .avatar-link {
    display: block;
    cursor: pointer;
  }
  .card-title {
    font-weight: bold;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    margin-bottom: 10px;
    font-size: 14px;
  }
  .featured-item {
    display: block;
    margin-bottom: 10px;
    text-decoration: none;
    color: #333;
  }
  .f-content {
    font-size: 13px;
    margin-bottom: 2px;
  }
  .f-meta {
    font-size: 12px;
    color: #999;
  }

  @media (max-width: 900px) {
    .container {
      grid-template-columns: 1fr;
    }
    .left-col,
    .right-col {
      display: none;
    }
  }

  /* === 新增：全屏查看器样式 === */
  .image-viewer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: zoom-out;
    animation: fadeIn 0.2s ease;
  }
  .viewer-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .viewer-content img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 4px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    cursor: default;
  }
  .viewer-content .close-btn {
    position: absolute;
    top: -40px;
    right: -40px;
    color: white;
    font-size: 40px;
    cursor: pointer;
    opacity: 0.8;
    transition: 0.3s;
  }
  .viewer-content .close-btn:hover {
    opacity: 1;
    transform: rotate(90deg);
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .red-packet-box {
    background: #ff4d4f;
    color: white;
    border-radius: 8px;
    padding: 10px 15px;
    margin: 10px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .rp-icon {
    font-size: 30px;
    margin-right: 10px;
  }
  .rp-center {
    flex: 1;
  }
  .rp-title {
    font-weight: bold;
    font-size: 15px;
  }
  .rp-status {
    font-size: 12px;
    opacity: 0.8;
  }
  .rp-btn {
    background: #f9cb28;
    color: #d33c3e;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: 0.2s;
  }
  .rp-btn:hover {
    transform: scale(1.1);
  }
  .rp-btn.disabled {
    background: #e0e0e0;
    color: #999;
    cursor: not-allowed;
  }

  /* 红包设置面板 */
  .rp-settings {
    background: #fff7e6;
    border: 1px solid #ffd591;
    padding: 15px;
    border-radius: 4px;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .rp-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .rp-label {
    width: 70px;
    font-size: 14px;
    color: #333;
  }

  .rp-input {
    width: 100px;
    padding: 5px 10px;
    border: 1px solid #ffc069;
    border-radius: 4px;
    margin-right: 10px;
    outline: none;
  }
  .rp-input:focus {
    border-color: #ff9c6e;
    box-shadow: 0 0 0 2px rgba(255, 156, 110, 0.2);
  }

  .rp-unit {
    font-size: 13px;
    color: #888;
  }

  .rp-tip {
    font-size: 12px;
    color: #8a919f;
    margin-top: 5px;
  }
  .highlight {
    color: #ff4d4f;
    font-weight: bold;
    font-size: 14px;
  }

  /* 激活状态的按钮 */
  .tool-btn.active {
    color: #ff4d4f;
    font-weight: bold;
  }
</style>
