import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  content: { type: String, required: true },

  // ★★★ 新增：图片数组 (存 URL) ★★★
  images: { type: [String], default: [] },

  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  // ★★★ 新增：红包配置 ★★★
  redPacket: {
    totalCoin: { type: Number, default: 0 }, // 总金额
    totalCount: { type: Number, default: 0 }, // 总个数
    remainCount: { type: Number, default: 0 }, // 剩余个数
    remainCoin: { type: Number, default: 0 }, // 剩余金额
    // 抢过的人 (防止重复抢)
    grabbedBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: Number,
        time: { type: Date, default: Date.now }
      }
    ]
  }
})

export default mongoose.models.Pin || mongoose.model('Pin', schema)
