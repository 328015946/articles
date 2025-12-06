/*
 * @Author: zengxiaobin
 * @Date: 2025-12-06 10:59:42
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 12:01:36
 * @FilePath: \xiao-nuxt\server\api\comments.get.ts
 * @Description: 注释
 */
// server/api/comments.get.ts
import Comment from '../models/Comment'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const { articleId, pinId } = query

  const filter: any = {}

  if (articleId) {
    filter.articleId = articleId
  } else if (pinId) {
    // ⚠️ 注意：通常 Pin 的评论存在 PinComment 表里
    // 如果你确定要在这里查，请确保 Comment 模型里有 pinId 字段
    filter.pinId = pinId
  } else {
    return []
  }

  try {
    const comments = await Comment.find(filter)
      // ★★★ 核心修复：把 'user' 改成 'author' ★★★
      // 因为你的 Comment 模型里定义的字段名是 author
      .populate('author', 'nickname avatar')
      .sort({ createdAt: -1 })

    return comments
  } catch (e) {
    console.error('获取评论失败:', e)
    return []
  }
})
