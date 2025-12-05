// server/api/users.delete.ts
import User from '../models/User'

export default defineEventHandler(async event => {
  // 1. 获取前端传过来的 ID
  const body = await readBody(event)
  const id = body.id

  if (!id) {
    throw createError({ statusCode: 400, message: '缺少 ID' })
  }

  // 2. 根据 ID 删除数据库里的记录
  await User.findByIdAndDelete(id)

  return { success: true }
})
