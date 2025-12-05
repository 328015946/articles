// server/api/admin/stats.get.ts
import User from '../../models/User'
import Article from '../../models/Article'
import Comment from '../../models/Comment'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose' // ★★★ 1. 引入 mongoose

export default defineEventHandler(async event => {
  // 1. 获取并解析 Token
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '未登录' })

  const config = useRuntimeConfig()
  let userId, userRole

  try {
    const decoded: any = jwt.verify(token, config.jwtSecret)
    userId = decoded.id
    userRole = decoded.role // 假设 Token 里存了 role，如果没有，需要去查数据库
  } catch (e) {
    throw createError({ statusCode: 401, message: 'Token 无效' })
  }

  // 2. 定义过滤条件 (核心逻辑)
  const isAdmin = userRole === 'admin'

  // ★★★ 2. 核心修复：如果是普通用户，必须把 ID 字符串转成 ObjectId
  // 只有这样，aggregate 里的 $match 才能匹配成功
  const matchQuery: any = {}

  if (!isAdmin) {
    // 确保 userId 是有效的 MongoDB ID 格式
    if (mongoose.Types.ObjectId.isValid(userId)) {
      matchQuery.author = new mongoose.Types.ObjectId(userId)
    }
  }
  // 如果是管理员，查询条件为空(查所有)；如果是普通用户，限制 author 为自己
  const articleQuery = isAdmin ? {} : { author: userId }

  // 3. 执行查询

  // A. 文章数
  const articleCount = await Article.countDocuments(isAdmin ? {} : { author: userId })

  // B. 用户数 (只有管理员能看，普通用户返回 0)
  const userCount = isAdmin ? await User.countDocuments() : 0

  // C. 浏览量 (聚合查询)
  // 这里的 $match 会根据权限过滤
  const viewsResult = await Article.aggregate([
    { $match: articleQuery },
    { $group: { _id: null, totalViews: { $sum: '$views' } } }
  ])

  // D. 评论数
  // 管理员：看全站评论
  // 创作者：看"别人在我文章下的评论" (这反映了我的热度)
  let commentCount = 0
  if (isAdmin) {
    commentCount = await Comment.countDocuments()
  } else {
    // 创作者逻辑：先找到我的所有文章ID，再统计这些文章下的评论
    const myArticles = await Article.find({ author: userId }).select('_id')
    const myArticleIds = myArticles.map(a => a._id)
    commentCount = await Comment.countDocuments({ articleId: { $in: myArticleIds } })
  }

  // E. 图表趋势数据
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  sevenDaysAgo.setHours(0, 0, 0, 0) // ★ 修正：把时间设为当天的 00:00:00，避免漏掉数据

  const chartData = await Article.aggregate([
    {
      $match: {
        ...matchQuery, // ★★★ 3. 使用转换后的 ID 进行匹配
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: '+08:00' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ])

  // 4. 返回数据
  return {
    role: userRole, // 告诉前端当前是什么身份
    overview: {
      users: isAdmin ? await User.countDocuments() : 0,
      articles: articleCount,
      comments: commentCount,
      views: viewsResult[0]?.totalViews || 0
    },
    chart: chartData
  }
})
