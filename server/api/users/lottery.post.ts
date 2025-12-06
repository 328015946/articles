import User from '../../models/User'
import jwt from 'jsonwebtoken'

// 奖品配置 (总概率必须是 1)
const PRIZES = [
  { id: 0, name: '10 牛马币', type: 'coin', value: 10, chance: 0.4 },
  { id: 1, name: '谢谢参与', type: 'empty', value: 0, chance: 0.3 },
  { id: 2, name: '20 牛马币', type: 'coin', value: 20, chance: 0.15 },
  { id: 3, name: '50 牛马币', type: 'coin', value: 50, chance: 0.1 },
  { id: 4, name: '100 牛马币', type: 'coin', value: 100, chance: 0.04 },
  { id: 5, name: '掘金周边(假)', type: 'gift', value: 0, chance: 0.009 }, // 极低概率
  { id: 6, name: '1000 牛马币', type: 'coin', value: 1000, chance: 0.001 }, // 大奖
  { id: 7, name: '再来一次', type: 'free', value: 0, chance: 0 } // 暂不处理特殊逻辑，设为0
]

const COST_PER_DRAW = 50 // 每次抽奖消耗 50

export default defineEventHandler(async event => {
  // 1. 鉴权
  const token = getCookie(event, 'auth_token')
  if (!token) throw createError({ statusCode: 401, message: '请先登录' })
  const config = useRuntimeConfig()
  const decoded: any = jwt.verify(token, config.jwtSecret)

  const user = await User.findById(decoded.id)
  if (!user) throw createError({ statusCode: 404 })

  // 2. 检查余额
  if ((user.coin || 0) < COST_PER_DRAW) {
    return { success: false, message: '牛马币不足，快去搬砖吧！' }
  }

  // 3. 扣除费用
  user.coin -= COST_PER_DRAW

  // 4. 抽奖算法 (加权随机)
  const random = Math.random()
  let accumulatedChance = 0
  let selectedPrize = PRIZES[1] // 默认谢谢参与

  for (const prize of PRIZES) {
    accumulatedChance += prize.chance
    if (random < accumulatedChance) {
      selectedPrize = prize
      break
    }
  }

  // 5. 发放奖励
  if (selectedPrize.type === 'coin') {
    user.coin += selectedPrize.value
  }
  // 如果是实物奖励，这里应该写入一个 GiftRecord 表，这里省略

  await user.save()

  return {
    success: true,
    prizeIndex: selectedPrize.id, // 返回索引给前端做动画定位
    prizeName: selectedPrize.name,
    balance: user.coin
  }
})