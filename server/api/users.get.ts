/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 11:52:10
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 11:56:30
 * @FilePath: \xiao-nuxt\server\api\users.get.ts
 * @Description: 注释
 */
import User from '../models/User'

export default defineEventHandler(async event => {
  // 这里的代码是在服务端运行的，可以直接查库
  const users = await User.find()
  return users
})
