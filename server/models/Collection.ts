import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // 谁收藏的
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true }, // 收藏了哪篇
  createdAt: { type: Date, default: Date.now }
})
// 复合唯一索引：防止重复收藏同一篇文章
schema.index({ user: 1, article: 1 }, { unique: true })

export default mongoose.model('Collection', schema)