/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 18:49:11
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 11:59:38
 * @FilePath: \xiao-nuxt\server\models\Comment.ts
 * @Description: 注释
 */
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  content: { type: String, required: true },

  // 这两个字段二选一，所以去掉 required: true，或者由业务逻辑控制
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  pinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pin' },

  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // 评论也能点赞
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Comment', schema)
