/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 16:20:26
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 19:16:47
 * @FilePath: \xiao-nuxt\server\api\interview\submit.post.ts
 * @Description: 注释
 */
import Question from '../../models/Question'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const body = await readBody(event)

  // 1. 解构前端传来的 categoryId
  const { title, analysis, type, difficulty, tags, options, correctAnswer, correctAnswers, categoryId } = body

  // 2. 校验
  if (!title || !categoryId) throw createError({ statusCode: 400, message: '题目和分类必填' })

  // 3. 创建
  await Question.create({
    title,
    type: type || 'text',
    difficulty: difficulty || 1,
    author: decoded.id,

    // ★★★ 核心修复：把前端的 categoryId 赋值给数据库的 category ★★★
    category: categoryId,

    analysis: analysis || '',
    // ★★★★★ 核心修复在这里 ★★★★★
    // 之前写的是: options: type === 'choice' ? options : [],
    // 现在改为: 只要是 choice 或者 multiple，都保存 options
    options: type === 'choice' || type === 'multiple' ? options || [] : [],
    // 如果是多选，存入 correctAnswers
    // 保存答案
    correctAnswer: type === 'choice' ? correctAnswer : -1,
    correctAnswers: type === 'multiple' ? correctAnswers || [] : [],

    status: 'pending'
  })

  return { success: true, message: '提交成功，审核通过将获得 50 牛马币奖励！' }
})
