<!--
 * @Author: zengxiaobin
 * @Date: 2025-12-05 11:44:21
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-10 19:57:16
 * @FilePath: \xiao-nuxt\app\app.vue
 * @Description: 注释
-->
<!-- app/app.vue -->
<script setup>
  const user = useUser()
  const token = useCookie('auth_token')

  // 定义一个用于传递退出原因的 Cookie，有效期设短一点（比如 1 分钟）
  const logoutReason = useCookie('logout_reason', { maxAge: 60 })

  // 1. 调用接口获取用户信息
  const { data, error } = await useFetch('/api/auth/user')

  // 2. ★★★ 核心修复：检测封禁并设置弹窗消息 ★★★
  if (error.value || (token.value && !data.value)) {
    // 如果状态码是 403 (封禁)
    if (error.value?.statusCode === 403) {
      // A. 把错误信息存入 Cookie (服务端 -> 客户端的信使)
      logoutReason.value = error.value.data?.message || '账号已被封禁，系统强制退出'

      // B. 清理本地状态
      token.value = null
      user.value = null

      // C. 强制跳转登录页
      await navigateTo('/login')
    }
    // 其他错误 (如 Token 过期) 直接清理不弹窗，或者你也想弹窗就在这里写
    else if (!data.value) {
      token.value = null
      user.value = null
      await navigateTo('/login')
    }
  }

  // 3. 正常情况
  if (data.value) {
    user.value = data.value
  }
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<style>
  a {
    text-decoration: none;
  }
</style>
