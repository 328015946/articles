/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 14:48:19
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 15:11:29
 * @FilePath: \xiao-nuxt\server\api\auth\login.post.ts
 * @Description: 注释
 */
// server/api/auth/login.post.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User from '../../models/User'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({ statusCode: 400, message: '请输入账号和密码' })
  }

  // 1. 在数据库里找这个用户名
  const user = await User.findOne({ username })

  if (!user) {
    // 为了安全，通常提示“用户名或密码错误”，不告诉他是哪个错了
    throw createError({ statusCode: 401, message: '用户名或密码错误' })
  }

  // 2. 校验密码 (比对明文密码和数据库里的哈希密码)
  const isMatch = bcrypt.compareSync(password, user.password)

  if (!isMatch) {
    throw createError({ statusCode: 401, message: '用户名或密码错误' })
  }

  // 3. 生成 Token
  const config = useRuntimeConfig()
  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role }, // 把 role 放进 token
    config.jwtSecret,
    { expiresIn: '7d' }
  )

  // 4. 设置 Cookie
  setCookie(event, 'auth_token', token, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/'
  })

  // 5. 返回用户信息
  return {
    success: true,
    user: {
      id: user._id,
      username: user.username,
      nickname: user.nickname,
      role: user.role
    }
  }
})
