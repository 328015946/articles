import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },

  // === 新增：点赞列表 ===
  // 数组里存的是 User ID。数组长度就是点赞数。
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // =====================

  isRecommended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Article', schema)
