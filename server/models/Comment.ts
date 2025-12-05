import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  content: { type: String, required: true }, // 评论内容
  // 关联文章
  articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  // 关联评论人
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Comment', schema)
