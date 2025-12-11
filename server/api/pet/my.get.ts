/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 19:45:54
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 19:46:08
 * @FilePath: \xiao-nuxt\server\api\pet\my.get.ts
 * @Description: 注释
 */
import Pet from '../../models/Pet'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) return null

  try {
    const config = useRuntimeConfig()
    const decoded: any = jwt.verify(token, config.jwtSecret)

    const pet = await Pet.findOne({ master: decoded.id })
    return pet
  } catch (e) {
    return null
  }
})
