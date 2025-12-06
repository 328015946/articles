/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 11:44:21
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 16:42:43
 * @FilePath: \xiao-nuxt\nuxt.config.ts
 * @Description: 注释
 */
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    jwtSecret: 'my-super-secret-key-change-this' // 随便写个复杂的字符串
  },
  modules: ['@nuxtjs/color-mode'],
  colorMode: {
    preference: 'system', // 默认跟随系统
    fallback: 'light',
    classSuffix: '' // 生成的类名是 .dark-mode 或 .light-mode，设为空则生成 .dark
  },
  css: [
    '~/assets/css/mobile.css' // 引入适配样式
  ]
})
