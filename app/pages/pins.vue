<!-- pages/pins.vue -->
<script setup>
  const user = useUser()
  const sortType = ref('new')

  // 1. 获取列表 (监听 sortType)
  const { data: pins, refresh } = await useFetch('/api/pins', {
    query: computed(() => ({ sort: sortType.value })),
    deep: true
  })

  // === 右侧数据 ===
  const { data: userStats } = await useFetch('/api/user/stats', { immediate: !!user.value })
  const { data: featuredPins } = await useFetch('/api/pins/featured')

  // ==========================================
  // ★★★ 发布逻辑 (含图片 & 表情) ★★★
  // ==========================================
  const content = ref('')
  const imageList = ref([]) // 存图片 URL
  const isPublishing = ref(false)
  const showEmoji = ref(false)

  // 常用 Emoji 列表
  const emojis = ['😂', '🙌', '👍', '❤️', '🔥', '🥰', '🤔', '👀', '😭', '🎉', '🚀', '🐛', '💻', '☕', '🐶']

  // 插入表情
  const addEmoji = char => {
    content.value += char
    showEmoji.value = false
  }

  // 处理图片上传
  const handleUpload = async e => {
    const file = e.target.files[0]
    if (!file) return
    if (imageList.value.length >= 9) return alert('最多上传9张图片')

    const formData = new FormData()
    formData.append('file', file)

    try {
      // 假设你有一个 /api/upload 接口返回 { url: '/uploads/xxx.jpg' }
      const res = await $fetch('/api/upload', { method: 'POST', body: formData })
      if (res.url) imageList.value.push(res.url)
    } catch (err) {
      alert('图片上传失败')
    } finally {
      e.target.value = '' // 清空 input，允许重复传同一张
    }
  }

  // 删除预览图片
  const removeImage = index => {
    imageList.value.splice(index, 1)
  }

  const handlePublish = async () => {
    if (!user.value) return navigateTo('/login')
    if (!content.value.trim() && imageList.value.length === 0) return alert('内容不能为空')

    isPublishing.value = true
    try {
      await $fetch('/api/pins', {
        method: 'POST',
        body: {
          content: content.value,
          images: imageList.value // ★ 传图片给后端
        }
      })
      // 重置状态
      content.value = ''
      imageList.value = []
      refresh() // 刷新列表
    } catch (e) {
      alert('发布失败')
    } finally {
      isPublishing.value = false
    }
  }

  // ... (点赞、评论、回复等逻辑保持不变，为了节省篇幅省略，请保留你原有的 handleLike, toggleComments, submitComment 等函数) ...
  // === 点赞逻辑 (保留) ===
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
  // === 评论相关逻辑 (保留你之前的 toggleComments, handleReply, submitComment, formatTime) ...
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
</script>

