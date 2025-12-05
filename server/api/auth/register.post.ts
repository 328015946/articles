/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 14:48:03
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 15:02:17
 * @FilePath: \xiao-nuxt\server\api\auth\register.post.ts
 * @Description: 注释
 */
import User from '../../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { username, password, nickname } = body

  // 1. 检查用户名是否存在
  const exist = await User.findOne({ username })
  if (exist) throw createError({ statusCode: 400, message: '用户名已存在' })

  // 2. 密码加密 (加盐)
  const hashedPassword = bcrypt.hashSync(password, 10)

  // 3. 创建用户
  const user = await User.create({
    username,
    password: hashedPassword,
    nickname: nickname || username
  })

  // 4. 自动登录 (生成 Token)
  const config = useRuntimeConfig()
  const token = jwt.sign({ id: user._id, username: user.username }, config.jwtSecret, { expiresIn: '7d' })

  // 5. 设置 Cookie
  setCookie(event, 'auth_token', token, { httpOnly: false, maxAge: 60 * 60 * 24 * 7, path: '/' })

  return { success: true, user: { id: user._id, username: user.username, nickname: user.nickname, role: user.role } }
})
