<!-- pages/article/[id].vue -->
<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { MdPreview, MdCatalog } from 'md-editor-v3'
  import 'md-editor-v3/lib/style.css'

  const route = useRoute()
  const user = useUser()
  const articleId = route.params.id
  const editorId = 'preview-only'

  // === 1. 获取文章详情 ===
  const { data: article, refresh: refreshArticle } = await useFetch(`/api/articles/${articleId}`)

  // === 2. 获取评论列表 ===
  const { data: comments, refresh: refreshComments } = await useFetch('/api/comments', {
    query: { articleId: articleId }
  })

  // === 3. 点赞逻辑 ===
  const isLiked = computed(() => {
    // 1. 先判断文章是否存在
    if (!user.value || !article.value) return false

    // 2. ★★★ 关键修复：加一个 || [] 防止 likes 是 undefined ★★★
    const likes = article.value.likes || []

    return likes.some(like => {
      const likeId = typeof like === 'string' ? like : like._id
      return likeId === (user.value.id || user.value._id)
    })
  })

  const handleLike = async () => {
    if (!user.value) return alert('请先登录后再点赞哦~')
    try {
      await $fetch('/api/articles/like', {
        method: 'POST',
        body: { articleId: article.value._id }
      })
      refreshArticle()
    } catch (err) {
      alert('操作失败')
    }
  }

  // === 4. 评论逻辑 ===
  const commentContent = ref('')
  const isSubmitting = ref(false)

  const submitComment = async () => {
    if (!user.value) return alert('请先登录')
    if (!commentContent.value.trim()) return alert('写点什么吧...')
    isSubmitting.value = true
    try {
      await $fetch('/api/comments', {
        method: 'POST',
        body: { articleId: article.value._id, content: commentContent.value }
      })
      commentContent.value = ''
      refreshComments()
    } catch (err) {
      alert('评论失败')
    } finally {
      isSubmitting.value = false
    }
  }

  // 格式化日期
  const formatDate = dateStr => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // === 5. 目录滚动逻辑 (修正版) ===
  const scrollElement = ref(null)

  onMounted(() => {
    // 修正：让目录控制整个网页的滚动条，而不是某个 div 内部
    scrollElement.value = document.documentElement
  })

  // pages/article/[id].vue 的 script setup 部分

  // ... 其他代码 ...

  // 暴力跳转
  // pages/article/[id].vue

  const handleCatalogClick = (e, link) => {
    e.preventDefault()

    // 🔍 调试：你可以先在控制台打印一下 link 看看里面有啥
    console.log('点击了目录:', link)

    // ★★★ 核心修改 ★★★
    // md-editor 生成的 ID 默认等于标题文字
    // 如果 link.id 是空的，我们就用 link.text
    const targetId = link.id || link.text

    // 获取目标元素
    const heading = document.getElementById(targetId)

    if (heading) {
      // 执行滚动
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      console.warn('找不到目标元素，ID为:', targetId)
    }
  }

  // === 4. 收藏逻辑 (新增) ===
  const isCollected = ref(article.value?.isCollected || false)
  const collectionCount = ref(0) // 如果你想显示收藏数，需要后端支持，这里暂时本地维护

  // 监听数据变化 (防止第一次加载没取到)
  watch(
    () => article.value,
    newVal => {
      if (newVal) {
        isCollected.value = newVal.isCollected
      }
    }
  )

  const handleCollect = async () => {
    if (!user.value) return alert('请先登录')
    try {
      const res = await $fetch(`/api/articles/${articleId}/collect`, { method: 'POST' })
      // 更新状态
      isCollected.value = res.isCollected
      // 更新数量 (简单的 UI 欺骗，实际应该重新 fetch)
      if (res.isCollected) collectionCount.value++
      else collectionCount.value--

      // 提示 (可选，现在样式变了可以去掉 alert)
      // alert(res.isCollected ? '收藏成功！' : '已取消收藏')
    } catch (e) {
      alert('操作失败')
    }
  }
</script>

