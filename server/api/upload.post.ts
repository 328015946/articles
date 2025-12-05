// server/api/upload.post.ts
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export default defineEventHandler(async event => {
  // 1. 确定上传目录：项目的 public/uploads 文件夹
  // process.cwd() 获取当前运行目录
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')

  // 如果文件夹不存在，就自动创建一个
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  // 2. 配置 formidable
  const form = formidable({
    uploadDir: uploadDir, // 上传到哪
    keepExtensions: true, // 保留后缀名 (.jpg/.png)
    maxFileSize: 5 * 1024 * 1024, // 限制最大 5MB
    filename: (name, ext, part, form) => {
      // 重命名文件：时间戳 + 随机数 + 后缀
      // 例如：1700000000000-12345.jpg
      return `${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`
    }
  })

  // 3. 解析上传的文件
  return new Promise((resolve, reject) => {
    form.parse(event.node.req, (err, fields, files) => {
      if (err) {
        reject(createError({ statusCode: 500, message: '上传失败' }))
        return
      }

      // 获取上传的文件对象 (前端必须用 formData.append('file', ...))
      // 注意：formidable v3 返回的是数组，取第一个
      const file = Array.isArray(files.file) ? files.file[0] : files.file

      if (!file) {
        reject(createError({ statusCode: 400, message: '未找到文件' }))
        return
      }

      // 4. 返回访问路径
      // newFilename 是刚才重命名后的名字
      const fileUrl = `/uploads/${file.newFilename}`

      resolve({
        url: fileUrl,
        originalName: file.originalFilename
      })
    })
  })
})