<template>
  <div class="pins-layout">
    <div class="container">
      <!-- 1. 左侧导航 (支持切换) -->
      <aside class="left-col">
        <div class="nav-menu">
          <a class="nav-item" :class="{ active: sortType === 'new' }" @click="sortType = 'new'">🕒 最新</a>
          <a class="nav-item" :class="{ active: sortType === 'hot' }" @click="sortType = 'hot'">🔥 热门</a>
        </div>
      </aside>

      <!-- 2. 中间内容 -->
      <main class="center-col">
        <!-- 发布框 -->
        <div class="publish-box">
          <textarea v-model="content" placeholder="快和掘友一起分享新鲜事！" :disabled="isPublishing"></textarea>

          <!-- 图片预览区域 -->
          <div class="img-preview-grid" v-if="imageList.length > 0">
            <div v-for="(img, idx) in imageList" :key="idx" class="preview-item">
              <img :src="img" />
              <span class="remove-btn" @click="removeImage(idx)">×</span>
            </div>
          </div>

          <div class="action-bar">
            <div class="tools">
              <!-- 表情按钮 -->
              <div class="tool-wrap">
                <span class="tool-btn" @click="showEmoji = !showEmoji">😊 表情</span>
                <!-- 表情弹窗 -->
                <div v-if="showEmoji" class="emoji-picker" @mouseleave="showEmoji = false">
                  <span v-for="e in emojis" :key="e" @click="addEmoji(e)">{{ e }}</span>
                </div>
              </div>

              <!-- 图片按钮 (绑定 input) -->
              <label class="tool-btn">
                🖼️ 图片
                <input type="file" accept="image/*" hidden @change="handleUpload" />
              </label>
            </div>

            <button class="btn-pub" :disabled="isPublishing" @click="handlePublish">
              {{ isPublishing ? '发布中...' : '发布' }}
            </button>
          </div>
        </div>

        <!-- 沸点列表 -->
        <div class="pin-list">
          <div v-for="pin in pins" :key="pin._id" class="pin-card">
            <!-- 头部 -->
            <div class="pin-header">
              <NuxtLink :to="`/user/${pin.author._id}`">
                <img :src="pin.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'" class="avatar" />
              </NuxtLink>
              <div class="info">
                <NuxtLink :to="`/user/${pin.author._id}`" class="name">{{ pin.author?.nickname }}</NuxtLink>
                <span class="meta">
                  <!-- 显示职位或时间 -->
                  {{ pin.author?.jobTitle || '前端工程师' }} · {{ formatTime(pin.createdAt) }}
                </span>
              </div>
            </div>

            <!-- 内容 -->
            <div class="pin-content">{{ pin.content }}</div>

            <!-- ★★★ 图片展示 (九宫格) ★★★ -->
            <div class="pin-images" v-if="pin.images && pin.images.length > 0">
              <div
                v-for="(img, idx) in pin.images"
                :key="idx"
                class="img-item"
                :class="{ single: pin.images.length === 1 }">
                <!-- 这里可以用 v-viewer 或简单的点击放大，暂时只展示 -->
                <img :src="img" />
              </div>
            </div>

            <!-- 操作栏 (保持不变) -->
            <div class="pin-actions">
              <div class="action-item"><span class="icon">↗</span> 分享</div>
              <div class="action-item" :class="{ active: pin.showComments }" @click="toggleComments(pin)">
                <span class="icon">💬</span> {{ pin.commentCount || '评论' }}
              </div>
              <div class="action-item" :class="{ active: pin.isLiked }" @click="handleLike(pin)">
                <span class="icon">{{ pin.isLiked ? '❤️' : '👍' }}</span> {{ pin.likeCount || '点赞' }}
              </div>
            </div>

            <!-- 评论区 (保持不变) -->
            <div class="comment-area" v-if="pin.showComments">
              <!-- ... 复用之前的评论区代码 ... -->
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

      <!-- 3. 右侧信息 (已对接) -->
      <aside class="right-col">
        <div class="user-card" v-if="user">
          <div class="uc-header">
            <!-- ★★★ 修改点：头像增加跳转 ★★★ -->
            <NuxtLink :to="`/user/${user._id || user.id}`" class="avatar-link">
              <img :src="user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'" class="uc-avatar" />
            </NuxtLink>

            <div class="uc-info">
              <!-- ★★★ 修改点：昵称增加跳转 ★★★ -->
              <NuxtLink :to="`/user/${user._id || user.id}`" class="uc-name">
                {{ user.nickname }}
              </NuxtLink>
              <div class="uc-job">{{ user.jobTitle || '前端工程师' }}</div>
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
  </div>
</template>

<style scoped>
  /* 原有布局样式保持不变 ... */
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

  /* 左侧导航 */
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

  /* 发布框增强样式 */
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

  /* 图片预览网格 */
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

  /* 表情弹窗 */
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

  /* 沸点列表 */
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

  /* 沸点图片展示 (简单的网格) */
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
  } /* 单张图显示大一点 */

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

  /* 评论区样式 (复用之前的样式，略) */
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

  /* 右侧 */
  .user-card,
  .featured-card,
  .topic-card {
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
  }
  .uc-job {
    font-size: 12px;
    color: #999;
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
  .topic-item {
    color: #1e80ff;
    font-size: 13px;
    margin-bottom: 5px;
    cursor: pointer;
  }
  /* 修改 pages/pins.vue 的 <style scoped> */

  /* 右侧头像链接 */
  .avatar-link {
    display: block; /* 消除图片底部间隙 */
    cursor: pointer;
  }

  /* 右侧昵称链接 */
  .uc-name {
    font-weight: 600;
    font-size: 16px;
    color: #252933;
    text-decoration: none; /* 去掉下划线 */
    display: block;
    transition: 0.2s;
    cursor: pointer;
  }

  /* 悬停效果 */
  .uc-name:hover {
    color: #1e80ff; /* 悬停变蓝 */
  }

  /* 保持原有样式... */
  .uc-job {
    font-size: 13px;
    color: #8a919f;
    margin-top: 4px;
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
</style>
