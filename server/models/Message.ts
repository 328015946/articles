/*
 * @Author: zengxiaobin
 * @Date: 2025-12-09 19:23:07
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 19:23:17
 * @FilePath: \xiao-nuxt\server\models\Message.ts
 * @Description: 注释
 */
import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  content: { type: String, required: true },
  // 发送者
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // 消息类型: text(文本), image(图片), system(系统通知)
  type: { type: String, default: 'text', enum: ['text', 'image', 'system'] },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Message || mongoose.model('Message', schema)
