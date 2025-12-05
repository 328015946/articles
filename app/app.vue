<!-- app.vue -->
<script setup>
  const user = useUser()
  // 调用刚才写的 user.get.ts 接口
  const { data } = await useFetch('/api/auth/user')
  if (data.value) {
    user.value = data.value
  }
</script>
<template>
  <!-- 关键：必须用 <NuxtLayout> 把 <NuxtPage> 包起来 -->
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  /* === 1. 定义 Light (默认) 主题变量 === */
  :root {
    --bg-body: #f8f9fa;
    --bg-card: #ffffff;
    --text-primary: #333333;
    --text-secondary: #666666;
    --border-color: #f0f0f0;
    --accent-color: #764ba2;
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  /* === 2. 定义 Dark 主题变量 === */
  .dark {
    --bg-body: #121212; /* 深灰色背景 */
    --bg-card: #1e1e1e; /* 卡片背景 */
    --text-primary: #e0e0e0; /* 浅灰文字 */
    --text-secondary: #a0a0a0;
    --border-color: #333333;
    --accent-color: #9d7bd8; /* 紫色调亮一点 */
    --shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  /* === 3. 应用变量 === */
  body {
    background-color: var(--bg-body);
    color: var(--text-primary);
    transition: background-color 0.3s, color 0.3s; /* 平滑过渡 */
  }
</style>
