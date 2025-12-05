// server/api/articles/recommend.get.ts
import mongoose from 'mongoose'
import Article from '../../models/Article'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const currentId = query.id // 获取当前文章 ID，为了排除它

  // MongoDB 聚合管道
  const articles = await Article.aggregate([
    // 1. 过滤：排除当前这篇文章
    {
      $match: {
        _id: { $ne: new mongoose.Types.ObjectId(String(currentId)) }
      }
    },
    // 2. 随机：随机抽取 3 条
    { $sample: { size: 3 } },
    // 3. 字段过滤：只取需要的字段 (省流量)
    {
      $project: {
        title: 1,
        createdAt: 1
        // 如果想显示分类名，这里比较复杂，先简化处理
      }
    }
  ])

  return articles
})
