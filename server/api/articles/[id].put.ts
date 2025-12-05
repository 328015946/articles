import Article from '../../models/Article'

export default defineEventHandler(async event => {
  // 获取 URL 里的 ID
  const id = getRouterParam(event, 'id')
  // 获取要更新的数据
  const body = await readBody(event)

  // 更新数据库
  const updatedArticle = await Article.findByIdAndUpdate(
    id,
    { $set: body }, // 只更新传过来的字段 (比如只更新 isRecommended)
    { new: true } // 返回更新后的数据
  )

  return updatedArticle
})
