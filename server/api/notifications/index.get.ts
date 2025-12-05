// server/api/notifications/index.get.ts
import Notification from '../../models/Notification'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '未登录' })

  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  // 查询发给我的通知，按时间倒序
  const list = await Notification.find({ recipient: decoded.id })
    .populate('sender', 'nickname avatar') // 填充发送者信息
    .populate('article', 'title') // 填充文章标题
    .sort({ createdAt: -1 })
    .limit(20)

  return list
})
