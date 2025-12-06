/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 11:51:15
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 10:03:25
 * @FilePath: \xiao-nuxt\server\models\User.ts
 * @Description: 注释
 */
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '新用户' },
  // === 新增：角色字段 ===
  // admin = 管理员, user = 普通用户
  role: { type: String, default: 'user' },
  avatar: { type: String, default: '' }, // ★★★ 新增这一行 ★★★
  // === 新增字段 ===
  coin: { type: Number, default: 0 }, // 牛马币余额
  lastSignDate: { type: Date }, // 上次签到日期 (用于判断今天是否已签)
  signStreak: { type: Number, default: 0 }, // 连续签到天数
  // ===================
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('User', schema)
