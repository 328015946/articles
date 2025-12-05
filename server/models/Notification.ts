// server/models/Notification.ts
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  // 接收者 (谁应该收到这条通知)
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 发送者 (谁触发的操作)
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 类型: 'like' (点赞) | 'comment' (评论) | 'system' (系统消息)
  type: { type: String, required: true, enum: ['like', 'comment', 'system'] },

  // 关联的文章 (可选，因为系统消息可能不关联文章)
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },

  // 附加内容 (比如评论的摘要)
  content: { type: String, default: '' },

  // 是否已读
  isRead: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Notification', schema)
