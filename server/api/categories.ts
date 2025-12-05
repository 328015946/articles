/*
 * @Author: zengxiaobin
 * @Date: 2025-12-05 13:38:20
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 13:38:35
 * @FilePath: \xiao-nuxt\server\api\categories.ts
 * @Description: 注释
 */
import Category from '../models/Category'

export default defineEventHandler(async event => {
  const method = event.method

  // GET: 获取所有分类
  if (method === 'GET') {
    return await Category.find()
  }

  // POST: 新增分类
  if (method === 'POST') {
    const body = await readBody(event)
    return await Category.create(body)
  }
})
