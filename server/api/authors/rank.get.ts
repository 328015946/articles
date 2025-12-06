// server/api/authors/rank.get.ts
import Article from '../../models/Article'

export default defineEventHandler(async event => {
  // 使用 MongoDB 聚合管道
  const authors = await Article.aggregate([
    // 1. 分组 & 统计：按作者(_id)分组，计算 views 总和
    {
      $group: {
        _id: '$author',
        totalViews: { $sum: '$views' }
      }
    },
    // 2. 排序：按阅读量倒序
    { $sort: { totalViews: -1 } },
    // 3. 取前 5 名
    { $limit: 5 },
    // 4. 关联查询 (Lookup)：去 users 表查头像和昵称
    {
      $lookup: {
        from: 'users', // 这里的名字通常是模型名的小写复数 (User -> users)
        localField: '_id', // Article 里的 author ID
        foreignField: '_id', // User 表里的 _id
        as: 'userInfo' // 结果存到 userInfo 数组里
      }
    },
    // 5. 展开数组：userInfo 是个数组，我们把它展开成对象 (因为 ID 是唯一的，只会匹配到一个)
    { $unwind: '$userInfo' },
    // 6. 格式化输出：只保留我们需要的字段
    {
      $project: {
        _id: 1, // 作者 ID
        totalViews: 1,
        nickname: '$userInfo.nickname',
        avatar: '$userInfo.avatar',
        jobTitle: '$userInfo.jobTitle' // 顺便把职位也带出来
      }
    }
  ])

  return authors
})
