import Decoration from '../../models/Decoration'
import User from '../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const { itemId } = await readBody(event)

  const user = await User.findById(decoded.id)
  const item = await Decoration.findById(itemId)

  if (!item) throw createError({ statusCode: 404, message: '商品不存在' })

  // 检查是否已拥有
  if (user.inventory.includes(itemId)) {
    return { success: false, message: '你已经拥有该物品了' }
  }

  // 检查余额
  if (user.coin < item.price) {
    return { success: false, message: '牛马币不足，请去搬砖' }
  }

  // 扣款并入库
  user.coin -= item.price
  user.inventory.push(item._id)
  await user.save()

  return { success: true, message: '购买成功' }
})
