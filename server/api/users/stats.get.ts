// server/api/user/stats.get.ts
import Pin from '../../models/Pin'
import Follow from '../../models/Follow'
import User from '../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) return null

  try {
    const config = useRuntimeConfig()
    const decoded: any = jwt.verify(token, config.jwtSecret)
    const userId = decoded.id

    // 1. 查询用户 (多查一个 lastSignDate 字段)
    const user = await User.findById(userId).select('coin lastSignDate')

    // 2. 并行查询其他统计
    const [pinCount, followingCount, followerCount] = await Promise.all([
      Pin.countDocuments({ author: userId }),
      Follow.countDocuments({ follower: userId }),
      Follow.countDocuments({ following: userId })
    ])

    // 3. ★★★ 判断今天是否已签到 (保持和 sign.post.ts 一致的时区逻辑) ★★★
    let isSignedToday = false
    if (user?.lastSignDate) {
      const now = new Date()
      // 强制转为东八区 YYYY-MM-DD
      const todayStr = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]
      const lastSignStr = new Date(new Date(user.lastSignDate).getTime() + 8 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      isSignedToday = todayStr === lastSignStr
    }

    return {
      pinCount,
      followingCount,
      followerCount,
      coin: user?.coin || 0,
      isSignedToday // ★ 返回给前端
    }
  } catch (e) {
    return null
  }
})
