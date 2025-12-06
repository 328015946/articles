import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  content: { type: String, required: true },

  // ★★★ 新增：图片数组 (存 URL) ★★★
  images: { type: [String], default: [] },

  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Pin || mongoose.model('Pin', schema)
