// server/api/articles/like.post.ts
import Article from '../../models/Article'
import Notification from '../../models/Notification' // ★ 1. 引入通知模型
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 校验登录
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '请先登录' })
  const config = useRuntimeConfig()

  let userId
  try {
    const decoded: any = jwt.verify(token, config.jwtSecret)
    userId = decoded.id
  } catch (e) {
    throw createError({ statusCode: 401, message: '登录已过期' })
  }

  // 2. 获取文章ID
  const body = await readBody(event)
  const articleId = body.articleId

  // 3. 查文章
  const article = await Article.findById(articleId)
  if (!article) throw createError({ statusCode: 404, message: '文章不存在' })

  // 4. 判断逻辑：点过没？
  // 注意：Mongoose 的 ObjectId 比较建议转字符串，或者用 some
  const isLiked = article.likes.some(id => id.toString() === userId)

  if (isLiked) {
    // === 这种情况是：取消点赞 ===
    await Article.findByIdAndUpdate(articleId, { $pull: { likes: userId } })

    // (可选) 如果你想取消点赞时同时也撤回通知，可以在这里删除 Notification
    // await Notification.findOneAndDelete({ recipient: article.author, sender: userId, type: 'like', article: articleId })

    return { liked: false }
  } else {
    // === 这种情况是：点赞 ===
    await Article.findByIdAndUpdate(articleId, { $addToSet: { likes: userId } })

    // ============================================
    // ★★★ 新增：发送点赞通知 ★★★
    // ============================================
    try {
      // 1. 不是自己给自己点赞
      if (article.author.toString() !== userId) {
        // 2. 防止刷屏：检查是否已经发过这条通知了
        const exist = await Notification.findOne({
          recipient: article.author,
          sender: userId,
          type: 'like',
          article: article._id
        })

        // 3. 如果没发过，才创建
        if (!exist) {
          await Notification.create({
            recipient: article.author, // 文章作者
            sender: userId, // 点赞人
            type: 'like', // 类型
            article: article._id, // 关联文章
            content: '' // 点赞一般不需要额外内容
          })
        }
      }
    } catch (error) {
      console.error('发送点赞通知失败:', error)
    }
    // ============================================

    return { liked: true }
  }
})
