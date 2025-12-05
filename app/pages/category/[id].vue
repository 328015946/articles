<!-- pages/category/[id].vue -->
<script setup>
  const route = useRoute()
  const categoryId = route.params.id

  // === 获取数据 ===
  // 1. 调用接口 (这里我们暂时请求前 20 条，暂不加复杂的分页条)
  const { data: res } = await useFetch('/api/articles', {
    query: {
      categoryId: categoryId,
      limit: 20 // 限制显示 20 条
    }
  })

  // === 关键修复 ===
  // 2. 适配后端返回的 { list, total } 格式
  const articles = computed(() => res.value?.list || [])

  // 3. 计算分类名称 (从第一篇文章里取，如果没有文章就显示“该分类”)
  const categoryName = computed(() => {
    if (articles.value.length > 0 && articles.value[0].category) {
      return articles.value[0].category.name
    }
    return '当前分类'
  })

  // 格式化日期
  const formatDate = dateStr => {
    return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  }
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>📂 分类：{{ categoryName }}</h1>
    </div>

    <!-- 有文章时 -->
    <div v-if="articles.length > 0" class="article-list">
      <article v-for="article in articles" :key="article._id" class="card">
        <div class="card-body">
          <h2>
            <NuxtLink :to="`/article/${article._id}`">{{ article.title }}</NuxtLink>
          </h2>
          <p class="excerpt">{{ article.content.substring(0, 100).replace(/[#*`]/g, '') }}...</p>
          <div class="card-footer">
            <div class="meta-info">
              <!-- 原有的日期 -->
              <span class="meta-item">📅 {{ formatDate(article.createdAt) }}</span>

              <!-- 原有的阅读量 -->
              <span class="meta-item">👁️ {{ article.views }}</span>

              <!-- ★★★ 新增：点赞数 ★★★ -->
              <span class="meta-item">❤ {{ article.likeCount || 0 }}</span>

              <!-- ★★★ 新增：评论数 ★★★ -->
              <span class="meta-item">💬 {{ article.commentCount || 0 }}</span>
            </div>

            <NuxtLink :to="`/article/${article._id}`" class="read-more">阅读 →</NuxtLink>
          </div>
        </div>
      </article>
    </div>

    <!-- 无文章时 -->
    <div v-else class="empty-state">
      <div class="icon">📭</div>
      <p>这个分类下暂时没有文章。</p>
      <NuxtLink to="/" class="btn-home">去看看别的</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
  .container {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
    min-height: 60vh;
  }
  .header {
    margin-bottom: 40px;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 20px;
  }
  .back-link {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 10px;
    display: inline-block;
  }
  .back-link:hover {
    color: #764ba2;
  }
  h1 {
    margin: 0;
    color: #333;
    font-size: 1.8rem;
  }

  /* 列表样式 */
  .article-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .card {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    border: 1px solid #f5f5f5;
    transition: 0.2s;
  }
  .card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    border-color: #eef2ff;
  }

  .card h2 {
    margin: 0 0 10px 0;
    font-size: 1.3rem;
  }
  .card h2 a {
    color: #333;
    text-decoration: none;
  }
  .card h2 a:hover {
    color: #007bff;
  }
  .excerpt {
    color: #666;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 15px;
  }
  .meta {
    color: #999;
    font-size: 0.85rem;
    margin: 0;
  }

  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #999;
  }
  .icon {
    font-size: 3rem;
    margin-bottom: 10px;
    opacity: 0.5;
  }
  .btn-home {
    display: inline-block;
    margin-top: 15px;
    color: #764ba2;
    font-weight: bold;
  }
  .card-footer {
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
    color: #999;
    font-size: 0.85rem;
  }
  .meta-info {
    display: flex;
    align-items: center;
    gap: 15px; /* 图标之间的间距 */
    color: #999;
    font-size: 0.85rem;
  }
  .read-more {
    color: #007bff;
  }
  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px; /* 图标和数字之间的微小间距 */
  }

  /* 针对点赞加个颜色 (可选) */
  .meta-item:nth-child(3) {
    /* color: #ff6b6b;  如果你想让爱心一直是红色的 */
  }

  /* 鼠标悬停时的效果 (可选) */
  .article-card:hover .meta-info {
    color: #666; /* 卡片悬停时文字变深一点 */
  }
</style>
