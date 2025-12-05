/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 14:48:32
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 14:48:49
 * @FilePath: \xiao-nuxt\server\api\auth\user.get.ts
 * @Description: 注释
 */
import jwt from 'jsonwebtoken'
import User from '../../models/User'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) return null

  try {
    const config = useRuntimeConfig()
    const decoded: any = jwt.verify(token, config.jwtSecret)
    // 查库获取最新信息 (去掉密码字段)
    const user = await User.findById(decoded.id).select('-password')
    return user
  } catch (e) {
    return null
  }
})
