/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 14:10:56
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 14:11:11
 * @FilePath: \xiao-nuxt\app\middleware\auth.global.ts
 * @Description: 注释
 */
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // 1. 如果去的是 /admin 页面
  if (to.path.startsWith('/admin')) {
    // 2. 检查有没有 token
    const token = useCookie('auth_token')

    // 3. 如果没 token，强行跳转到登录页
    if (!token.value) {
      return navigateTo('/login')
    }
  }
})
