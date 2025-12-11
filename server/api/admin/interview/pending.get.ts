/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 16:25:46
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 17:49:23
 * @FilePath: \xiao-nuxt\server\api\admin\interview\pending.get.ts
 * @Description: 注释
 */
// server/api/admin/interview/pending.get.ts
import Question from '../../../models/Question'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 鉴权
  const token = getCookie(event, 'auth_token')
  if (!token) {
    console.log('❌ [Debug] 没有 Token')
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const config = useRuntimeConfig()
  let decoded: any
  try {
    decoded = jwt.verify(token, config.jwtSecret)
    // console.log('✅ [Debug] 用户信息:', decoded.username, decoded.role)
  } catch (e) {
    console.log('❌ [Debug] Token 验证失败')
    throw createError({ statusCode: 401 })
  }

  if (decoded.role !== 'admin') {
    console.log('❌ [Debug] 权限不足，当前角色:', decoded.role)
    throw createError({ statusCode: 403 })
  }

  // 2. 查询数据
  try {
    // 打印一下查询条件，确认 status 拼写无误
    const list = await Question.find({ status: 'pending' })
      .populate('author', 'nickname avatar')
      .populate('category', 'name') // ★ 新增：关联分类名
      .sort({ createdAt: -1 })

    // 如果列表为空，我们打印一下数据库里到底有没有题目
    if (list.length === 0) {
      const total = await Question.countDocuments()
    }

    return list
  } catch (e) {
    return [] // 报错时返回空数组，防止前端崩
  }
})
