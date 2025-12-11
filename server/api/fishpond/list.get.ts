// server/api/fishpond/list.get.ts
import Message from '../../models/Message'
import User from '../../models/User' // 引入 User
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 获取当前用户 (尝试更新心跳)
  const token = getCookie(event, 'auth_token')
  if (token) {
    try {
      const config = useRuntimeConfig()
      const decoded: any = jwt.verify(token, config.jwtSecret)

      // ★★★ 核心 1：更新当前用户的活跃时间 ★★★
      // 只要用户拉取消息，就证明他还活着
      await User.findByIdAndUpdate(decoded.id, { lastActiveAt: new Date() })
    } catch (e) {
      // Token 过期忽略，算作游客
    }
  }

  // 2. ★★★ 核心 2：统计在线人数 ★★★
  // 定义：过去 30 秒内有过活跃记录的用户
  const threshold = new Date(Date.now() - 30 * 1000)
  const onlineCount = await User.countDocuments({
    lastActiveAt: { $gt: threshold }
  })

  // 3. 获取消息列表 (原有逻辑)
  const messages = await Message.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('sender', 'nickname avatar theme')
    .lean()

  // 4. 返回组合数据
  return {
    onlineCount, // 在线人数
    list: messages.reverse() // 消息列表
  }
})