<template>
  <div class="scroll-container" ref="pageRef">
    <div class="page-container">
      <div class="main-content">
        <article class="article-wrapper" v-if="article">
          <header class="article-header">
            <div class="breadcrumb">
              <NuxtLink to="/">首页</NuxtLink>
              <span class="sep">/</span>
              <span v-if="article.category">{{ article.category.name }}</span>
            </div>
            <h1 class="article-title">{{ article.title }}</h1>
            <div class="article-meta">
              <span class="author">
                <span class="avatar-tiny">{{ article.author?.nickname?.[0] || '站' }}</span>
                <NuxtLink :to="`/user/${article.author._id}`" class="author-name">
                  {{ article.author?.nickname }}
                </NuxtLink>
              </span>
              <span class="dot">·</span>
              <time>{{ formatDate(article.createdAt) }}</time>
              <span class="dot">·</span>
              <span>{{ article.views }} 阅读</span>
            </div>
          </header>

          <div class="markdown-body">
            <MdPreview :editorId="editorId" :modelValue="article.content" showCodeRowNumber />
          </div>

          <!-- template 中的 .like-section 部分 -->
          <div class="like-section">
            <!-- 点赞按钮 -->
            <button class="btn-action btn-like" :class="{ active: isLiked }" @click="handleLike">
              <span class="icon">❤</span>
              <span>{{ isLiked ? '已赞' : '点赞' }}</span>
              <span class="count" v-if="article.likes.length > 0">{{ article.likes.length }}</span>
            </button>

            <!-- 收藏按钮 (修改后) -->
            <button class="btn-action btn-collect" :class="{ active: isCollected }" @click="handleCollect">
              <span class="icon">⭐</span>
              <span>{{ isCollected ? '已收藏' : '收藏' }}</span>
              <!-- 如果后端没返回收藏数，这个 count 可以先不显示 -->
              <span class="count" v-if="collectionCount > 0">{{ collectionCount }}</span>
            </button>
          </div>
        </article>

        <section class="comment-section">
          <div class="section-title">
            <h3>全部评论</h3>
            <span class="count">{{ comments?.length || 0 }}</span>
          </div>
          <div class="comment-form" v-if="user">
            <div class="form-header">
              <span class="nickname">发布为：{{ user.nickname }}</span>
            </div>
            <textarea v-model="commentContent" placeholder="写下你的想法..." rows="3"></textarea>
            <div class="form-footer">
              <button @click="submitComment" class="btn-submit" :disabled="isSubmitting">
                {{ isSubmitting ? '发送中...' : '发布评论' }}
              </button>
            </div>
          </div>
          <div v-else class="login-tip"><NuxtLink to="/login">登录</NuxtLink> 后参与讨论</div>
          <div class="comment-list">
            <div v-for="c in comments" :key="c._id" class="comment-item">
              <div class="avatar">{{ c.author?.nickname?.[0] || '友' }}</div>
              <div class="comment-body">
                <div class="comment-user">
                  <span class="name">{{ c.author?.nickname || '未知用户' }}</span>
                  <span class="time">{{ formatDate(c.createdAt) }}</span>
                </div>
                <div class="comment-text">{{ c.content }}</div>
              </div>
            </div>
            <div v-if="comments?.length === 0" class="empty-state">暂无评论，快来抢沙发~</div>
          </div>
        </section>
      </div>

      <aside class="sidebar-col">
        <div class="toc-card">
          <div class="toc-header"><h3>📖 文章目录</h3></div>
          <!-- 修正：绑定正确的 scrollElement -->
          <MdCatalog
            :editorId="editorId"
            :scrollElement="scrollElement"
            :scrollElementOffset="80"
            @onClick="handleCatalogClick" />
        </div>
      </aside>
    </div>
  </div>
</template>

<!-- 全局样式：平滑滚动 -->
<style>
  html {
    scroll-behavior: smooth;
  }
</style>

