/*
 * @Author: zengxiaobin
 * @FilePath: \xiao-nuxt\app\plugins\auth-check.ts
 * @Description: 全局 API 错误拦截
 */
export default defineNuxtPlugin(nuxtApp => {
  globalThis.$fetch = globalThis.$fetch.create({
    async onResponseError({ response }) {
      if (response.status === 403) {
        const data = response._data
        if (data && (data.message?.includes('封禁') || data.message?.includes('禁止'))) {
          // 清理状态
          const token = useCookie('auth_token')
          token.value = null
          const user = useUser()
          user.value = null

          // ★★★ 区分环境处理 ★★★
          if (process.server) {
            // SSR 环境：存 Cookie 并跳转 (配合 app.vue 和 login.vue 的逻辑)
            const logoutReason = useCookie('logout_reason')
            logoutReason.value = data.message || '账号已被封禁'
            await navigateTo('/login')
          } else {
            // 客户端环境：直接弹窗，简单粗暴，用户体验最好
            alert(data.message || '账号已被封禁，系统强制退出！')
            window.location.href = '/login'
          }
        }
      }
    }
  })
})
