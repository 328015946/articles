<!-- layouts/admin.vue -->
<script setup>
  const route = useRoute()
  const router = useRouter()
  const user = useUser()

  // === 1. 移动端菜单控制 ===
  const isMobileMenuOpen = ref(false)

  // 路由跳转后自动关闭菜单
  watch(
    () => route.path,
    () => {
      isMobileMenuOpen.value = false
    }
  )

  // 切换菜单函数
  const toggleMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  // === 2. 标题映射 (保持不变) ===
  const titleMap = {
    '/admin': '仪表盘',
    '/admin/publish': '发布文章',
    '/admin/articles': '文章管理 (全站)',
    '/admin/my-articles': '我的文章',
    '/admin/categories': '分类管理',
    '/admin/profile': '个人设置',
    '/admin/notifications': '消息中心'
  }

  const currentTitle = computed(() => {
    return titleMap[route.path] || route.path
  })

  const logout = () => {
    const token = useCookie('auth_token')
    token.value = null
    user.value = null
    router.push('/login')
  }
</script>

<template>
  <div class="admin-layout">
    <!-- ★★★ 移动端遮罩层 (点击空白关闭) ★★★ -->
    <div v-if="isMobileMenuOpen" class="mobile-mask" @click="isMobileMenuOpen = false"></div>

    <!-- 侧边栏：增加 mobile-open 类名控制显示 -->
    <aside class="sidebar" :class="{ 'mobile-open': isMobileMenuOpen }">
      <div class="logo">
        {{ user?.role === 'admin' ? '全站管理' : '创作中心' }}
      </div>

      <nav class="menu">
        <NuxtLink to="/admin" class="menu-item" :class="{ active: route.path === '/admin' }"> 📊 仪表盘 </NuxtLink>
        <NuxtLink to="/admin/publish" class="menu-item" active-class="active"> ✏️ 发布文章 </NuxtLink>

        <!-- 差异化菜单 -->
        <NuxtLink v-if="user?.role === 'admin'" to="/admin/articles" class="menu-item" active-class="active">
          📑 文章管理
        </NuxtLink>
        <NuxtLink v-else to="/admin/my-articles" class="menu-item" active-class="active"> 👤 我的文章 </NuxtLink>

        <NuxtLink v-if="user?.role === 'admin'" to="/admin/categories" class="menu-item" active-class="active">
          📂 分类管理
        </NuxtLink>

        <NuxtLink to="/admin/profile" class="menu-item" active-class="active"> ⚙️ 个人设置 </NuxtLink>
        <NuxtLink to="/admin/notifications" class="menu-item" active-class="active"> 🔔 消息中心 </NuxtLink>

        <div class="divider"></div>
        <NuxtLink to="/" class="menu-item">🏠 返回前台</NuxtLink>
        <button @click="logout" class="menu-item btn-logout">🚪 退出登录</button>
      </nav>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div class="header-left">
          <!-- ★★★ 移动端汉堡按钮 ★★★ -->
          <button class="menu-toggle" @click="toggleMenu">☰</button>
          <span class="breadcrumb">{{ currentTitle }}</span>
        </div>

        <div class="user-info">
          <span class="role-badge">{{ user?.role === 'admin' ? '管' : '创' }}</span>
          <!-- 手机端隐藏昵称，只留头像，节省空间 -->
          <img v-if="user?.avatar" :src="user.avatar" class="header-avatar" />
          <span class="header-name">{{ user?.nickname }}</span>
        </div>
      </header>

      <div class="page-body">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: #f0f2f5;
  }

  /* === 侧边栏样式 === */
  .sidebar {
    width: 240px;
    background: #001529;
    color: white;
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    left: 0;
    top: 0;
    z-index: 1001; /* 保证在遮罩层之上 */
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .logo {
    height: 64px;
    line-height: 64px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    background: #002140;
  }
  .menu {
    padding: 20px 0;
    flex: 1;
    overflow-y: auto; /* 菜单过长可滚动 */
  }
  .menu-item {
    display: block;
    padding: 15px 24px;
    color: rgba(255, 255, 255, 0.65);
    transition: 0.3s;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    box-sizing: border-box;
    text-align: left;
    font-size: 14px;
    text-decoration: none;
  }
  .menu-item:hover {
    color: white;
  }
  .menu-item.active {
    background: #1890ff;
    color: white;
  }
  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 10px 0;
  }
  .btn-logout {
    color: #ff4d4f;
  }

  /* === 右侧内容样式 === */
  .main-content {
    flex: 1;
    margin-left: 240px; /* PC端留出侧边栏位置 */
    display: flex;
    flex-direction: column;
    transition: margin-left 0.3s;
    width: 100%; /* 确保内容撑开 */
  }

  .top-header {
    height: 64px;
    background: white;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    position: sticky;
    top: 0;
    z-index: 999;
  }

  .header-left {
    display: flex;
    align-items: center;
  }
  .menu-toggle {
    display: none; /* PC端隐藏 */
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 5px 10px;
    margin-right: 10px;
  }

  .breadcrumb {
    color: #333;
    font-size: 16px;
    font-weight: bold;
  }
  .user-info {
    display: flex;
    align-items: center;
  }

  .header-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 8px;
  }
  .role-badge {
    background: #e6f7ff;
    color: #1890ff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
    margin-right: 8px;
  }

  .page-body {
    padding: 24px;
    flex: 1;
    overflow-x: hidden; /* 防止横向滚动 */
  }

  /* === 移动端适配 (重点) === */
  @media (max-width: 768px) {
    /* 1. 侧边栏默认隐藏在屏幕左侧 */
    .sidebar {
      transform: translateX(-100%);
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
    }

    /* 2. 激活时滑入 */
    .sidebar.mobile-open {
      transform: translateX(0);
    }

    /* 3. 内容区域占满全屏 */
    .main-content {
      margin-left: 0;
    }

    /* 4. 显示汉堡菜单按钮 */
    .menu-toggle {
      display: block;
    }

    /* 5. 头部调整 */
    .top-header {
      padding: 0 15px;
    }
    .breadcrumb {
      font-size: 14px;
    }
    .header-name {
      display: none;
    } /* 手机端隐藏用户名，太挤 */

    .page-body {
      padding: 15px; /* 手机端内边距减小 */
    }

    /* 6. 遮罩层 */
    .mobile-mask {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
    }
  }
</style>
