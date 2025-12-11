/*
 * @Author: zengxiaobin
 * @Date: 2025-12-10 14:27:55
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-10 14:28:19
 * @FilePath: \xiao-nuxt\server\api\admin\users\manage.post.ts
 * @Description: 注释
 */
import User from '../../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 管理员鉴权
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '未登录' })

  const config = useRuntimeConfig()
  let decoded: any
  try {
    decoded = jwt.verify(token, config.jwtSecret)
  } catch (e) {
    throw createError({ statusCode: 401, message: '登录已过期' })
  }

  // 必须是管理员
  if (decoded.role !== 'admin') {
    throw createError({ statusCode: 403, message: '权限不足' })
  }

  // 2. 获取参数
  const body = await readBody(event)
  const { id, action } = body
  // action 的值可能是: 'ban' (封禁), 'active' (解封), 'delete' (删除)

  if (!id || !action) {
    throw createError({ statusCode: 400, message: '参数错误' })
  }

  // 3. 安全检查：防止管理员封禁/删除自己
  if (id === decoded.id) {
    return { success: false, message: '不能操作自己的账号' }
  }

  // 4. 执行逻辑
  try {
    if (action === 'delete') {
      // === 删除逻辑 ===
      await User.findByIdAndDelete(id)
      return { success: true, message: '用户已彻底删除' }
    } else if (action === 'ban') {
      // === 封禁逻辑 ===
      // 更新状态为 banned
      await User.findByIdAndUpdate(id, { status: 'banned' })
      return { success: true, message: '用户已封禁' }
    } else if (action === 'active') {
      // === 解封逻辑 ===
      // 更新状态为 active
      await User.findByIdAndUpdate(id, { status: 'active' })
      return { success: true, message: '用户已解封' }
    }

    return { success: false, message: '未知操作类型' }
  } catch (e: any) {
    return { success: false, message: '操作失败: ' + e.message }
  }
})
