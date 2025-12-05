import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true }, // 分类名称
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Category', schema)
