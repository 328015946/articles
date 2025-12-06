import Pin from '../../models/Pin'
import Follow from '../../models/Follow'
import Notification from '../../models/Notification'
// ★★★ 必须引入 User，否则下面 User.findByIdAndUpdate 会报错导致接口崩溃 ★★★
import User from '../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const body = await readBody(event)
  const { content, images } = body

  if (!content && (!images || images.length === 0)) {
    throw createError({ statusCode: 400, message: '内容不能为空' })
  }

  // 1. 创建沸点 (这一步成功了，数据就进库了)
  const newPin = await Pin.create({
    content: body.content,
    images: images || [],
    author: decoded.id
  })

  // 2. 定义返回给前端的消息 (默认成功)
  let rewardMsg = ''

  // ==========================================
  // ★★★ 安全区域：每日首发奖励逻辑 ★★★
  // (这里加了 try-catch，就算 User 没引入或者报错，也不会炸掉整个接口)
  // ==========================================
  try {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const countToday = await Pin.countDocuments({
      author: decoded.id,
      createdAt: { $gte: startOfDay }
    })

    // 如果只有1条，说明刚才那条是首发
    if (countToday === 1) {
      if (User) {
        await User.findByIdAndUpdate(decoded.id, { $inc: { coin: 100 } })
        rewardMsg = ' (每日首发 +100 币)'
      } else {
        console.error('User 模型未定义，无法发放奖励')
      }
    }
  } catch (err) {
    // 只在后台打印错误，不影响前端
    console.error('每日首发奖励发放失败:', err)
  }

  // ==========================================
  // ★★★ 安全区域：通知粉丝逻辑 ★★★
  // ==========================================
  const sendNotifications = async () => {
    try {
      const followers = await Follow.find({ following: decoded.id })
      if (followers.length > 0) {
        const notifications = followers.map(f => ({
          recipient: f.follower,
          sender: decoded.id,
          type: 'new_pin',
          pin: newPin._id,
          content: body.content.substring(0, 30)
        }))
        await Notification.insertMany(notifications)
      }
    } catch (e) {
      console.error('推送粉丝通知失败:', e)
    }
  }
  // 异步执行，不阻塞
  sendNotifications()

  // 3. 返回成功
  return { success: true, data: newPin, message: '发布成功' + rewardMsg }
})
