// server/api/search.get.ts
import Article from '../models/Article'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const q = query.q as string

  if (!q) return []

  // 使用正则表达式进行模糊匹配 (不区分大小写 'i')
  // 匹配 标题 或 内容
  const list = await Article.find({
    $or: [{ title: { $regex: q, $options: 'i' } }, { content: { $regex: q, $options: 'i' } }]
  })
    .select('title content _id createdAt views') // 只取需要的字段
    .limit(20) // 限制返回数量

  return list
})
