/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 17:22:52
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 17:38:23
 * @FilePath: \xiao-nuxt\server\api\question-categories\index.get.ts
 * @Description: 注释
 */
import QuestionCategory from '../../models/QuestionCategory'

export default defineEventHandler(async event => {
  // 按 sort 排序，或者按创建时间
  return await QuestionCategory.find().sort({ sort: -1, createdAt: 1 })
})
