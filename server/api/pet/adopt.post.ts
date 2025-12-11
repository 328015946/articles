/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 19:46:16
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 19:47:51
 * @FilePath: \xiao-nuxt\server\api\pet\adopt.post.ts
 * @Description: 注释
 */
import Pet from '../../models/Pet'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const { name } = await readBody(event)

  // 检查是否已有宠物
  const exist = await Pet.findOne({ master: decoded.id })
  if (exist) throw createError({ statusCode: 400, message: '你已经有一只牛马了，不能太贪心' })

  const pet = await Pet.create({
    master: decoded.id,
    name: name || '我的牛马',
    stage: 0, // 初始是蛋
    level: 1,
    exp: 0
  })

  return { success: true, pet }
})
