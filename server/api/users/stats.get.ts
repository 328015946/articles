import Pin from '../../models/Pin'
import Follow from '../../models/Follow'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) return null // 没登录就不返回数据

  try {
    const config = useRuntimeConfig()
    const decoded: any = jwt.verify(token, config.jwtSecret)
    const userId = decoded.id

    // 并行查询三项数据
    const [pinCount, followingCount, followerCount] = await Promise.all([
      Pin.countDocuments({ author: userId }), // 我发的沸点数
      Follow.countDocuments({ follower: userId }), // 我关注了多少人
      Follow.countDocuments({ following: userId }) // 有多少人关注我
    ])

    return { pinCount, followingCount, followerCount }
  } catch (e) {
    return null
  }
})
