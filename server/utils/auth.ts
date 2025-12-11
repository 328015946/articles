/*
 * @Author: zengxiaobin
 * @Date: 2025-12-10 10:00:59
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-10 19:23:05
 * @FilePath: \xiao-nuxt\server\utils\auth.ts
 * @Description: 注释
 */
// server/utils/auth.ts
import jwt from 'jsonwebtoken'
import User from '../models/User'

export const requireUser = async (event: any) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: '请先登录' })
  }

  const config = useRuntimeConfig()
  let decoded: any

  try {
    decoded = jwt.verify(token, config.jwtSecret)
  } catch (e) {
    throw createError({ statusCode: 401, message: '登录已过期' })
  }

  // ★★★ 核心：必须去数据库查最新状态 ★★★
  // 只解密 token 是不够的，必须查 User 表看 status
  const user = await User.findById(decoded.id)

  if (!user) {
    throw createError({ statusCode: 401, message: '用户不存在' })
  }
  // ★★★ 核心：拦截封禁状态 ★★★
  if (user.status === 'banned') {
    throw createError({
      statusCode: 403, // 必须是 403，配合前端插件拦截
      message: '账号已被封禁，禁止操作'
    })
  }

  // 返回最新的用户对象
  return user
}
