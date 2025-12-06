/*
 * @Author: zengxiaobin
 * @Date: 2025-12-06 18:14:56
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 18:15:09
 * @FilePath: \xiao-nuxt\server\models\Decoration.ts
 * @Description: 注释
 */
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  // 类型: frame(头像框), bg(背景), color(昵称颜色)
  type: { type: String, required: true, enum: ['frame', 'bg', 'color'] },
  // 对应的值: 图片URL 或 CSS颜色代码
  value: { type: String, required: true },
  price: { type: Number, required: true }, // 价格
  preview: { type: String }, // 预览图 (可选)
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Decoration || mongoose.model('Decoration', schema)
