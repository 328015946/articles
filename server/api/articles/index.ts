/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 13:38:46
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 14:59:45
 * @FilePath: \xiao-nuxt\server\api\articles\index.ts
 * @Description: 注释
 */
import Article from '../../models/Article'
import jwt from 'jsonwebtoken' // <--- 补上这一行！
export default defineEventHandler(async event => {
  const method = event.method

  // === GET: 获取文章列表 (支持分页 & 筛选) ===
  if (method === 'GET') {
    const query = getQuery(event)

    // 1. 解析分页参数 (默认第1页，每页6条)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const skip = (page - 1) * limit

    // 2. 构建筛选条件
    const filter: any = {}
    if (query.categoryId) filter.category = query.categoryId
    if (query.recommended === 'true') filter.isRecommended = true

    // 3. 并行执行：查数据 + 查总数
    const [list, total] = await Promise.all([
      Article.find(filter)
        .populate('category')
        .sort({ createdAt: -1 }) // 按时间倒序
        .skip(skip) // 跳过前面 n 条
        .limit(limit), // 取 m 条

      Article.countDocuments(filter) // 统计符合条件的有多少条
    ])

    // 4. 返回标准分页结构
    return {
      list, // 当前页的文章数组
      total, // 总条数
      page, // 当前页码
      limit // 每页条数
    }
  }

  if (method === 'POST') {
    // 1. 获取用户信息
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401, message: '请先登录' })

    const config = useRuntimeConfig()
    const decoded: any = jwt.verify(token, config.jwtSecret)

    // 2. 写入数据库时，强制加上 author 字段
    const body = await readBody(event)
    return await Article.create({
      ...body,
      author: decoded.id // ★ 关键：标记这篇文章是谁写的
    })
  }
})
