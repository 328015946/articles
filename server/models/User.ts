/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 11:51:15
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 18:20:04
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
  // ★★★ 新增：已购买的装饰品 ID 列表 ★★★
  inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Decoration' }],

  // ★★★ 新增：当前佩戴的装饰 (直接存值，方便前端渲染) ★★★
  theme: {
    frame: { type: String, default: '' }, // 头像框 URL
    bg: { type: String, default: '' }, // 背景图 URL 或 渐变色
    color: { type: String, default: '' } // 昵称颜色
  },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('User', schema)
