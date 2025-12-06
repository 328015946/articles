<!-- pages/index.vue -->
<script setup>
  const route = useRoute()
  const router = useRouter()
  const user = useUser()

  // 1. 获取分类
  const { data: categories } = await useFetch('/api/categories')

  // 2. 获取作者榜 (新增)
  const { data: authorRank } = await useFetch('/api/authors/rank')

  // 3. 文章列表 (带排序)
  const page = ref(1)
  const sortType = ref('new') // 默认最新

  // 监听 sortType 和 page 的变化自动请求
  const { data: res, refresh } = await useFetch('/api/articles', {
    query: computed(() => ({
      page: page.value,
      limit: 10,
      sort: sortType.value // 传给后端 'new' 或 'hot'
    }))
  })

  const articles = computed(() => res.value?.list || [])

  // 切换 Tab
  const switchTab = type => {
    if (sortType.value === type) return // 点自己不刷新
    sortType.value = type
    page.value = 1 // 重置回第一页
    // useFetch 会自动触发，因为 query 是 computed
  }

  // 格式化时间
  const formatTime = date => {
    const d = new Date(date)
    const now = new Date()
    const diff = (now - d) / 1000
    if (diff < 60) return '刚刚'
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
    return d.toLocaleDateString()
  }
</script>

<template>
  <div class="juejin-home">
    <div class="container">
      <!-- 左侧导航 (保持不变) -->
      <nav class="sidebar-left">
        <div class="nav-list">
          <a class="nav-item" :class="{ active: !route.query.cat }" @click="router.push('/')">
            <span class="icon">🧭</span> 综合
          </a>
          <NuxtLink
            v-for="c in categories"
            :key="c._id"
            :to="`/category/${c._id}`"
            class="nav-item"
            active-class="active">
            <span class="icon">📑</span> {{ c.name }}
          </NuxtLink>
        </div>
      </nav>

      <!-- 中间内容 -->
      <main class="main-list">
        <!-- 顶部 Tab：点击切换排序 -->
        <div class="list-header">
          <span :class="{ active: sortType === 'new' }" @click="switchTab('new')">最新</span>
          <div class="divider"></div>
          <span :class="{ active: sortType === 'hot' }" @click="switchTab('hot')">热门</span>
        </div>

        <!-- 文章列表 -->
        <div class="entry-list">
          <div v-for="item in articles" :key="item._id" class="entry-item">
            <div class="meta-row">
              <!-- 显示真实作者 -->
              <NuxtLink :to="`/user/${item.author?._id}`" class="author-link">
                {{ item.author?.nickname || '牛马用户' }}
              </NuxtLink>
              <span class="date">{{ formatTime(item.createdAt) }}</span>
              <span class="tag" v-if="item.category">{{ item.category.name }}</span>
            </div>

            <div class="content-wrapper">
              <div class="text-box">
                <NuxtLink :to="`/article/${item._id}`" class="title">{{ item.title }}</NuxtLink>
                <p class="abstract">{{ item.content.substring(0, 80).replace(/[#*`]/g, '') }}...</p>

                <div class="action-row">
                  <span class="action">👁 {{ item.views }}</span>
                  <span class="action">👍 {{ item.likes?.length || 0 }}</span>
                  <!-- 暂时还没有评论数接口，先写0 -->
                  <span class="action">💬 0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 右侧侧边栏 -->
      <aside class="sidebar-right">
        <!-- 签到卡片 (保持不变) -->
        <SignCard />

        <!-- ★★★ 真实作者榜 ★★★ -->
        <!-- ★★★ 真实作者榜 ★★★ -->
        <div class="card rank-card">
          <div class="card-title">🎖️ 作者榜</div>
          <ul class="rank-list">
            <li v-for="author in authorRank" :key="author._id" class="rank-item">
              <!-- 增加 NuxtLink 跳转 -->
              <NuxtLink :to="`/user/${author._id}`" class="rank-link">
                <img :src="author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'" class="avatar" />
                <div class="info">
                  <div class="name">{{ author.nickname }}</div>
                  <div class="desc">
                    <!-- 显示职位，没有则显示阅读量 -->
                    {{ author.jobTitle || `获得 ${author.totalViews} 阅读` }}
                  </div>
                </div>
              </NuxtLink>
            </li>
            <!-- 空状态 -->
            <li v-if="!authorRank || authorRank.length === 0" class="empty-rank">虚位以待...</li>
          </ul>
        </div>

        <!-- 广告图 -->
        <!-- <div class="card ad-card">
          <img src="https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/img/default.640d9a7.png" />
          <span class="ad-tag">广告</span>
        </div> -->
      </aside>
    </div>
  </div>
</template>

<style scoped>
  .juejin-home {
    background: #f4f5f5;
    min-height: 100vh;
    padding-top: 20px;
  }
  .container {
    max-width: 1300px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 180px 1fr 260px; /* 经典三栏宽度 */
    gap: 20px;
    position: relative;
  }

  /* === 左侧导航 === */
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

  /* === 中间列表 === */
  .main-list {
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  /* Tab 头部 */
  .list-header {
    padding: 15px 20px;
    border-bottom: 1px solid #e4e6eb;
    display: flex;
    align-items: center;
  }
  .list-header span {
    font-size: 14px;
    color: #909090;
    cursor: pointer;
    padding: 0 10px;
  }
  .list-header span.active {
    color: #1e80ff;
  }
  .list-header span:hover {
    color: #1e80ff;
  }
  .list-header .divider {
    width: 1px;
    height: 14px;
    background: #e4e6eb;
    margin: 0 5px;
  }

  /* 文章项 */
  .entry-item {
    padding: 20px;
    border-bottom: 1px solid #e4e6eb;
    cursor: pointer;
    transition: 0.2s;
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

  .content-wrapper {
    display: flex;
    justify-content: space-between;
  }
  .text-box {
    flex: 1;
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
    text-decoration: underline;
  }
  .abstract {
    color: #86909c;
    font-size: 13px;
    line-height: 22px;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .action-row {
    display: flex;
    gap: 20px;
  }
  .action {
    font-size: 13px;
    color: #86909c;
    display: flex;
    align-items: center;
  }
  .action:hover {
    color: #1e80ff;
  }

  /* === 右侧侧边栏 === */
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
    overflow: hidden;
  }

  /* 签到卡片 */
  .sign-card {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sign-header .title {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 4px;
  }
  .sign-header .desc {
    font-size: 12px;
    color: #86909c;
  }
  .btn-sign {
    border: 1px solid #1e80ff;
    color: #1e80ff;
    background: white;
    border-radius: 4px;
    padding: 6px 14px;
    cursor: pointer;
    transition: 0.2s;
  }
  .btn-sign:hover {
    background: #eaf2ff;
  }

  /* 广告卡片 */
  .ad-card {
    position: relative;
    height: 180px;
    background: #eee;
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

  /* 排行榜 */
  .rank-card {
    padding: 16px;
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
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  .rank-item .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }
  .rank-item .name {
    font-size: 14px;
    color: #333;
  }
  .rank-item .desc {
    font-size: 12px;
    color: #909090;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 140px;
  }

  /* 响应式 */
  @media (max-width: 960px) {
    .container {
      grid-template-columns: 1fr;
    }
    .sidebar-left,
    .sidebar-right {
      display: none;
    } /* 手机端只显示文章流 */
  }
  /* 作者榜样式优化 */
  .rank-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .rank-item {
    margin-bottom: 15px;
  }
  /* 让整个区域可点击 */
  .rank-link {
    display: flex;
    align-items: center;
    text-decoration: none; /* 去掉下划线 */
    color: inherit;
  }
  .rank-link:hover .name {
    color: #1e80ff; /* 悬停名字变蓝 */
  }

  .rank-item .avatar {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    margin-right: 10px;
    object-fit: cover;
    border: 1px solid #f1f1f1;
  }
  .info {
    flex: 1;
    overflow: hidden; /* 防止名字太长溢出 */
  }
  .rank-item .name {
    font-size: 14px;
    color: #333;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rank-item .desc {
    font-size: 12px;
    color: #909090;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .empty-rank {
    text-align: center;
    color: #999;
    font-size: 12px;
    padding: 10px 0;
  }
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
