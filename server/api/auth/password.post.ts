// server/api/auth/password.post.ts
import User from '../../models/User' // 保持和你其他文件一样的导入方式
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  // 1. 获取 Token
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  // 2. 获取配置 (关键修复：必须使用和登录时一样的配置)
  const config = useRuntimeConfig()

  let userId
  try {
    // 使用 config.jwtSecret 进行解密，而不是硬编码的 'secret'
    const decoded: any = jwt.verify(token, config.jwtSecret)
    userId = decoded.id // 你的登录接口存的是 id
  } catch (e) {
    throw createError({ statusCode: 401, message: '登录已过期，请重新登录' })
  }

  // 3. 获取提交的旧密码和新密码
  const body = await readBody(event)
  const { oldPassword, newPassword } = body

  if (!oldPassword || !newPassword) {
    throw createError({ statusCode: 400, message: '参数不完整' })
  }

  if (newPassword.length < 6) {
    throw createError({ statusCode: 400, message: '新密码长度不能少于6位' })
  }

  // 4. 查找用户 (加上 +password 以便取出密码字段进行比对)
  const user = await User.findById(userId).select('+password')
  if (!user) {
    throw createError({ statusCode: 404, message: '用户不存在' })
  }

  // 5. 验证旧密码是否正确
  // 注意：bcrypt.compare 是异步的，推荐用异步；你之前用的是 compareSync 也可以，但异步性能更好
  const isMatch = await bcrypt.compare(oldPassword, user.password)
  if (!isMatch) {
    throw createError({ statusCode: 403, message: '旧密码不正确' })
  }

  // 6. 加密新密码并保存
  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(newPassword, salt)

  await user.save()

  return { success: true, message: '密码修改成功' }
})
