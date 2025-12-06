/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 18:50:21
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 12:23:39
 * @FilePath: \xiao-nuxt\server\api\comments\index.ts
 * @Description: 注释
 */
// server/api/comments/index.ts
import Comment from '../../models/Comment'
import Article from '../../models/Article' // ★ 新增引入
import Notification from '../../models/Notification' // ★ 新增引入
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const method = event.method

  // === GET: 获取某篇文章的评论 (保持不变) ===
  if (method === 'GET') {
    const query = getQuery(event)
    const articleId = query.articleId

    const comments = await Comment.find({ articleId }).populate('author', 'nickname username').sort({ createdAt: -1 })

    return comments
  }

  // === POST: 发表评论 ===
  if (method === 'POST') {
    // 1. 校验登录
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, message: '请先登录' })

    const config = useRuntimeConfig()
    let decoded: any
    try {
      decoded = jwt.verify(token, config.jwtSecret)
    } catch (e) {
      throw createError({ statusCode: 401, message: '登录已过期' })
    }

    // 2. 保存评论
    const body = await readBody(event)
    if (!body.content) throw createError({ statusCode: 400, message: '内容不能为空' })

    const newComment = await Comment.create({
      content: body.content,
      articleId: body.articleId,
      author: decoded.id
    })

    // ============================================
    // 2. ★★★ 发送通知 (修复版) ★★★
    try {
      const article = await Article.findById(body.articleId)
      // 只有文章存在，且作者不是我自己
      if (article && article.author.toString() !== decoded.id) {
        await Notification.create({
          recipient: article.author,
          sender: decoded.id,
          type: 'comment', // 类型：文章评论
          article: article._id, // 关联文章
          content: body.content.substring(0, 50)
        })
      }
    } catch (e) {
      console.error('文章评论通知发送失败:', e)
    }

    // 返回带上作者信息，方便前端直接渲染
    return await newComment.populate('author', 'nickname')
  }
})
