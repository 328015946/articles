// server/api/notifications/read.post.ts
import Notification from '../../models/Notification'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  // 把该用户的所有通知标记为已读
  await Notification.updateMany({ recipient: decoded.id, isRead: false }, { isRead: true })

  return { success: true }
})
