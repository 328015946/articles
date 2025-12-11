/*
 * @Author: zengxiaobin
 * @Date: 2025-12-10 09:52:11
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-10 09:52:28
 * @FilePath: \xiao-nuxt\server\api\admin\users\index.get.ts
 * @Description: 注释
 */
import User from '../../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 管理员鉴权 (这是通用逻辑，以后可以用中间件封装)
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)
  if (decoded.role !== 'admin') throw createError({ statusCode: 403 })

  // 2. 查询参数
  const { page = 1, keyword } = getQuery(event)
  const limit = 10

  // 3. 构建查询
  const filter: any = {}
  if (keyword) {
    // 支持搜昵称或账号
    filter.$or = [{ nickname: { $regex: keyword, $options: 'i' } }, { username: { $regex: keyword, $options: 'i' } }]
  }

  const [list, total] = await Promise.all([
    User.find(filter)
      .select('-password') // 不返回密码
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * limit)
      .limit(limit),
    User.countDocuments(filter)
  ])

  return { list, total }
})
