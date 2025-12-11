<!-- layouts/default.vue -->
<script setup>
  const user = useUser()
  const router = useRouter()

  // === 搜索逻辑 ===
  const searchKeyword = ref('')
  const handleSearch = () => {
    if (!searchKeyword.value.trim()) return
    router.push(`/search?q=${searchKeyword.value}`)
  }

  // === 获取未读消息 ===
  const { data: unreadData, refresh: refreshUnread } = await useFetch('/api/notifications/unread', {
    immediate: !!user.value
  })
  // ★★★ 新增：获取我的统计数据 ★★★
  const { data: myStats } = await useFetch('/api/users/stats', {
    immediate: !!user.value
  })
  watch(user, newUser => {
    if (newUser) refreshUnread()
    else unreadData.value = { count: 0 }
  })

  const logout = () => {
    const token = useCookie('auth_token')
    token.value = null
    user.value = null
    router.push('/login')
  }
</script>

<template>
  <div class="app-layout">
    <!-- 顶部导航条 -->
    <header class="juejin-header">
      <div class="header-container">
        <div class="header-left">
          <NuxtLink to="/" class="logo">
            <!-- 使用修改版 A -->
            <svg
              class="logo-img"
              width="110"
              height="28"
              viewBox="0 0 110 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="2" width="26" height="24" rx="6" fill="#1E80FF" />
              <path
                d="M7 9L12 14L7 19"
                stroke="white"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round" />
              <line x1="14" y1="19" x2="20" y2="19" stroke="white" stroke-width="2.5" stroke-linecap="round" />
              <text
                x="34"
                y="21"
                font-family="system-ui, sans-serif"
                font-weight="900"
                font-size="20"
                fill="#1E80FF"
                letter-spacing="1">
                牛马
              </text>
            </svg>
          </NuxtLink>
          <nav class="main-nav">
            <NuxtLink to="/" class="nav-link" active-class="active">首页</NuxtLink>
            <NuxtLink to="/pins" class="nav-link" active-class="active">沸点</NuxtLink>
            <NuxtLink to="/interview" class="nav-link" active-class="active">🧠 题库</NuxtLink>
            <NuxtLink to="/fishpond" class="nav-link" active-class="active">🐟 鱼塘</NuxtLink>
            <NuxtLink to="/pet" class="nav-link" active-class="active">🐮 养牛</NuxtLink>
            <!-- ★★★ 注意：这里的分类已经删掉了，移到了首页左侧 ★★★ -->
          </nav>
        </div>

        <div class="header-right">
          <!-- 搜索框 -->
          <div class="search-box">
            <input
              type="text"
              v-model="searchKeyword"
              @keyup.enter="handleSearch"
              placeholder="探索技术世界"
              class="search-input" />
            <div class="search-icon-btn" @click="handleSearch">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <!-- 创作者中心 -->
          <NuxtLink to="/admin/publish" class="creator-btn">创作者中心</NuxtLink>

          <!-- 用户区域 -->
          <div v-if="user" class="user-area">
            <NuxtLink to="/admin/notifications" class="icon-item notification">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span v-if="unreadData?.count > 0" class="badge">{{ unreadData.count }}</span>
            </NuxtLink>

            <div class="user-avatar-wrap">
              <NuxtLink :to="`/user/${user._id || user.id}`">
                <img :src="user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'" class="avatar" />
              </NuxtLink>
              <!-- ★★★ 全新的下拉菜单 ★★★ -->
              <div class="dropdown-menu card-mode">
                <!-- 1. 头部：用户信息 -->
                <div class="dd-header">
                  <img :src="user.avatar" class="dd-avatar" />
                  <div class="dd-info">
                    <div class="dd-name">{{ user.nickname }}</div>
                    <NuxtLink to="/user/coin" style="color: inherit; text-decoration: none" class="dd-ore">
                      <span>💎</span> 牛马币: {{ myStats?.coin || 0 }} >
                    </NuxtLink>
                  </div>
                </div>

                <!-- 2. 数据栏：关注/赞过/收藏 -->
                <div class="dd-stats-row">
                  <div class="stat-box">
                    <div class="num">{{ myStats?.pinCount || 0 }}</div>
                    <div class="label">沸点</div>
                  </div>
                  <div class="stat-box">
                    <div class="num">{{ myStats?.followingCount || 0 }}</div>
                    <div class="label">关注者</div>
                  </div>
                  <div class="stat-box">
                    <div class="num">{{ myStats?.followerCount || 0 }}</div>
                    <div class="label">关注</div>
                  </div>
                </div>

                <!-- 3. 菜单网格 (Grid布局) -->
                <div class="dd-grid-menu">
                  <NuxtLink :to="`/user/${user._id || user.id}`" class="grid-item"> 👤 我的主页 </NuxtLink>
                  <NuxtLink to="/admin" class="grid-item"> 🎁 创作中心 </NuxtLink>
                  <NuxtLink to="/admin/profile" class="grid-item"> ⚙️ 个人设置 </NuxtLink>
                  <NuxtLink to="/admin/publish" class="grid-item"> 📝 写文章 </NuxtLink>
                </div>

                <!-- 4. 底部列表 -->
                <div class="dd-footer-list">
                  <div class="list-item" @click="logout">退出登录</div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="auth-area">
            <NuxtLink to="/login" class="login-btn">登录</NuxtLink>
            <NuxtLink to="/register" class="register-btn">注册</NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <main class="main-container">
      <slot />
    </main>
    <AppFooter />
    <AppTabBar />
  </div>
