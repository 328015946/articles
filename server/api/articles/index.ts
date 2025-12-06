/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 13:38:46
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 09:58:20
 * @FilePath: \xiao-nuxt\server\api\articles\index.ts
 * @Description: 注释
 */
import Article from '../../models/Article'
import Comment from '../../models/Comment' // ★ 1. 引入评论模型
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const method = event.method

  // === GET: 获取列表 ===
  if (method === 'GET') {
    const query = getQuery(event)

    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const skip = (page - 1) * limit

    const filter: any = {}
    if (query.categoryId) filter.category = query.categoryId

    // ★★★ 核心修改：排序逻辑 ★★★
    let sortOptions: any = { createdAt: -1 } // 默认按最新
    if (query.sort === 'hot') {
      sortOptions = { views: -1, _id: -1 } // 按浏览量倒序，如果浏览量一样按ID排
    }

    const [list, total] = await Promise.all([
      Article.find(filter)
        .populate('category')
        .populate('author', 'nickname avatar') // 把作者头像昵称也查出来
        .sort(sortOptions) // <--- 这里用了动态排序
        .skip(skip)
        .limit(limit),

      Article.countDocuments(filter)
    ])

    return { list, total, page, limit }
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
