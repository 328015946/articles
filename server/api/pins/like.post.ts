import Pin from '../../models/Pin'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 鉴权
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '请先登录' })

  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)
  const userId = decoded.id

  // 2. 获取参数
  const body = await readBody(event)
  const pinId = body.id

  // 3. 查沸点
  const pin = await Pin.findById(pinId)
  if (!pin) throw createError({ statusCode: 404, message: '沸点不存在' })

  // 4. 判断逻辑
  const isLiked = pin.likes.some((id: any) => id.toString() === userId)

  if (isLiked) {
    // === 已赞过 -> 取消赞 ===
    await Pin.findByIdAndUpdate(pinId, { $pull: { likes: userId } })
    return { success: true, liked: false }
  } else {
    // === 没赞过 -> 点赞 ===
    await Pin.findByIdAndUpdate(pinId, { $addToSet: { likes: userId } })
    return { success: true, liked: true }
  }
})
