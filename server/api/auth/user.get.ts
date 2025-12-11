/*
 * @Author: zengxiaobin
 * @FilePath: \xiao-nuxt\server\api\auth\user.get.ts
 * @Description: 获取当前用户 (增加封禁校验)
 */
import jwt from 'jsonwebtoken'
import User from '../../models/User'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) return null

  try {
    const config = useRuntimeConfig()
    const decoded: any = jwt.verify(token, config.jwtSecret)

    // 查库
    const user = await User.findById(decoded.id).select('-password')

    // ★★★ 新增：如果用户被封禁，视为未登录 (或者直接抛 403) ★★★
    if (user && user.status === 'banned') {
      // 抛出错误，触发前端插件的 403 拦截逻辑
      throw createError({
        statusCode: 403,
        message: '账号已被封禁，禁止访问'
      })
    }

    return user
  } catch (e: any) {
    // 如果是 403 (上面抛的)，直接透传给前端插件处理
    if (e.statusCode === 403) throw e

    // 其他错误 (如 token 过期) 返回 null
    return null
  }
})
