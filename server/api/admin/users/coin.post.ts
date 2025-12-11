/*
 * @Author: zengxiaobin
 * @Date: 2025-12-10 09:52:35
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-10 09:52:53
 * @FilePath: \xiao-nuxt\server\api\admin\users\coin.post.ts
 * @Description: 注释
 */
import User from '../../../models/User'
import Notification from '../../../models/Notification'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 鉴权...
  const token = getCookie(event, 'auth_token')
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)
  if (decoded.role !== 'admin') throw createError({ statusCode: 403 })

  const { id, amount, reason } = await readBody(event)

  // amount 可以是正数(充值) 或 负数(扣除)
  const num = Number(amount)
  if (!num) throw createError({ statusCode: 400, message: '金额无效' })

  const user = await User.findByIdAndUpdate(id, { $inc: { coin: num } }, { new: true })

  // 发个系统通知告诉用户
  await Notification.create({
    recipient: id,
    sender: decoded.id,
    type: 'system',
    content: `管理员${num > 0 ? '赠送' : '扣除'}了你 ${Math.abs(num)} 牛马币。原因：${reason || '系统调整'}`
  })

  return { success: true, coin: user.coin }
})
