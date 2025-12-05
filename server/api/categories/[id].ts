/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 14:19:55
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 15:28:07
 * @FilePath: \xiao-nuxt\server\api\categories\[id].ts
 * @Description: 注释
 */
// server/api/categories/[id].ts
import Category from '../../models/Category'
import User from '../../models/User' // 引入用户模型用于权限校验
import jwt from 'jsonwebtoken' // 引入 JWT 用于解密 Token

export default defineEventHandler(async event => {
  // 1. 获取 URL 里的 id
  const id = getRouterParam(event, 'id')
  const method = event.method

  // === 公共权限校验 (无论是修改还是删除，都必须是管理员) ===
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: '请先登录' })
  }

  const config = useRuntimeConfig()
  let decoded: any
  try {
    decoded = jwt.verify(token, config.jwtSecret)
  } catch (err) {
    throw createError({ statusCode: 401, message: 'Token 无效或已过期' })
  }

  // 查库确认是否为管理员
  // (也可以直接信赖 token 里的 role，但查库更安全)
  const user = await User.findById(decoded.id)
  if (!user || user.role !== 'admin') {
    throw createError({ statusCode: 403, message: '权限不足：只有管理员可以操作分类' })
  }

  // ==========================================

  // === PUT: 修改分类 (重命名) ===
  if (method === 'PUT') {
    const body = await readBody(event)
    // { new: true } 表示返回更新后的数据
    return await Category.findByIdAndUpdate(id, { name: body.name }, { new: true })
  }

  // === DELETE: 删除分类 ===
  if (method === 'DELETE') {
    // 执行删除
    await Category.findByIdAndDelete(id)
    return { success: true }
  }
})
