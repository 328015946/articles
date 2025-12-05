/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 13:38:59
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 19:16:24
 * @FilePath: \xiao-nuxt\server\api\articles\[id].ts
 * @Description: 注释
 */
// server/api/articles/[id].ts
import Article from '../../models/Article'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  // ★★★ 关键：必须加 .populate('category') ★★★
  // 同时顺便把 author (作者) 也关联出来，显示昵称
  const article = await Article.findById(id).populate('category').populate('author', 'nickname')

  // 阅读量 +1
  if (article) {
    article.views++
    await article.save()
  }

  return article
})
