import Decoration from '../../models/Decoration'
import User from '../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const { itemId, type, isUnequip } = await readBody(event)
  const user = await User.findById(decoded.id)

  if (isUnequip) {
    // 卸下：清空对应位置
    user.theme[type] = ''
  } else {
    // 装备：先检查是否拥有
    if (!user.inventory.includes(itemId)) {
      throw createError({ statusCode: 403, message: '你还没购买这个物品' })
    }
    const item = await Decoration.findById(itemId)
    user.theme[type] = item.value // 存入具体的 URL 或颜色值
  }

  await user.save()
  return { success: true, theme: user.theme }
})