</template>

<style scoped>
  /* 保持你之前的 CSS 不变，或者直接用我上一条回答的 CSS */
  /* 重点是删掉了 nav-link 的循环 */
  /* 为了节省篇幅，这里复用上一条的 style，只展示修改了 template 的部分 */
  .juejin-header {
    background: white;
    border-bottom: 1px solid #f1f1f1;
    height: 60px;
    position: sticky;
    top: 0;
    z-index: 999;
  }
  .header-container {
    max-width: 1440px;
    margin: 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
  }
  .header-left {
    display: flex;
    align-items: center;
    height: 100%;
  }
  .logo-img {
    height: 24px;
    margin-right: 20px;
    display: block;
  }
  .main-container {
  }
  .main-nav {
    display: flex;
    height: 100%;
  }
  .nav-link {
    display: flex;
    align-items: center;
    padding: 0 16px;
    color: #515767;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.2s;
    height: 100%;
  }
  .nav-link:hover,
  .nav-link.active {
    color: #1e80ff;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .search-box {
    display: flex;
    align-items: center;
    background: #f2f3f5;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 0 4px 0 12px;
    height: 36px;
    width: 260px;
    transition: all 0.2s;
  }
  .search-box:focus-within {
    background: white;
    border-color: #1e80ff;
    width: 320px;
  }
  .search-input {
    border: none;
    background: transparent;
    flex: 1;
    font-size: 14px;
    color: #333;
    height: 100%;
    outline: none;
  }
  .search-icon-btn {
    padding: 6px;
    color: #515767;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .creator-btn {
    background: #1e80ff;
    color: white;
    height: 36px;
    padding: 0 16px;
    border-radius: 3px;
    font-size: 14px;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }
  .user-area {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .icon-item {
    color: #8a919f;
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .badge {
    position: absolute;
    top: -6px;
    left: 12px;
    background: #ff4d4f;
    color: white;
    font-size: 10px;
    padding: 0 4px;
    height: 18px;
    line-height: 18px;
    border-radius: 8px;
    border: 2px solid white;
  }
  .user-avatar-wrap {
    position: relative;
    height: 36px;
    cursor: pointer;
  }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    background: #eee;
  }
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    width: 140px;
    background: white;
    border: 1px solid #ebebeb;
    border-radius: 4px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    padding: 8px 0;
    display: none;
    flex-direction: column;
  }
  .user-avatar-wrap:hover .dropdown-menu {
    display: flex;
  }
  .dd-item {
    padding: 10px 16px;
    font-size: 14px;
    color: #515767;
    transition: 0.2s;
  }
  .dd-item:hover {
    background: #f4f5f5;
    color: #1e80ff;
  }
  .auth-area {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
  }
  .login-btn {
    color: #1e80ff;
    padding: 0 10px;
  }
  .register-btn {
    color: #515767;
    padding: 0 10px;
  }
  /* === 下拉菜单美化 === */
  .dropdown-menu.card-mode {
    width: 260px; /* 变宽 */
    padding: 0;
    border-radius: 4px;
    overflow: hidden;
  }

  /* 1. 头部 */
  .dd-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f4f5f5;
  }
  .dd-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 12px;
    object-fit: cover;
  }
  .dd-name {
    font-size: 16px;
    font-weight: 600;
    color: #252933;
    margin-bottom: 4px;
  }
  .dd-ore {
    font-size: 12px;
    color: #1e80ff;
    background: #eaf2ff;
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    cursor: pointer;
  }

  /* 2. 数据栏 */
  .dd-stats-row {
    display: flex;
    justify-content: space-around;
    padding: 12px 0;
    border-bottom: 1px solid #f4f5f5;
  }
  .stat-box {
    text-align: center;
    cursor: pointer;
  }
  .stat-box .num {
    font-size: 16px;
    font-weight: bold;
    color: #252933;
  }
  .stat-box .label {
    font-size: 12px;
    color: #8a919f;
    margin-top: 2px;
  }
  .stat-box:hover .num {
    color: #1e80ff;
  }

  /* 3. 网格菜单 */
  .dd-grid-menu {
    display: grid;
    grid-template-columns: 1fr 1fr; /* 两列 */
    padding: 8px;
    border-bottom: 1px solid #f4f5f5;
  }
  .grid-item {
    display: block;
    padding: 10px;
    font-size: 13px;
    color: #515767;
    text-decoration: none;
    border-radius: 4px;
    text-align: left;
  }
  .grid-item:hover {
    background: #f4f5f5;
    color: #1e80ff;
  }

  /* 4. 底部列表 */
  .dd-footer-list {
    padding: 8px 0;
  }
  .list-item {
    padding: 10px 20px;
    font-size: 13px;
    color: #515767;
    cursor: pointer;
    transition: 0.2s;
  }
  .list-item:hover {
    background: #f4f5f5;
    color: #1e80ff;
  }
</style>
