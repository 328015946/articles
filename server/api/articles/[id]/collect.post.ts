import Collection from '../../../models/Collection'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const articleId = getRouterParam(event, 'id')
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  // 检查是否已收藏
  const existing = await Collection.findOne({ user: decoded.id, article: articleId })

  if (existing) {
    // 如果已收藏，则取消
    await Collection.findByIdAndDelete(existing._id)
    return { isCollected: false }
  } else {
    // 如果没收藏，则添加
    await Collection.create({ user: decoded.id, article: articleId })
    return { isCollected: true }
  }
})
