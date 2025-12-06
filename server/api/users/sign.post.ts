import User from '../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 鉴权
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '请先登录' })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const user = await User.findById(decoded.id)
  if (!user) throw createError({ statusCode: 404, message: '用户不存在' })

  // 2. 判断今天是否已签到
  const now = new Date()
  const lastSign = user.lastSignDate ? new Date(user.lastSignDate) : null

  // 判断是否是同一天
  if (
    lastSign &&
    lastSign.getFullYear() === now.getFullYear() &&
    lastSign.getMonth() === now.getMonth() &&
    lastSign.getDate() === now.getDate()
  ) {
    return { success: false, message: '今天已经搬过砖了，明天再来吧！' }
  }

  // 3. 计算连续签到 (判断上次签到是否是昨天)
  let isContinuous = false
  if (lastSign) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (lastSign.getDate() === yesterday.getDate() && lastSign.getMonth() === yesterday.getMonth()) {
      isContinuous = true
    }
  }

  // 4. 计算奖励
  let reward = 10 // 基础奖励 10 个
  let streak = isContinuous ? user.signStreak + 1 : 1

  // 连续签到奖励加成 (每多一天加 5 个，封顶 50 个)
  if (streak > 1) {
    reward += Math.min((streak - 1) * 5, 40)
  }

  // 5. 更新数据库
  user.coin += reward
  user.lastSignDate = now
  user.signStreak = streak
  await user.save()

  return {
    success: true,
    message: `签到成功！获得 ${reward} 牛马币`,
    data: { coin: user.coin, streak: user.signStreak, added: reward }
  }
})
