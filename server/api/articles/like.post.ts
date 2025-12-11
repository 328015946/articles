/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 18:49:48
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-10 14:34:19
 * @FilePath: \xiao-nuxt\server\api\articles\like.post.ts
 * @Description: 注释
 */
// server/api/articles/like.post.ts
import Article from '../../models/Article'
import Notification from '../../models/Notification'
import User from '../../models/User' // ★ 引入 User 模型
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // ... (鉴权逻辑保持不变) ...
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const user = await requireUser(event)
  const userId = user._id // 获取 ID

  const body = await readBody(event)
  const articleId = body.articleId

  const article = await Article.findById(articleId)
  if (!article) throw createError({ statusCode: 404 })

  const isLiked = article.likes.some((id: any) => id.toString() === userId)

  if (isLiked) {
    // === 取消赞 ===
    await Article.findByIdAndUpdate(articleId, { $pull: { likes: userId } })
    return { success: true, liked: false }
  } else {
    // === 点赞 ===
    await Article.findByIdAndUpdate(articleId, { $addToSet: { likes: userId } })

    // ============================================
    // ★★★ 新增：给作者加币逻辑 ★★★
    // ============================================
    try {
      // 只有不是自己给自己点赞时，才加币
      if (article.author.toString() !== userId) {
        // 1. 防止重复加币/重复通知机制
        // 我们查一下是否给这个人发过该文章的 like 通知，如果发过，说明之前点过赞了，就不再加币
        const hasNotified = await Notification.exists({
          recipient: article.author,
          sender: userId,
          type: 'like',
          article: article._id
        })

        if (!hasNotified) {
          // A. 给作者加 10 牛马币
          await User.findByIdAndUpdate(article.author, { $inc: { coin: 10 } })

          // B. 发送通知
          await Notification.create({
            recipient: article.author,
            sender: userId,
            type: 'like',
            article: article._id,
            content: '获得 +10 牛马币' // 在通知里备注一下
          })
        }
      }
    } catch (e) {
      console.error('点赞奖励失败:', e)
    }
    // ============================================

    return { success: true, liked: true }
  }
})
