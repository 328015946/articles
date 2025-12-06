// server/models/PinComment.ts
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  pinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pin', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },

  // ★★★ 新增：回复相关字段 ★★★
  // 父评论 ID (如果是回复别人的评论，这里存那条评论的 ID)
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'PinComment', default: null },
  // 被回复的人 (方便前端直接显示 "回复 @某某")
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('PinComment', schema)
