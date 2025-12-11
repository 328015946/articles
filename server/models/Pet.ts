/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 19:45:31
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 19:45:43
 * @FilePath: \xiao-nuxt\server\models\Pet.ts
 * @Description: 注释
 */
// server/models/Pet.ts
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  // 主人
  master: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  name: { type: String, default: '未命名牛马' },

  // 等级体系
  level: { type: Number, default: 1 }, // 当前等级
  exp: { type: Number, default: 0 }, // 当前经验值
  stage: { type: Number, default: 0 }, // 进化阶段 (0-4)

  // 状态
  energy: { type: Number, default: 100 }, // 体力 (暂时预留，可做挂机打工功能)

  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Pet || mongoose.model('Pet', schema)
