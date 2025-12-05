// server/api/user/profile.put.ts
import User from '../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 验证登录
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '未登录' })

  const config = useRuntimeConfig()
  let userId
  try {
    const decoded: any = jwt.verify(token, config.jwtSecret)
    userId = decoded.id
  } catch (e) {
    throw createError({ statusCode: 401, message: '登录过期' })
  }

  // 2. 获取前端提交的数据 (昵称、头像路径)
  const body = await readBody(event)
  const { nickname, avatar } = body

  // 3. 更新数据库
  // { new: true } 表示返回更新后的数据
  const updatedUser = await User.findByIdAndUpdate(userId, { nickname, avatar }, { new: true }).select('-password') // 不返回密码

  // 4. 返回最新的用户信息
  return {
    success: true,
    user: {
      id: updatedUser._id,
      username: updatedUser.username,
      nickname: updatedUser.nickname,
      avatar: updatedUser.avatar,
      role: updatedUser.role
    }
  }
})
