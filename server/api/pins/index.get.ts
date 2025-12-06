import Pin from '../../models/Pin'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const { sort } = getQuery(event) // 获取 sort 参数: 'new' | 'hot'

  let currentUserId = null
  const token = getCookie(event, 'auth_token')
  if (token) {
    try {
      const config = useRuntimeConfig()
      const decoded: any = jwt.verify(token, config.jwtSecret)
      currentUserId = decoded.id
    } catch (e) {}
  }

  // ★★★ 排序逻辑 ★★★
  let sortOption: any = { createdAt: -1 } // 默认最新

  if (sort === 'hot') {
    // 热门：优先按点赞数倒序，其次按评论数，最后按时间
    // 注意：MongoDB 排序数组长度稍微复杂，这里简化用 commentCount 代表热度，
    // 或者你可以认为 likes 数组越长越热。
    // 简单实现：按评论数倒序
    sortOption = { commentCount: -1, createdAt: -1 }
  }

  const pins = await Pin.find()
    .populate('author', 'nickname avatar jobTitle') // 把职位也带出来
    .sort(sortOption)
    .limit(20)

  return pins.map(doc => {
    const item = doc.toObject()
    return {
      ...item,
      isLiked: currentUserId ? item.likes.some((id: any) => id.toString() === currentUserId) : false,
      likeCount: item.likes.length
    }
  })
})
