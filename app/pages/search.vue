<!-- pages/search.vue -->
<script setup>
  const route = useRoute()
  const keyword = computed(() => route.query.q || '')

  // 监听路由参数变化，自动重新请求
  const { data: results, pending } = await useFetch(() => `/api/search?q=${keyword.value}`, {
    watch: [keyword] // 当 keyword 变了，自动重发请求
  })

  const formatDate = date => new Date(date).toLocaleDateString()
</script>

<template>
  <div class="container search-page">
    <div class="search-header">
      <h1>🔍 搜索结果: "{{ keyword }}"</h1>
      <p v-if="results">共找到 {{ results.length }} 篇相关文章</p>
    </div>

    <div v-if="pending">加载中...</div>

    <div v-else-if="results && results.length > 0" class="result-list">
      <article v-for="item in results" :key="item._id" class="result-card">
        <h3>
          <NuxtLink :to="`/article/${item._id}`">{{ item.title }}</NuxtLink>
        </h3>
        <!-- 截取一部分内容展示 -->
        <p class="excerpt">{{ item.content.replace(/[#*`]/g, '').substring(0, 100) }}...</p>
        <div class="meta">
          <span>{{ formatDate(item.createdAt) }}</span>
          <span>阅读 {{ item.views }}</span>
        </div>
      </article>
    </div>

    <div v-else class="empty-state">😢 没有找到相关内容，换个关键词试试？</div>
  </div>
</template>

<style scoped>
  .container {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
  }
  .search-header {
    margin-bottom: 30px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 20px;
  }
  .result-card {
    background: var(--bg-card);
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: var(--shadow);
  }
  .result-card h3 a {
    color: var(--text-primary);
    text-decoration: none;
  }
  .result-card h3 a:hover {
    color: var(--accent-color);
  }
  .excerpt {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.6;
  }
  .meta {
    margin-top: 10px;
    font-size: 12px;
    color: var(--text-secondary);
    display: flex;
    gap: 10px;
  }
  .empty-state {
    text-align: center;
    color: var(--text-secondary);
    margin-top: 50px;
    font-size: 18px;
  }
</style>
