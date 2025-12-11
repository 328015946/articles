/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 17:22:15
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 17:37:39
 * @FilePath: \xiao-nuxt\server\models\QuestionCategory.ts
 * @Description: 注释
 */
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '📝' },
  sort: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

// 这里的模型名称建议用单数 'QuestionCategory'
export default mongoose.models.QuestionCategory || mongoose.model('QuestionCategory', schema)
