/*
 * @Author: zengxiaobin
 * @Date: 2025-12-06 11:23:01
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 14:08:00
 * @FilePath: \xiao-nuxt\server\api\pins\index.post.ts
 * @Description: 注释
 */
import Pin from '../../models/Pin'
import Follow from '../../models/Follow' // ★ 引入关注模型
import Notification from '../../models/Notification' // ★ 引入通知
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const body = await readBody(event)
  // ★★★ 接收 images 数组 ★★★
  const { content, images } = body
  if (!content && (!images || images.length === 0)) {
    throw createError({ statusCode: 400, message: '内容不能为空' })
  }

  // 1. 创建沸点 (这里结束语句，不要后面紧跟括号)
  const newPin = await Pin.create({
    content: body.content,
    images: images || [],
    author: decoded.id
  })

  // 2. ★★★ 核心：通知所有粉丝 ★★★
  // 定义一个异步函数处理通知
  const sendNotifications = async () => {
    try {
      // A. 查找所有关注了“我”的人
      const followers = await Follow.find({ following: decoded.id })

      if (followers.length > 0) {
        // B. 准备通知数据
        const notifications = followers.map(f => ({
          recipient: f.follower, // 发给粉丝
          sender: decoded.id, // 发送者是我
          type: 'new_pin', // 类型：新沸点
          pin: newPin._id, // 关联沸点
          content: body.content.substring(0, 30) // 摘要
        }))

        // C. 批量插入通知
        await Notification.insertMany(notifications)
      }
    } catch (e) {
      console.error('推送粉丝通知失败:', e)
    }
  }

  // 执行通知逻辑 (不加 await，实现“Fire and Forget”，不阻塞接口返回)
  sendNotifications()

  return { success: true, data: newPin }
})
