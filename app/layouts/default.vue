<!-- layouts/default.vue -->
<script setup>
  // 获取所有分类
  const { data: categories } = await useFetch('/api/categories')
  const user = useUser() // 获取全局用户状态
  const router = useRouter()

  // === 2. 搜索逻辑 ===
  const searchKeyword = ref('')
  const handleSearch = () => {
    if (!searchKeyword.value.trim()) return
    router.push(`/search?q=${searchKeyword.value}`)
    // 搜索后清空 (可选)
    // searchKeyword.value = ''
  }

  const logout = () => {
    const token = useCookie('auth_token')
    token.value = null
    user.value = null
    router.push('/login')
  }
</script>

<template>
  <div class="app-layout">
    <!-- 1. 顶部导航条 -->
    <!-- 把类名改成 main-navbar 更通用 -->
    <nav class="main-navbar">
      <div class="nav-container">
        <!-- 左侧 Logo -->
        <div class="nav-left">
          <NuxtLink to="/" class="brand-logo">Blogs</NuxtLink>
        </div>

        <!-- 中间 菜单 -->
        <div class="nav-center">
          <NuxtLink to="/" class="nav-item" active-class="active">首页</NuxtLink>

          <!-- 循环渲染分类 -->
          <NuxtLink
            v-for="c in categories"
            :key="c._id"
            :to="`/category/${c._id}`"
            class="nav-item"
            active-class="active">
            {{ c.name }}
          </NuxtLink>
        </div>

        <!-- 右侧 后台 -->
        <!-- 右侧区域 -->
        <div class="nav-right">
          <!-- ★★★ 新增：搜索框 ★★★ -->
          <div class="search-wrapper">
            <input
              type="text"
              v-model="searchKeyword"
              @keyup.enter="handleSearch"
              placeholder="搜索..."
              class="search-input" />
            <span class="search-icon" @click="handleSearch">🔍</span>
          </div>

          <!-- 1. 如果已登录 -->
          <div v-if="user" class="user-menu">
            <span class="welcome">你好, {{ user.nickname }}</span>
            <NuxtLink to="/admin" class="nav-btn">个人中心</NuxtLink>
            <button @click="logout" class="nav-btn outline">退出</button>
          </div>

          <!-- 2. 如果没登录 -->
          <div v-else class="auth-btns">
            <NuxtLink to="/login" class="nav-text">登录</NuxtLink>
            <NuxtLink to="/register" class="nav-btn">注册</NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- 2. 页面内容 -->
    <main class="main-content">
      <slot />
    </main>

    <!-- 3. 新的底部组件 -->
    <AppFooter />
  </div>
</template>

<style>
  /* 全局设置 */
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f8f9fa;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
</style>

<style scoped>
  /* === 导航栏容器 === */
  .main-navbar {
    /* 使用和首页 Hero 一致的紫蓝渐变，保持视觉统一 */
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    width: 100%;
    height: 64px;
    box-shadow: 0 4px 12px rgba(118, 75, 162, 0.25); /* 紫色系的投影 */
    position: sticky; /* 吸顶效果 */
    top: 0;
    z-index: 999;
  }

  .nav-container {
    max-width: 1200px;
    height: 100%;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between; /* 左右两端对齐 */
  }

  /* === Logo === */
  .brand-logo {
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 1px;
  }

  /* === 中间菜单 === */
  .nav-center {
    display: flex;
    gap: 30px; /* 菜单间距 */
    height: 100%;
  }

  .nav-item {
    color: rgba(255, 255, 255, 0.75); /* 未选中时稍微淡一点 */
    font-size: 15px;
    font-weight: 500;
    height: 100%;
    display: flex;
    align-items: center;
    position: relative;
    transition: all 0.3s;
  }

  .nav-item:hover {
    color: #fff;
  }

  /* === 选中状态 (小白条) === */
  .nav-item.active {
    color: #fff;
    font-weight: 600;
  }

  /* 那个小白条 */
  .nav-item.active::after {
    content: '';
    position: absolute;
    bottom: 15px; /* 距离底部的位置 */
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 3px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.5); /* 给白条加一点发光效果 */
  }

  /* === 右侧按钮 === */
  .nav-item-btn {
    font-size: 14px;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.4);
    padding: 6px 15px;
    border-radius: 20px;
    transition: 0.2s;
  }
  .nav-item-btn:hover {
    background: white;
    color: #764ba2;
  }

  /* === 其他区域 === */
  .main-content {
    min-height: 80vh;
  }
  .footer {
    text-align: center;
    padding: 40px 0;
    color: #999;
    font-size: 13px;
    border-top: 1px solid #eee;
    margin-top: 40px;
    background: white;
  }

  /* 补充样式 */
  .user-menu,
  .auth-btns {
    display: flex;
    align-items: center;
    gap: 15px;
  }
  .welcome {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
  }
  .nav-text {
    color: white;
    font-size: 14px;
    margin-right: 5px;
  }
  .nav-btn {
    background: white;
    color: #764ba2;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;
  }
  .nav-btn.outline {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.5);
    color: white;
    cursor: pointer;
  }
  /* === 右侧样式 === */
  .nav-right {
    display: flex;
    align-items: center;
    gap: 15px; /* 拉开间距 */
  }

  /* 搜索框样式 */
  .search-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search-input {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 20px;
    padding: 6px 12px 6px 30px; /* 左边留空给图标 */
    color: white;
    font-size: 13px;
    width: 120px;
    transition: width 0.3s;
  }
  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  .search-input:focus {
    width: 180px; /* 聚焦时变长 */
    background: rgba(255, 255, 255, 0.25);
    outline: none;
  }
  .search-icon {
    position: absolute;
    left: 8px;
    font-size: 12px;
    cursor: pointer;
    opacity: 0.7;
  }

  /* 主题切换按钮 */
  .theme-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 0 5px;
    transition: transform 0.2s;
  }
  .theme-btn:hover {
    transform: scale(1.2);
  }

  /* 登录按钮样式沿用你的 */
  .nav-btn {
    background: white;
    color: #764ba2;
    padding: 5px 15px;
    border-radius: 15px;
    font-size: 12px;
    border: none;
    cursor: pointer;
  }
  .nav-btn.outline {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.6);
    color: white;
  }
  .nav-text {
    color: white;
    font-size: 14px;
  }
  .footer {
    text-align: center;
    padding: 20px;
    color: var(--text-secondary);
    background: var(--bg-card);
    margin-top: 40px;
  }
</style>
