import User from '../../../models/User'
import Article from '../../../models/Article'
import Pin from '../../../models/Pin'
import Follow from '../../../models/Follow'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async event => {
  const targetUserId = getRouterParam(event, 'id')

  // 1. 获取当前登录用户 (为了判断我是否关注了他)
  let currentUserId = null
  const token = getCookie(event, 'auth_token')
  if (token) {
    try {
      const config = useRuntimeConfig()
      const decoded: any = jwt.verify(token, config.jwtSecret)
      currentUserId = decoded.id
    } catch (e) {}
  }

  // 2. 查用户信息
  const user = await User.findById(targetUserId).select('-password')
  if (!user) throw createError({ statusCode: 404, message: '用户不存在' })

  // 3. 并发查询统计数据
  const [
    articleCount,
    pinCount,
    followerCount, // 关注他的人
    followingCount, // 他关注的人
    isFollowing, // 我是否关注了他
    totalLikes // 获得的总点赞 (需要聚合)
  ] = await Promise.all([
    Article.countDocuments({ author: targetUserId }),
    Pin.countDocuments({ author: targetUserId }),
    Follow.countDocuments({ following: targetUserId }),
    Follow.countDocuments({ follower: targetUserId }),
    // 如果登录了，查一下是否关注；没登录直接 false
    currentUserId ? Follow.exists({ follower: currentUserId, following: targetUserId }) : false,

    // 聚合计算文章获赞总数
    Article.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          likesCount: {
            // 同样的修复逻辑
            $size: { $ifNull: ['$likes', []] }
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$likesCount' } } }
    ]).then(res => res[0]?.total || 0)
  ])

  // 4. 聚合计算沸点获赞 (可选，如果也要算进去)
  const pinLikes = await Pin.aggregate([
    { $match: { author: user._id } },
    {
      $project: {
        likesCount: {
          // 同样的修复逻辑
          $size: { $ifNull: ['$likes', []] }
        }
      }
    },
    { $group: { _id: null, total: { $sum: '$likesCount' } } }
  ]).then(res => res[0]?.total || 0)

  return {
    user,
    stats: {
      articleCount,
      pinCount,
      followerCount,
      followingCount,
      totalLikes: totalLikes + pinLikes
    },
    isFollowing: !!isFollowing // 转布尔值
  }
})
