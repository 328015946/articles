// server/api/articles/like.post.ts
import Article from '../../models/Article'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 校验登录
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '请先登录' })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)
  const userId = decoded.id

  // 2. 获取文章ID
  const body = await readBody(event)
  const articleId = body.articleId

  // 3. 查文章
  const article = await Article.findById(articleId)
  if (!article) throw createError({ statusCode: 404 })

  // 4. 判断逻辑：点过没？
  const isLiked = article.likes.includes(userId)

  if (isLiked) {
    // 赞过 -> 取消赞 (从数组移除)
    await Article.findByIdAndUpdate(articleId, { $pull: { likes: userId } })
    return { liked: false }
  } else {
    // 没赞过 -> 点赞 (加入数组)
    await Article.findByIdAndUpdate(articleId, { $addToSet: { likes: userId } })
    return { liked: true }
  }
})
