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
</style>
