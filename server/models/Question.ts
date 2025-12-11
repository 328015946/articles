/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 16:19:50
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 18:53:38
 * @FilePath: \xiao-nuxt\server\models\Question.ts
 * @Description: 注释
 */
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  title: { type: String, required: true },

  // 类型
  type: { type: String, default: 'text', enum: ['choice', 'text', 'multiple'] },

  // 选项 & 正确答案
  options: { type: [String], default: [] },
  correctAnswer: { type: Number, default: -1 },

  // ★★★ 核心修复：把 answer 的 required 去掉，或者保留 analysis ★★★
  // 为了兼容性，建议把 answer 保留但设为可选，主要使用 analysis
  answer: { type: String, default: '' }, // 去掉 required: true

  // 这是我们现在主要用的字段
  analysis: { type: String, default: '' },

  tags: { type: [String], default: [] },
  difficulty: { type: Number, default: 1 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  rejectReason: { type: String, default: '' },
  views: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionCategory', required: true },
  createdAt: { type: Date, default: Date.now },
  // ★★★ 新增：多选答案 (索引数组) ★★★
  correctAnswers: { type: [Number], default: [] }
})

// 防止模型重复编译
export default mongoose.models.Question || mongoose.model('Question', schema)
