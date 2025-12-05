/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 13:33:16
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 13:33:37
 * @FilePath: \xiao-nuxt\server\api\users.post.ts
 * @Description: 注释
 */
// server/api/users.post.ts
import User from '../models/User' // 注意用相对路径，防止报错

export default defineEventHandler(async event => {
  // 1. 获取前端传过来的 JSON 数据 (比如 { name: "新用户" })
  const body = await readBody(event)

  // 2. 简单的校验
  if (!body.name) {
    throw createError({ statusCode: 400, message: '名字不能为空' })
  }

  // 3. 存入 MongoDB
  const newUser = new User({
    name: body.name
    // 如果你的 User 模型还有其他字段（如 age, email），可以在这里加
  })

  await newUser.save()

  // 4. 返回保存成功的数据
  return newUser
})
