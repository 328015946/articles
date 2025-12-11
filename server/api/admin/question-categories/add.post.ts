import QuestionCategory from '../../../models/QuestionCategory'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 鉴权
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)
  if (decoded.role !== 'admin') throw createError({ statusCode: 403 })

  const body = await readBody(event)
  if (!body.name) throw createError({ statusCode: 400 })

  return await QuestionCategory.create({
    name: body.name,
    icon: body.icon || '📝',
    sort: body.sort || 0
  })
})