/*
 * @Author: zengxiaobin
 * @Date: 2025-12-06 09:35:46
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 10:57:00
 * @FilePath: \xiao-nuxt\server\api\pins\index.ts
 * @Description: 注释
 */
import Pin from '../../models/Pin'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const method = event.method

  // === GET: 获取沸点列表 (支持排序) ===
  if (method === 'GET') {
    const query = getQuery(event)
    const sortType = query.sort || 'new' // 'new' | 'hot'

    let sortOptions: any = { createdAt: -1 }
    if (sortType === 'hot') {
      // 热门按点赞数倒序 (mongo里数组长度排序比较麻烦，这里简单按 commentCount 或 createdAt 模拟)
      // 如果想按点赞数排，通常会加一个 likeCount 字段冗余存，这里先按评论数排
      sortOptions = { commentCount: -1, createdAt: -1 }
    }

    const pins = (await Pin.find().populate('author', 'nickname avatar role').sort(sortOptions).limit(30).lean()) as any

    // 检查当前用户是否点赞
    const token = getCookie(event, 'auth_token')
    let userId = null
    if (token) {
      try {
        const config = useRuntimeConfig()
        const decoded: any = jwt.verify(token, config.jwtSecret)
        userId = decoded.id
      } catch (e) {}
    }

    // 遍历处理：标记 isLiked
    pins.forEach((p: any) => {
      // 必须初始化这几个字段，否则前端就是 undefined，Vue 没法追踪

      p.showComments = false // ★★★ 初始化这个
      p.commentsList = null // ★★★ 初始化这个
      p.isLiked = userId && p.likes && p.likes.map(String).includes(userId)
      p.likeCount = p.likes ? p.likes.length : 0
    })

    return pins
  }

  // === POST: 发布 (保持不变) ===
  if (method === 'POST') {
    const token = getCookie(event, 'auth_token')
    if (!token) throw createError({ statusCode: 401 })
    const config = useRuntimeConfig()
    const decoded: any = jwt.verify(token, config.jwtSecret)
    const body = await readBody(event)
    return await Pin.create({ ...body, author: decoded.id })
  }
})