<style scoped>
  /* 原有的 scoped 样式保持不变 */
  /* ★★★ 终极 CSS 修复方案 ★★★ */
  /* 给所有标题加一个“隐形”的顶部外边距，专门用来抵消导航栏高度 */
  /* 这样 scrollIntoView 跳过去的时候，自动会留出空隙 */
  .markdown-body h1,
  .markdown-body h2,
  .markdown-body h3,
  .markdown-body h4,
  .markdown-body h5,
  .markdown-body h6 {
    scroll-margin-top: 90px; /* 导航栏高度 + 一点间隙 */
  }
  .page-container {
    max-width: 1300px;
    margin: 0 auto;
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 30px;
    align-items: start;
  }
  @media (max-width: 900px) {
    .page-container {
      grid-template-columns: 1fr;
    }
    .sidebar-col {
      display: none;
    }
  }
  .article-wrapper {
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    margin-bottom: 30px;
  }
  .article-header {
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  .breadcrumb {
    font-size: 14px;
    color: #999;
    margin-bottom: 15px;
  }
  .breadcrumb a {
    color: #666;
    transition: 0.2s;
  }
  .breadcrumb a:hover {
    color: #764ba2;
  }
  .sep {
    margin: 0 8px;
    color: #ccc;
  }
  .article-title {
    font-size: 2.2rem;
    color: #222;
    margin: 0 0 20px 0;
    line-height: 1.4;
  }
  .article-meta {
    display: flex;
    align-items: center;
    color: #888;
    font-size: 14px;
  }
  .author {
    display: flex;
    align-items: center;
    color: #333;
    font-weight: 500;
    margin-right: 5px;
  }
  .avatar-tiny {
    width: 24px;
    height: 24px;
    background: #764ba2;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
  }
  .dot {
    margin: 0 10px;
    font-weight: bold;
    color: #ddd;
  }
  .like-section {
    text-align: center;
    margin-top: 50px;
  }
  .btn-like {
    padding: 10px 30px;
    border-radius: 50px;
    border: 1px solid #ff4757;
    background: white;
    color: #ff4757;
    font-size: 16px;
    cursor: pointer;
    transition: 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .btn-like:hover {
    background: #fff1f0;
  }
  .btn-like.active {
    background: #ff4757;
    color: white;
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
  }
  .like-section {
    text-align: center;
    margin-top: 50px;
    display: flex; /* 让两个按钮横向排列 */
    justify-content: center;
    gap: 20px; /* 按钮间距 */
  }

  /* 公共按钮样式 */
  .btn-action {
    padding: 10px 30px;
    border-radius: 50px;
    font-size: 16px;
    cursor: pointer;
    transition: 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: white;
  }
  /* 收藏按钮 (黄色/橙色) */
  .btn-collect {
    border: 1px solid #ffa502; /* 橙黄色 */
    color: #ffa502;
  }
  .btn-collect:hover {
    background: #fffbf0;
  }
  .btn-collect.active {
    background: #ffa502;
    color: white;
    box-shadow: 0 4px 12px rgba(255, 165, 2, 0.3);
  }
  .comment-section {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    font-size: 18px;
    font-weight: bold;
    border-left: 4px solid #764ba2;
    padding-left: 10px;
  }
  .section-title .count {
    font-size: 14px;
    color: #999;
    font-weight: normal;
  }
  .comment-form {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
  }
  .form-header {
    font-size: 13px;
    color: #666;
    margin-bottom: 10px;
  }
  textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    resize: vertical;
    box-sizing: border-box;
    transition: 0.2s;
    outline: none;
  }
  textarea:focus {
    border-color: #764ba2;
    background: white;
  }
  .form-footer {
    margin-top: 10px;
    text-align: right;
  }
  .btn-submit {
    background: #764ba2;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.2s;
  }
  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .login-tip {
    text-align: center;
    padding: 40px;
    background: #f9f9f9;
    border-radius: 8px;
    color: #666;
  }
  .login-tip a {
    color: #764ba2;
    font-weight: bold;
    text-decoration: underline;
  }
  .comment-item {
    display: flex;
    gap: 15px;
    margin-bottom: 25px;
  }
  .avatar {
    width: 40px;
    height: 40px;
    background: #e0e0e0;
    color: #666;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    flex-shrink: 0;
    font-size: 14px;
  }
  .comment-body {
    flex: 1;
  }
  .comment-user {
    margin-bottom: 5px;
  }
  .comment-user .name {
    font-weight: bold;
    color: #333;
    margin-right: 10px;
    font-size: 14px;
  }
  .comment-user .time {
    color: #aaa;
    font-size: 12px;
  }
  .comment-text {
    color: #444;
    line-height: 1.6;
    font-size: 14px;
  }
  .empty-state {
    text-align: center;
    color: #ccc;
    padding: 30px;
  }
  .sidebar-col {
    position: sticky;
    top: 80px;
  }
  .toc-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
  .toc-header {
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
  .toc-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }
  :deep(.md-editor-catalog-active > span) {
    color: #764ba2 !important;
    font-weight: bold;
  }
  :deep(.md-editor-catalog-link span:hover) {
    color: #764ba2 !important;
  }
  /* 目录高亮样式 */
  :deep(.md-editor-catalog-active > span) {
    color: #764ba2 !important; /* 你的主题紫 */
    font-weight: bold;
    background-color: #f3e8ff; /* 加个浅紫色背景更明显 */
    border-radius: 4px;
    padding: 2px 5px;
  }

  :deep(.md-editor-catalog-link span:hover) {
    color: #764ba2 !important;
    cursor: pointer;
  }
  /* 3. 确保高亮样式存在且使用了 :deep */
  :deep(.md-editor-catalog-active > span) {
    color: #764ba2 !important;
    font-weight: bold;
  }
</style>
