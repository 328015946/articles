/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 13:38:46
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 14:59:45
 * @FilePath: \xiao-nuxt\server\api\articles\index.ts
 * @Description: 注释
 */
import Article from '../../models/Article'
import Comment from '../../models/Comment' // ★ 1. 引入评论模型
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const method = event.method

  // === GET: 获取文章列表 (支持分页 & 筛选) ===
  if (method === 'GET') {
    const query = getQuery(event)

    // 1. 解析分页参数
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const skip = (page - 1) * limit

    // 2. 构建筛选条件
    const filter: any = {}
    if (query.categoryId) filter.category = query.categoryId
    if (query.recommended === 'true') filter.isRecommended = true

    // 3. 并行执行：查文章原始数据 + 查总数
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('category') // 关联分类信息
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Article.countDocuments(filter)
    ])

    // 4. ★★★ 核心修改：二次处理数据，补充点赞数和评论数 ★★★
    // 使用 Promise.all 并发处理当前页的每一篇文章
    const list = await Promise.all(
      articles.map(async doc => {
        // A. 把 mongoose 文档转成普通 JS 对象 (否则无法添加新属性)
        const item = doc.toObject()

        // B. 去 Comment 表查这篇文章有多少条评论
        const commentCount = await Comment.countDocuments({ articleId: item._id })

        // C. 返回组装好的新对象
        return {
          ...item,
          // 计算点赞数 (likes 数组的长度)
          likeCount: item.likes ? item.likes.length : 0,
          // 放入查询到的评论数
          commentCount: commentCount
        }
      })
    )

    // 5. 返回
    return {
      list, // 这里返回的是带有 likeCount 和 commentCount 的新数组
      total,
      page,
      limit
    }
  }

  // === POST: 发布文章 (保持不变) ===
  if (method === 'POST') {
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, message: '请先登录' })

    const config = useRuntimeConfig()
    const decoded: any = jwt.verify(token, config.jwtSecret)

    const body = await readBody(event)
    return await Article.create({
      ...body,
      author: decoded.id
    })
  }
})
