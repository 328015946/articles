// server/api/notifications/unread.get.ts
import Notification from '../../models/Notification'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 简单的登录校验
  const token = getCookie(event, 'auth_token')
  if (!token) return { count: 0 } // 没登录就是0

  try {
    const config = useRuntimeConfig()
    const decoded: any = jwt.verify(token, config.jwtSecret)

    // 2. 统计未读数 (countDocuments 性能很高)
    const count = await Notification.countDocuments({
      recipient: decoded.id,
      isRead: false
    })

    return { count }
  } catch (e) {
    return { count: 0 }
  }
})
