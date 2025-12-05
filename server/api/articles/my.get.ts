/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 14:51:20
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 14:51:36
 * @FilePath: \xiao-nuxt\server\api\articles\my.get.ts
 * @Description: 注释
 */
import Article from '../../models/Article'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 校验身份
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })

  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  // 2. 只查 author = 当前用户ID 的文章
  return await Article.find({ author: decoded.id }).sort({ createdAt: -1 })
})
