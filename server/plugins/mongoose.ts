/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 11:50:48
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 12:34:51
 * @FilePath: \xiao-nuxt\server\plugins\mongoose.ts
 * @Description: 注释
 */
import mongoose from 'mongoose'

export default defineNitroPlugin(async nitroApp => {
  const config = useRuntimeConfig()

  try {
    // 连接地址通常放在环境变量里
    await mongoose.connect(config.mongodbUri || 'mongodb://127.0.0.1:27017/xiao')
    console.log('✅ MongoDB Connected')
  } catch (e) {
    console.error('❌ MongoDB Connection Error:', e)
  }
})
