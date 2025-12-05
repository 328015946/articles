<!-- layouts/admin.vue -->
<script setup>
  const route = useRoute()
  const router = useRouter()
  const user = useUser() // 获取当前用户信息

  const logout = () => {
    const token = useCookie('auth_token')
    token.value = null
    user.value = null
    router.push('/login')
  }
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="logo">
        {{ user?.role === 'admin' ? '全站管理后台' : '个人创作中心' }}
      </div>

      <nav class="menu">
        <!-- 公共菜单：大家都能看 -->
        <NuxtLink to="/admin" class="menu-item" :class="{ active: route.path === '/admin' }"> 📊 仪表盘 </NuxtLink>

        <NuxtLink to="/admin/publish" class="menu-item" active-class="active"> ✏️ 发布文章 </NuxtLink>

        <!-- ★★★ 差异化菜单 ★★★ -->

        <!-- 如果是管理员：去管理所有文章 -->
        <NuxtLink v-if="user?.role === 'admin'" to="/admin/articles" class="menu-item" active-class="active">
          📑 文章管理 (全站)
        </NuxtLink>

        <!-- 如果是普通用户：去管理自己的文章 -->
        <!-- 我们复用 articles 页面，但通过参数区分 -->
        <NuxtLink v-else to="/admin/my-articles" class="menu-item" active-class="active"> 👤 我的文章 </NuxtLink>

        <!-- 只有管理员能看分类管理 -->
        <NuxtLink v-if="user?.role === 'admin'" to="/admin/categories" class="menu-item" active-class="active">
          📂 分类管理
        </NuxtLink>
        <!-- ★★★ 新增：修改密码 ★★★ -->
        <NuxtLink to="/admin/profile" class="menu-item" active-class="active"> ⚙️ 个人设置 </NuxtLink>
        <NuxtLink to="/admin/notifications" class="menu-item" active-class="active">
          🔔 消息中心
          <!-- 如果你能做一个接口返回未读数，这里可以用 v-if 显示红点 -->
          <!-- <span class="badge" v-if="unreadCount > 0">{{ unreadCount }}</span> -->
        </NuxtLink>
        <div class="divider"></div>
        <NuxtLink to="/" class="menu-item">🏠 返回前台</NuxtLink>
        <button @click="logout" class="menu-item btn-logout">🚪 退出登录</button>
      </nav>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <span class="breadcrumb">当前位置：{{ route.path }}</span>
        <div class="user-info">
          <!-- 显示当前身份 -->
          <span class="role-badge">{{ user?.role === 'admin' ? '管理员' : '创作者' }}</span>
          <img
            v-if="user?.avatar"
            :src="user.avatar"
            style="width: 24px; height: 24px; border-radius: 50%; vertical-align: middle; margin-right: 5px" />
          {{ user?.nickname }}
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

  /* 侧边栏样式 */
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
    box-sizing: border-box; /* ★★★ 加上这一行 ★★★ */
    text-align: left;
    font-size: 14px;
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

  /* 右侧样式 */
  .main-content {
    flex: 1;
    margin-left: 240px;
    display: flex;
    flex-direction: column;
  }
  .top-header {
    height: 64px;
    background: white;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
  }
  .breadcrumb {
    color: #999;
    font-size: 14px;
  }
  .page-body {
    padding: 24px;
    flex: 1;
    overflow-y: auto;
  }
  .role-badge {
    background: #e6f7ff;
    color: #1890ff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-right: 8px;
  }
</style>
