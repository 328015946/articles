import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  // 关注者 (粉丝)
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // 被关注者 (偶像)
  following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  createdAt: { type: Date, default: Date.now }
})

// 复合索引，防止重复关注同一个人
schema.index({ follower: 1, following: 1 }, { unique: true })

export default mongoose.models.Follow || mongoose.model('Follow', schema)
