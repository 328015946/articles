// server/api/pins/comment.post.ts
import PinComment from '../../models/PinComment'
import Pin from '../../models/Pin'
import Notification from '../../models/Notification'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '请先登录' })

  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const body = await readBody(event)
  const { pinId, content, parentId, replyTo } = body

  // 1. 创建评论
  const newComment = await PinComment.create({
    pinId,
    content,
    user: decoded.id,
    parentId: parentId || null,
    replyTo: replyTo || null
  })

  // 2. 更新沸点评论数
  await Pin.findByIdAndUpdate(pinId, { $inc: { commentCount: 1 } })

  // 3. ★★★ 发送通知 (修复版) ★★★
  try {
    // 场景 A: 回复了具体某个人
    if (replyTo && replyTo !== decoded.id) {
      await Notification.create({
        recipient: replyTo,
        sender: decoded.id,
        type: 'pin_comment', // ★ 改为沸点评论类型
        pin: pinId, // ★ 关联沸点 ID
        content: content.substring(0, 50) // ★ 只存内容，不存“回复了你”这种字眼
      })
    }
    // 场景 B: 评论沸点 (通知作者)
    else {
      const pin = await Pin.findById(pinId)
      if (pin && pin.author.toString() !== decoded.id) {
        await Notification.create({
          recipient: pin.author,
          sender: decoded.id,
          type: 'pin_comment', // ★ 改为沸点评论类型
          pin: pin._id, // ★ 关联沸点 ID
          content: content.substring(0, 50)
        })
      }
    }
  } catch (e) {
    console.error('沸点通知失败:', e)
  }

  // 返回数据
  await newComment.populate('user', 'nickname avatar')
  if (replyTo) await newComment.populate('replyTo', 'nickname')

  return newComment
})
