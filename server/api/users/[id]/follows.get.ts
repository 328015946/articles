/*
 * @Author: zengxiaobin
 * @Date: 2025-12-06 13:52:37
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 13:55:28
 * @FilePath: \xiao-nuxt\server\api\users\[id]\follows.get.ts
 * @Description: 注释
 */
// server/api/users/[id]/follows.get.ts
import Follow from '../../../models/Follow'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const targetId = getRouterParam(event, 'id')
  const { type } = getQuery(event) // type: 'followers' (粉丝) | 'following' (关注了)

  // 1. 获取当前登录用户 ID (用于判断列表里的人我是否关注了)
  let myId = null
  const token = getCookie(event, 'auth_token')
  if (token) {
    try {
      const config = useRuntimeConfig()
      const decoded: any = jwt.verify(token, config.jwtSecret)
      myId = decoded.id
    } catch (e) {}
  }

  // 2. 根据类型构建查询
  let list = []
  if (type === 'followers') {
    // 查谁关注了他 -> 查 follower 字段
    list = await Follow.find({ following: targetId })
      .populate('follower', 'nickname avatar jobTitle company') // 填充粉丝信息
      .sort({ createdAt: -1 })
  } else {
    // 查他关注了谁 -> 查 following 字段
    list = await Follow.find({ follower: targetId })
      .populate('following', 'nickname avatar jobTitle company') // 填充偶像信息
      .sort({ createdAt: -1 })
  }

  // 3. 处理数据格式，并检查“我”是否关注了这些人
  // 使用 Promise.all 处理异步的 isFollowing 检查
  const result = await Promise.all(
    list.map(async item => {
      // 根据类型取不同的用户对象
      const userObj = type === 'followers' ? item.follower : item.following

      // 如果用户已被删除，userObj 可能是 null
      if (!userObj) return null

      // 检查我是否关注了这个用户
      let isFollowing = false
      if (myId && userObj._id.toString() !== myId) {
        isFollowing = !!(await Follow.exists({ follower: myId, following: userObj._id }))
      }

      return {
        _id: userObj._id,
        nickname: userObj.nickname,
        avatar: userObj.avatar,
        jobTitle: userObj.jobTitle,
        company: userObj.company,
        isFollowing // 返回给前端控制按钮样式
      }
    })
  )

  // 过滤掉 null (已删除的用户)
  return result.filter(Boolean)
})
