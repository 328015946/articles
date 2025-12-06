/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 13:38:59
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 11:06:38
 * @FilePath: \xiao-nuxt\server\api\articles\[id].ts
 * @Description: 注释
 */
// server/api/articles/[id].ts
import Article from '../../models/Article'
import Collection from '../../models/Collection'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  // 1. 查文章详情
  const article = (await Article.findById(id).populate('category').populate('author', 'nickname avatar').lean()) as any

  if (!article) {
    throw createError({ statusCode: 404, message: '文章不存在' })
  }

  // ★★★ 关键修复：如果数据库里没存 likes，手动补一个空数组，防止前端报错 ★★★
  if (!article.likes) {
    article.likes = []
  }

  // 2. 阅读量 +1
  await Article.findByIdAndUpdate(id, { $inc: { views: 1 } })
  article.views++

  // 3. 检查收藏状态
  let isCollected = false
  const token = getCookie(event, 'auth_token')

  if (token) {
    try {
      const config = useRuntimeConfig()
      const decoded: any = jwt.verify(token, config.jwtSecret)
      const count = await Collection.countDocuments({
        user: decoded.id,
        article: id
      })
      isCollected = count > 0
    } catch (e) {}
  }

  article.isCollected = isCollected

  return article
})
