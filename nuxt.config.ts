/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 11:44:21
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 14:47:47
 * @FilePath: \xiao-nuxt\nuxt.config.ts
 * @Description: 注释
 */
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    jwtSecret: 'my-super-secret-key-change-this' // 随便写个复杂的字符串
  }
})
