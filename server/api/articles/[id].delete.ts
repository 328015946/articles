/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 15:04:13
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 15:04:31
 * @FilePath: \xiao-nuxt\server\api\articles\[id].delete.ts
 * @Description: 注释
 */
import Article from '../../models/Article'
import User from '../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id') // 文章ID

  // 1. 获取当前操作者
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const currentUser = await User.findById(decoded.id)
  const article = await Article.findById(id)

  if (!article) return { success: true } // 本来就没了

  // 2. 权限判断
  // 如果是管理员，或者是文章的作者，才能删
  if (currentUser.role === 'admin' || String(article.author) === String(currentUser._id)) {
    await Article.findByIdAndDelete(id)
    return { success: true }
  } else {
    throw createError({ statusCode: 403, message: '你不能删除别人的文章' })
  }
})
