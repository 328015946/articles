// server/api/stats.get.ts
import Article from '../models/Article'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

export default defineEventHandler(async event => {
  // 1. 身份校验
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '请先登录' })

  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)
  const userId = decoded.id
  const role = decoded.role

  // 2. 构建查询条件
  // 如果是管理员，查所有；如果是普通用户，只查自己的
  const matchStage = role === 'admin' ? {} : { author: new mongoose.Types.ObjectId(userId) }

  // 3. 使用聚合管道 (Aggregate) 一次性算出总数和总阅读量
  const stats = await Article.aggregate([
    { $match: matchStage }, // 过滤条件
    {
      $group: {
        _id: null,
        articleCount: { $sum: 1 }, // 统计文章数量
        totalViews: { $sum: '$views' } // 累加 views 字段
      }
    }
  ])

  // 如果没有数据，返回 0
  if (stats.length === 0) {
    return { articleCount: 0, totalViews: 0 }
  }

  return stats[0]
})
