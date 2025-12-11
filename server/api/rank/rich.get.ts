/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 19:30:20
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 19:30:30
 * @FilePath: \xiao-nuxt\server\api\rank\rich.get.ts
 * @Description: 注释
 */
import User from '../../models/User'

export default defineEventHandler(async event => {
  return await User.find().select('nickname avatar coin').sort({ coin: -1 }).limit(10).lean()
})
