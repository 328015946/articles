import Pin from '../../models/Pin'

export default defineEventHandler(async event => {
  // 获取点赞数最多的前 3 条沸点
  const pins = await Pin.find()
    .sort({ 'likes.length': -1, commentCount: -1 }) // 伪代码逻辑：按热度排序
    // 注意：MongoDB sort 数组长度比较麻烦，这里简单处理：按评论数排序作为代替，或者按时间
    // 实际项目中通常有一个 score 字段。这里我们简单按 commentCount 排序演示。
    .sort({ commentCount: -1, createdAt: -1 })
    .limit(3)
    .populate('author', 'nickname') // 只要昵称

  return pins
})
