import Message from '../../models/Message'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const body = await readBody(event)
  if (!body.content) throw createError({ statusCode: 400 })

  const msg = await Message.create({
    content: body.content,
    type: 'text',
    sender: decoded.id
  })

  // 返回填充好的数据，方便前端直接上屏
  await msg.populate('sender', 'nickname avatar theme')

  return { success: true, data: msg }
})
