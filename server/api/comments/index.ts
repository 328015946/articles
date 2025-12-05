// server/api/comments/index.ts
import Comment from '../../models/Comment'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const method = event.method

  // === GET: 获取某篇文章的评论 ===
  if (method === 'GET') {
    const query = getQuery(event)
    const articleId = query.articleId

    // 查库，并关联出作者的昵称 (populate)
    const comments = await Comment.find({ articleId })
      .populate('author', 'nickname username') // 只取昵称和用户名
      .sort({ createdAt: -1 }) // 最新在前

    return comments
  }

  // === POST: 发表评论 ===
  if (method === 'POST') {
    // 1. 校验登录
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, message: '请先登录' })
    const config = useRuntimeConfig()
    const decoded: any = jwt.verify(token, config.jwtSecret)

    // 2. 保存评论
    const body = await readBody(event)
    if (!body.content) throw createError({ statusCode: 400, message: '内容不能为空' })

    const newComment = await Comment.create({
      content: body.content,
      articleId: body.articleId,
      author: decoded.id
    })

    // 返回带上作者信息，方便前端直接渲染
    return await newComment.populate('author', 'nickname')
  }
})
