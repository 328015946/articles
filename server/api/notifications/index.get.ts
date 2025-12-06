// server/api/notifications/index.get.ts
import Notification from '../../models/Notification'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  return await Notification.find({ recipient: decoded.id })
    .populate('sender', 'nickname avatar')
    .populate('article', 'title') // 关联文章标题
    .populate('pin', 'content') // ★★★ 新增：关联沸点内容
    .sort({ createdAt: -1 })
    .limit(20)
})
