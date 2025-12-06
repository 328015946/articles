/*
 * @Author: zengxiaobin
 * @Date: 2025-12-06 18:04:52
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 18:05:05
 * @FilePath: \xiao-nuxt\server\api\pins\grab.post.ts
 * @Description: 注释
 */
// server/api/pins/grab.post.ts
import Pin from '../../models/Pin'
import User from '../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)
  const userId = decoded.id

  const { pinId } = await readBody(event)

  // 1. 查沸点
  const pin = await Pin.findById(pinId)
  if (!pin || !pin.redPacket || pin.redPacket.remainCount <= 0) {
    return { success: false, message: '手慢了，红包被抢光了！' }
  }

  // 2. 检查是否抢过
  const hasGrabbed = pin.redPacket.grabbedBy.some((item: any) => item.user.toString() === userId)
  if (hasGrabbed) {
    return { success: false, message: '做人不能太贪心，你已经抢过了' }
  }

  // 3. 计算抢到的金额 (二倍均值法)
  let amount = 0
  if (pin.redPacket.remainCount === 1) {
    // 最后一个，全拿走
    amount = pin.redPacket.remainCoin
  } else {
    // 随机范围：0.01 ~ (剩余金额 / 剩余人数 * 2)
    // 这里我们取整，最小 1 个币
    const max = Math.floor((pin.redPacket.remainCoin / pin.redPacket.remainCount) * 2)
    amount = Math.max(1, Math.floor(Math.random() * max))
  }

  // 4. 更新数据库 (Pin 和 User)
  pin.redPacket.remainCount -= 1
  pin.redPacket.remainCoin -= amount
  pin.redPacket.grabbedBy.push({ user: userId, amount })

  await pin.save()

  // 给用户加钱
  await User.findByIdAndUpdate(userId, { $inc: { coin: amount } })

  return { success: true, amount, message: `抢到了 ${amount} 牛马币！` }
})
