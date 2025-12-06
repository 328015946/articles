/*
 * @Author: zengxiaobin
 * @Date: 2025-12-06 10:24:40
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 11:45:18
 * @FilePath: \xiao-nuxt\server\api\pins\[id]\comments.get.ts
 * @Description: 注释
 */
import PinComment from '../../../models/PinComment'

export default defineEventHandler(async event => {
  const pinId = getRouterParam(event, 'id')

  const comments = await PinComment.find({ pinId })
    .populate('user', 'nickname avatar')
    .populate('replyTo', 'nickname') // ★ 新增：把被回复的人昵称带出来
    .sort({ createdAt: -1 })

  return comments
})
