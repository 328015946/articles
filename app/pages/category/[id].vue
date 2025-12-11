<!-- pages/category/[id].vue -->
<script setup>
  const route = useRoute()
  const router = useRouter()
  const categoryId = route.params.id

  // 1. 获取所有分类 (用于左侧菜单)
  const { data: categories } = await useFetch('/api/categories')

  // 2. 获取当前分类下的文章
  const { data: res } = await useFetch('/api/articles', {
    query: {
      categoryId: categoryId,
      limit: 20 // 限制显示 20 条
    }
  })

  const articles = computed(() => res.value?.list || [])

  // 3. 计算当前分类的名字
  const currentCategoryName = computed(() => {
    const current = categories.value?.find(c => c._id === categoryId)
    return current ? current.name : '未知分类'
  })

  // 格式化时间
  const formatTime = date => {
    const d = new Date(date)
    return d.toLocaleDateString()
  }

  // === 新增：跳转文章详情 ===
  const goDetail = id => {
    router.push(`/article/${id}`)
  }
</script>

<template>
  <div class="juejin-home">
    <div class="container">
      <!-- === 左侧侧边栏 (固定) === -->
      <nav class="sidebar-left">
        <div class="nav-list">
          <!-- “综合” -->
          <a class="nav-item" @click="router.push('/')">
            <span class="icon">🧭</span>
            综合
          </a>

          <!-- 分类列表 -->
          <NuxtLink
            v-for="c in categories"
            :key="c._id"
            :to="`/category/${c._id}`"
            class="nav-item"
            active-class="active">
            <span class="icon">📑</span>
            {{ c.name }}
          </NuxtLink>
        </div>
      </nav>

      <!-- === 中间内容区 === -->
      <main class="main-list">
        <!-- 顶部标题 -->
        <div class="list-header">
          <span class="active">{{ currentCategoryName }}</span>
        </div>

        <!-- 文章列表 -->
        <div v-if="articles.length > 0" class="entry-list">
          <div v-for="item in articles" :key="item._id" class="entry-item" @click="goDetail(item._id)">
            <div class="meta-row">
              <NuxtLink :to="`/user/${item.author?._id}`" class="author-link">
                {{ item.author?.nickname || '牛马用户' }}
              </NuxtLink>
              <span class="date">{{ formatTime(item.createdAt) }}</span>
              <span class="tag">{{ currentCategoryName }}</span>
            </div>

            <div class="content-wrapper">
              <div class="text-box">
                <NuxtLink :to="`/article/${item._id}`" class="title">{{ item.title }}</NuxtLink>
                <p class="abstract">{{ item.content.substring(0, 80).replace(/[#*`]/g, '') }}...</p>

                <div class="action-row">
                  <span class="action">👁 {{ item.views }}</span>
                  <span class="action">👍 {{ item.likes?.length || 0 }}</span>
                  <span class="action">💬 0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="icon">📭</div>
          <p>这里暂时没有文章</p>
        </div>
      </main>

      <!-- === 右侧侧边栏 (固定) === -->
      <aside class="sidebar-right">
        <!-- 推荐分类 -->
        <div class="card rank-card">
          <div class="card-title">🏷️ 相关推荐</div>
          <ul class="rank-list">
            <li v-for="c in categories" :key="c._id" class="rank-item">
              <NuxtLink :to="`/category/${c._id}`" class="name"># {{ c.name }}</NuxtLink>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
  /* 这里直接复用 pages/index.vue 的样式，保证风格完全一致 */
  /* 为了节省篇幅，你可以把 index.vue 的 style scoped 内容直接复制过来 */
  /* 下面列出的是必须的样式 */

  .juejin-home {
    background: #f4f5f5;
    min-height: 100vh;
    padding-top: 20px;
    padding-bottom: 40px;
  }
  .container {
    max-width: 1300px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 180px 1fr 260px; /* 三栏 */
    gap: 20px;
  }

  /* === 左侧 === */
  .sidebar-left {
    position: sticky;
    top: 80px;
    height: fit-content;
  }
  .nav-list {
    background: white;
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  .nav-item {
    display: flex;
    align-items: center;
    padding: 10px 17px;
    font-size: 16px;
    color: #515767;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.2s;
    margin-bottom: 2px;
  }
  .nav-item:hover {
    background: #f4f5f5;
    color: #1e80ff;
  }
  /* active-class 会自动给当前分类加上 active 样式 */
  .nav-item.active {
    background: #eaf2ff;
    color: #1e80ff;
    font-weight: 500;
  }
  .icon {
    margin-right: 10px;
    font-size: 18px;
    width: 20px;
    text-align: center;
  }

  /* === 中间 === */
  .main-list {
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  .list-header {
    padding: 15px 20px;
    border-bottom: 1px solid #e4e6eb;
    font-size: 16px;
    font-weight: bold;
    color: #1e80ff;
    border-left: 4px solid #1e80ff;
  }

  .entry-item {
    padding: 20px;
    border-bottom: 1px solid #e4e6eb;
    cursor: pointer;
  }
  .entry-item:hover {
    background: #fafafa;
  }
  .meta-row {
    font-size: 13px;
    color: #86909c;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }
  .meta-row .date::before {
    content: '';
    margin: 0 5px;
    border-left: 1px solid #e5e6eb;
    height: 10px;
    display: inline-block;
    vertical-align: middle;
  }
  .tag {
    margin-left: auto;
    background: #f2f3f5;
    padding: 2px 6px;
    border-radius: 2px;
    color: #86909c;
  }

  .title {
    font-weight: bold;
    font-size: 16px;
    color: #1d2129;
    line-height: 24px;
    display: block;
    margin-bottom: 8px;
  }
  .title:hover {
    color: #1e80ff;
  }
  .abstract {
    color: #86909c;
    font-size: 13px;
    line-height: 22px;
    margin-bottom: 10px;
  }
  .action-row {
    display: flex;
    gap: 20px;
    font-size: 13px;
    color: #86909c;
  }

  /* === 右侧 === */
  .sidebar-right {
    position: sticky;
    top: 80px;
    height: fit-content;
  }
  .card {
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    padding: 16px;
  }
  .ad-card {
    padding: 0;
    position: relative;
    height: 180px;
  }
  .ad-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .ad-tag {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 2px;
  }

  .card-title {
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #e4e6eb;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
  .rank-list {
    list-style: none;
    padding: 0;
  }
  .rank-item {
    padding: 8px 0;
  }
  .rank-item .name {
    color: #515767;
    font-size: 14px;
  }
  .rank-item .name:hover {
    color: #1e80ff;
  }

  /* 空状态 */
  .empty-state {
    text-align: center;
    padding: 60px 0;
    color: #999;
  }
  .empty-state .icon {
    font-size: 3rem;
    margin-bottom: 10px;
  }

  /* 响应式 */
  @media (max-width: 960px) {
    .container {
      grid-template-columns: 1fr;
    }
    .sidebar-left,
    .sidebar-right {
      display: none;
    }
  }
  /* 修改样式，让作者名看起来像链接 */
  .author-link {
    color: #515767; /* 默认深灰 */
    text-decoration: none;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;
  }

  .author-link:hover {
    color: #1e80ff; /* 悬停变蓝 */
  }

  /* 分隔符样式优化 */
  .author-link::after {
    content: '·';
    margin: 0 6px;
    color: #e5e6eb;
  }
</style>
