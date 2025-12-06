import Decoration from '../../models/Decoration'
import User from '../../models/User'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  let myInventory: string[] = []

  // 如果登录了，查一下我拥有哪些
  if (token) {
    try {
      const config = useRuntimeConfig()
      const decoded: any = jwt.verify(token, config.jwtSecret)
      const user = await User.findById(decoded.id)
      myInventory = user.inventory.map((id: any) => id.toString())
    } catch (e) {}
  }

  const list = await Decoration.find()

  // 标记是否已购买
  return list.map(item => ({
    ...item.toObject(),
    isOwned: myInventory.includes(item._id.toString())
  }))
})
