<script setup>
  const route = useRoute()
  const user = useUser()

  // 判断是否激活
  const isActive = path => route.path === path
</script>

<template>
  <div class="mobile-tab-bar">
    <NuxtLink to="/" class="tab-item" :class="{ active: isActive('/') }">
      <span class="icon">🏠</span>
      <span class="text">首页</span>
    </NuxtLink>

    <NuxtLink to="/pins" class="tab-item" :class="{ active: isActive('/pins') }">
      <span class="icon">🔥</span>
      <span class="text">沸点</span>
    </NuxtLink>

    <NuxtLink to="/admin/publish" class="tab-item add-btn-wrapper">
      <div class="add-btn">+</div>
    </NuxtLink>

    <NuxtLink to="/admin/notifications" class="tab-item" :class="{ active: isActive('/admin/notifications') }">
      <span class="icon">🔔</span>
      <span class="text">消息</span>
    </NuxtLink>

    <NuxtLink
      :to="user ? `/user/${user._id || user.id}` : '/login'"
      class="tab-item"
      :class="{ active: route.path.includes('/user/') }">
      <span class="icon">👤</span>
      <span class="text">{{ user ? '我' : '登录' }}</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
  /* 默认隐藏 (PC端不显示) */
  .mobile-tab-bar {
    display: none;
  }

  /* 只在手机端显示 */
  @media screen and (max-width: 768px) {
    .mobile-tab-bar {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 55px;
      background: white;
      border-top: 1px solid #eee;
      z-index: 1000;
      justify-content: space-around;
      align-items: center;
      padding-bottom: env(safe-area-inset-bottom); /* 适配 iPhone X 底部黑条 */
    }

    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: #999;
      font-size: 10px;
      flex: 1;
    }

    .tab-item.active {
      color: #1e80ff;
    }

    .icon {
      font-size: 20px;
      margin-bottom: 2px;
    }

    /* 中间的大加号 */
    .add-btn-wrapper {
      position: relative;
      top: -15px; /* 往上突出一半 */
    }
    .add-btn {
      width: 45px;
      height: 45px;
      background: #1e80ff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      box-shadow: 0 4px 10px rgba(30, 128, 255, 0.3);
    }
  }
</style>
