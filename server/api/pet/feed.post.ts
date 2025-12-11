/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 19:46:33
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 19:46:41
 * @FilePath: \xiao-nuxt\server\api\pet\feed.post.ts
 * @Description: 注释
 */
import Pet from '../../models/Pet'
import User from '../../models/User'
import jwt from 'jsonwebtoken'

// 饲料配置
const FOODS = {
  coffee: { name: '冰美式', price: 20, exp: 20 },
  bug: { name: '陈年Bug', price: 50, exp: 60 }, // 性价比高
  cake: { name: '老板的大饼', price: 100, exp: 150 }
}

// 升级所需经验公式：Level * 100
const getLevelUpExp = (level: number) => level * 100

export default defineEventHandler(async event => {
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401 })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const { foodType } = await readBody(event)
  const food = FOODS[foodType as keyof typeof FOODS]
  if (!food) throw createError({ statusCode: 400, message: '饲料不存在' })

  // 1. 扣用户的钱
  const user = await User.findById(decoded.id)
  if (user.coin < food.price) {
    return { success: false, message: '牛马币不足，快去发帖赚币！' }
  }
  user.coin -= food.price
  await user.save()

  // 2. 增加宠物经验
  const pet = await Pet.findOne({ master: decoded.id })
  if (!pet) throw createError({ statusCode: 404, message: '请先领养宠物' })

  pet.exp += food.exp

  // 3. 升级逻辑 (循环判断，防止一次吃太多连升几级)
  let levelUp = false
  let evolution = false

  while (pet.exp >= getLevelUpExp(pet.level)) {
    pet.exp -= getLevelUpExp(pet.level)
    pet.level += 1
    levelUp = true

    // 4. 进化逻辑 (每 5 级进化一次形态)
    // 1-4级:蛋, 5-9级:实习生, 10-14级:打工仔...
    const newStage = Math.floor(pet.level / 5)
    if (newStage > pet.stage && newStage <= 4) {
      pet.stage = newStage
      evolution = true
    }
  }

  await pet.save()

  return {
    success: true,
    message: evolution ? '🎉 恭喜！你的牛马进化了！' : levelUp ? '✨ 升级了！' : `喂食成功，经验 +${food.exp}`,
    pet,
    remainCoin: user.coin
  }
})
