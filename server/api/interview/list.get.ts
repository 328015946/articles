/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 16:23:12
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 17:45:26
 * @FilePath: \xiao-nuxt\server\api\interview\list.get.ts
 * @Description: 注释
 */
import Question from '../../models/Question'

export default defineEventHandler(async event => {
  const { page = 1, categoryId } = getQuery(event) // 获取参数
  const limit = 10

  // 1. 基础条件：必须是审核通过的
  const filter: any = { status: 'approved' }

  // 2. ★★★ 核心修复：如果有分类ID，加入过滤条件 ★★★
  if (categoryId) {
    filter.category = categoryId
  }

  const [list, total] = await Promise.all([
    Question.find(filter)
      .populate('author', 'nickname avatar')
      .populate('category', 'name icon') // ★★★ 关联分类信息，方便前端展示
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * limit)
      .limit(limit),
    Question.countDocuments(filter)
  ])

  return { list, total }
})
