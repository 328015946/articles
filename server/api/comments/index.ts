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
    // ★★★ 新增：发送消息通知逻辑 ★★★
    // ============================================
    try {
      // 1. 查出这篇文章是谁写的
      const article = await Article.findById(body.articleId)

      // 2. 只有当 "文章存在" 且 "作者不是评论人自己" 时，才发通知
      // 注意：MongoDB 的 ID 是对象，比较时最好转成字符串
      if (article && article.author.toString() !== decoded.id) {
        await Notification.create({
          recipient: article.author, // 接收者：文章作者
          sender: decoded.id, // 发送者：当前评论人
          type: 'comment', // 类型：评论
          article: article._id, // 关联文章
          content: body.content.substring(0, 50) // 截取前50个字作为提示
        })
      }
    } catch (error) {
      // 发送通知失败不应该影响评论本身的发布，所以 catch 住不抛错，只打印日志
      console.error('创建通知失败:', error)
    }
    // ============================================

    // 返回带上作者信息，方便前端直接渲染
    return await newComment.populate('author', 'nickname')
  }
})
