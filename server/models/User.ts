import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '新用户' },
  // === 新增：角色字段 ===
  // admin = 管理员, user = 普通用户
  role: { type: String, default: 'user' },
  avatar: { type: String, default: '' }, // ★★★ 新增这一行 ★★★
  // ===================
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('User', schema)
