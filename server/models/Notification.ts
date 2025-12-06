// server/models/Notification.ts
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 类型增加 'pin_comment' (沸点评论)
  type: { type: String, required: true, enum: ['like', 'comment', 'system', 'pin_comment', 'new_follower'] },

  // 文章相关 (可选)
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },

  // ★★★ 新增：沸点相关 (可选) ★★★
  pin: { type: mongoose.Schema.Types.ObjectId, ref: 'Pin' },

  content: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Notification || mongoose.model('Notification', schema)
