import Question from '../../../models/Question'
import User from '../../../models/User'
import Notification from '../../../models/Notification'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 管理员鉴权
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)
  if (decoded.role !== 'admin') throw createError({ statusCode: 403 })

  const { id, pass, reason } = await readBody(event) // id:题目ID, pass:是否通过

  const question = await Question.findById(id)
  if (!question) throw createError({ statusCode: 404 })

  // 防止重复审核
  if (question.status !== 'pending') {
    return { success: false, message: '该题目已审核过' }
  }

  if (pass) {
    // === 审核通过 ===
    question.status = 'approved'
    await question.save()

    // A. 发放奖励 (比如 50 币)
    await User.findByIdAndUpdate(question.author, { $inc: { coin: 50 } })

    // B. 发送通知
    await Notification.create({
      recipient: question.author,
      sender: decoded.id,
      type: 'system',
      content: `恭喜！你提交的面试题《${question.title}》审核通过，获得 50 牛马币奖励！`
    })

  } else {
    // === 审核拒绝 ===
    question.status = 'rejected'
    question.rejectReason = reason || '内容不符合规范'
    await question.save()

    // 发送拒绝通知
    await Notification.create({
      recipient: question.author,
      sender: decoded.id,
      type: 'system',
      content: `很遗憾，你提交的面试题《${question.title}》未通过审核。原因：${question.rejectReason}`
    })
  }

  return { success: true, message: '审核完成' }
})