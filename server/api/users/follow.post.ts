// server/api/users/follow.post.ts
import Follow from '../../models/Follow'
import Notification from '../../models/Notification' // 引入通知
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '请先登录' })

  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)
  const myId = decoded.id

  const body = await readBody(event)
  const targetId = body.targetId // 对方的 ID

  if (myId === targetId) throw createError({ statusCode: 400, message: '不能关注自己' })

  // 1. 检查是否已关注
  const existingFollow = await Follow.findOne({ follower: myId, following: targetId })

  if (existingFollow) {
    // === 取消关注 ===
    await Follow.findByIdAndDelete(existingFollow._id)
    return { isFollowing: false }
  } else {
    // === 关注 ===
    await Follow.create({
      follower: myId,
      following: targetId
    })

    // ★★★ 2. 发送通知逻辑 ★★★
    try {
      // 防止重复通知 (比如反复取关又关注)
      const notiExist = await Notification.findOne({
        recipient: targetId,
        sender: myId,
        type: 'new_follower'
      })

      if (!notiExist) {
        await Notification.create({
          recipient: targetId, // 发给对方
          sender: myId, // 发送者是我
          type: 'new_follower',
          content: '关注了你' // 简单文案
        })
      }
    } catch (e) {
      console.error('关注通知失败', e)
    }

    return { isFollowing: true }
  }
})
