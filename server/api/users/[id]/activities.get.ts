/*
 * @Author: zengxiaobin
 * @Date: 2025-12-06 12:45:45
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 12:46:42
 * @FilePath: \xiao-nuxt\server\api\user\[id]\activities.get.ts
 * @Description: 注释
 */
import Article from '../../../models/Article'
import Pin from '../../../models/Pin'

export default defineEventHandler(async event => {
  const userId = getRouterParam(event, 'id')

  // 这里简单的查最新的 10 条文章和 10 条沸点，然后在内存里排序混合
  // 实际生产环境通常用 Union 查询或者专门的 Feed 表
  const [articles, pins] = await Promise.all([
    Article.find({ author: userId }).sort({ createdAt: -1 }).limit(10).lean(),
    Pin.find({ author: userId }).sort({ createdAt: -1 }).limit(10).lean()
  ])

  // 给数据打标记，方便前端区分渲染
  const listA = articles.map(a => ({ ...a, type: 'article' }))
  const listB = pins.map(p => ({ ...p, type: 'pin' }))

  // 合并并按时间倒序
  const combined = [...listA, ...listB].sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return combined
})
