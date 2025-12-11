/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 14:48:19
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-10 10:00:39
 * @FilePath: \xiao-nuxt\server\api\auth\login.post.ts
 * @Description: 注释
 */
// server/api/auth/login.post.ts
import User from '../../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { username, password } = body

  // 1. 查找用户
  // 注意：select('+password') 是为了取出密码进行比对，
  // 同时要确保把 status 字段也查出来（通常默认就会查出来，除非你设置了 select: false）
  const user = await User.findOne({ username }).select('+password')

  if (!user) {
    throw createError({ statusCode: 401, message: '用户名或密码错误' })
  }

  // 2. 校验密码
  const isMatch = bcrypt.compareSync(password, user.password)
  if (!isMatch) {
    throw createError({ statusCode: 401, message: '用户名或密码错误' })
  }

  // ==========================================
  // ★★★ 核心新增：封禁拦截 ★★★
  // ==========================================
  if (user.status === 'banned') {
    throw createError({
      statusCode: 403,
      message: '该账号已被封禁，请联系管理员解封'
    })
  }
  // ==========================================

  // 3. 生成 Token (保持不变)
  const config = useRuntimeConfig()
  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, config.jwtSecret, {
    expiresIn: '7d'
  })

  setCookie(event, 'auth_token', token, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  return {
    success: true,
    user: {
      id: user._id,
      username: user.username,
      nickname: user.nickname,
      role: user.role,
      avatar: user.avatar
    }
  }
})
