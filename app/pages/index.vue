<!-- pages/index.vue -->
<script setup>
  // === 1. 左侧文章列表 (带分页) ===
  const page = ref(1) // 当前页码
  const limit = 6 // 每页显示几条

  // 请求接口 (注意：这里 page 是响应式的，页码变了会自动重新请求)
  const { data: articleData, refresh } = await useFetch('/api/articles', {
    query: {
      page: page,
      limit: limit
    }
  })

  // 计算属性：方便模板里取用
  const latestArticles = computed(() => articleData.value?.list || [])
  const total = computed(() => articleData.value?.total || 0)

  // 翻页方法
  const changePage = newPage => {
    // 简单的边界检查
    if (newPage < 1) return
    const maxPage = Math.ceil(total.value / limit)
    if (newPage > maxPage) return

    page.value = newPage
    // 滚动回到顶部，体验更好
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // === 2. 右侧热门文章 (适配新接口格式) ===
  const { data: hotData } = await useFetch('/api/articles', {
    // 热门文章不需要翻页，限制取前 5 条即可
    query: { recommended: 'true', limit: 5 }
  })
  const hotArticles = computed(() => hotData.value?.list || [])

  // === 工具函数 ===
  const formatDate = dateStr => {
    return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
</script>

<template>
  <div>
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1>探索技术，记录点滴</h1>
        <p>基于 Nuxt 4 + MongoDB 构建的全栈博客系统</p>
      </div>
    </section>

    <div class="container main-layout">
      <!-- === 左侧：文章列表 === -->
      <div class="content-col">
        <div class="section-header">
          <h2 class="section-title">📰 最新发布</h2>
          <!-- 显示当前分页信息 -->
          <span class="subtitle">Page {{ page }} / {{ Math.ceil(total / limit) || 1 }}</span>
        </div>

        <div v-if="latestArticles.length > 0" class="article-list">
          <article v-for="article in latestArticles" :key="article._id" class="article-card">
            <!-- 分类 -->
            <div class="card-header" v-if="article.category">
              <NuxtLink :to="`/category/${article.category._id}`" class="category-badge">
                {{ article.category.name }}
              </NuxtLink>
            </div>
            <!-- 标题和简介 -->
            <div class="card-body">
              <h3 class="card-title">
                <NuxtLink :to="`/article/${article._id}`">{{ article.title }}</NuxtLink>
              </h3>
              <p class="card-excerpt">{{ article.content.substring(0, 80).replace(/[#*`]/g, '') }}...</p>
            </div>
            <!-- 底部信息 -->
            <div class="card-footer">
              <div class="meta-info">
                <span>📅 {{ formatDate(article.createdAt) }}</span>
                <span>👁️ {{ article.views }}</span>
              </div>
              <NuxtLink :to="`/article/${article._id}`" class="read-more">阅读 →</NuxtLink>
            </div>
          </article>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <p>暂无数据</p>
        </div>

        <!-- ★★★ 分页按钮区域 ★★★ -->
        <div class="pagination" v-if="total > limit">
          <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">← 上一页</button>

          <span class="page-info">{{ page }}</span>

          <button class="page-btn" :disabled="page * limit >= total" @click="changePage(page + 1)">下一页 →</button>
        </div>
      </div>

      <!-- === 右侧：侧边栏 === -->
      <aside class="sidebar-col">
        <div class="sidebar-widget">
          <h3 class="widget-title">🔥 热门推荐</h3>
          <ul v-if="hotArticles.length > 0" class="hot-list">
            <li v-for="(article, index) in hotArticles" :key="article._id" class="hot-item">
              <span class="rank-num" :class="{ 'top-3': index < 3 }">{{ index + 1 }}</span>
              <div class="hot-content">
                <NuxtLink :to="`/article/${article._id}`" class="hot-title">{{ article.title }}</NuxtLink>
                <span class="hot-views">{{ article.views }} 阅读</span>
              </div>
            </li>
          </ul>
          <div v-else class="empty-widget">暂无推荐</div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
  /* 复用之前的 Hero、Grid、Card 样式... */
  /* 为了节省篇幅，这里只写新增的分页样式，你可以把之前的样式复制回来，或者我把分页样式列在下面 */

  /* === 分页样式 === */
  .pagination {
    margin-top: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }

  .page-btn {
    padding: 10px 20px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    color: #555;
    font-size: 14px;
    transition: 0.2s;
  }

  .page-btn:hover:not(:disabled) {
    border-color: #764ba2;
    color: #764ba2;
    background: #fcfaff;
  }

  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f5f5f5;
  }

  .page-info {
    font-weight: bold;
    color: #333;
  }

  /* 补充之前的样式，保证页面不崩 */
  .hero {
    background: linear-gradient(120deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 60px 20px;
    text-align: center;
    margin-bottom: 40px;
  }
  .hero h1 {
    margin: 0 0 10px 0;
  }
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 60px;
  }
  .main-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 40px;
  }
  @media (max-width: 900px) {
    .main-layout {
      grid-template-columns: 1fr;
    }
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
  }
  .section-title {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  .subtitle {
    color: #999;
    font-size: 0.9rem;
  }
  .article-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .article-card {
    padding: 25px;
    border-radius: 12px;

    transition: 0.2s;
    background: var(--bg-card); /* 替换 white */
    border: 1px solid var(--border-color); /* 替换 #f0f0f0 */
    color: var(--text-primary);
  }
  .article-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  }
  .card-title {
    margin: 10px 0;
    font-size: 1.3rem;
  }
  .card-title a {
    color: #333;
  }
  .card-title a:hover {
    color: #007bff;
  }
  .card-excerpt {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.6;
  }
  .card-footer {
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
    color: #999;
    font-size: 0.85rem;
  }
  .category-badge {
    background: #eef2ff;
    color: #4f46e5;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
  }
  .read-more {
    color: #007bff;
  }

  /* 侧边栏样式 */
  .sidebar-col {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  .sidebar-widget {
    padding: 25px;
    border-radius: 12px;
    background: var(--bg-card); /* 替换 white */
    border: 1px solid var(--border-color);
  }
  .widget-title {
    margin-top: 0;
    border-left: 4px solid #764ba2;
    padding-left: 10px;
  }
  .hot-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .hot-item {
    display: flex;
    margin-bottom: 15px;
  }
  .rank-num {
    width: 22px;
    height: 22px;
    background: #eee;
    text-align: center;
    border-radius: 4px;
    margin-right: 10px;
    font-size: 12px;
    line-height: 22px;
    flex-shrink: 0;
  }
  .rank-num.top-3 {
    background: #ff4757;
    color: white;
  }
  .hot-content {
    display: flex;
    flex-direction: column;
  }
  .hot-title {
    font-size: 0.95rem;
    color: #444;
    margin-bottom: 4px;
  }
  .hot-title:hover {
    color: #007bff;
  }
  .hot-views {
    font-size: 0.75rem;
    color: #999;
  }
  /* 3. 字体颜色 */
  .card-title a {
    color: var(--text-primary);
  }
  .card-excerpt {
    color: var(--text-secondary);
  }
  .hot-title {
    color: var(--text-primary);
  }
  .widget-title {
    color: var(--text-primary);
  }
  .section-title {
    color: var(--text-primary);
  }
  .subtitle {
    color: var(--text-secondary);
  }

  /* 4. 分页按钮 */
  .page-btn {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
  }
  .page-btn:disabled {
    background: var(--bg-body); /* 禁用时用深色一点的背景 */
    opacity: 0.5;
  }
  .page-info {
    color: var(--text-primary);
  }
</style>
