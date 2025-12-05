// seed.js - 自动生成测试数据 (加强版)

// 1. 获取用户
var currentUser = db.users.findOne()

// 2. 检查用户是否存在
if (!currentUser) {
  print('❌ 错误：本地数据库里没有用户！')
  print('请先去浏览器注册一个账号 (localhost:3000/register)，然后再运行此脚本。')
  quit() // 退出脚本
}

// 3. 获取分类，如果没有，自动创建！
var categories = db.categories.find().toArray()

if (categories.length === 0) {
  print('⚠️ 检测到没有分类，正在自动创建默认分类...')

  db.categories.insertMany([
    { name: '前端开发', createdAt: new Date() },
    { name: '后端架构', createdAt: new Date() },
    { name: '生活感悟', createdAt: new Date() },
    { name: 'Nuxt实战', createdAt: new Date() }
  ])

  // 重新获取一遍，因为刚才插入了新数据
  categories = db.categories.find().toArray()
  print('✅ 已创建 4 个默认分类')
}

print('🚀 开始为用户 [' + currentUser.username + '] 生成 50 篇测试文章...')

var prefixes = [
  '深入理解',
  '2025年',
  '快速上手',
  '为什么说',
  '十分钟学会',
  '关于',
  '绝对干货:',
  '新手必看:',
  '实战记录:'
]
var keywords = [
  'Nuxt 4',
  'MongoDB',
  'Vue.js',
  'Node.js',
  'Docker',
  '微服务',
  'TypeScript',
  'Tailwind CSS',
  '职业规划',
  '健康生活'
]
var suffixes = ['的最佳实践', '避坑指南', '入门教程', '源码分析', '性能优化技巧', '心得体会', '开发日志']

var articles = []

for (var i = 0; i < 50; i++) {
  var p = prefixes[Math.floor(Math.random() * prefixes.length)]
  var k = keywords[Math.floor(Math.random() * keywords.length)]
  var s = suffixes[Math.floor(Math.random() * suffixes.length)]
  var title = p + ' ' + k + ' ' + s
  var randomCat = categories[Math.floor(Math.random() * categories.length)]

  // 随机日期
  var randomDate = new Date()
  randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30))

  articles.push({
    title: title,
    content: `## ${title}\n\n这是自动生成的文章。\n\n${k} 是一个非常棒的技术。\n\n> 生成时间：${new Date().toLocaleString()}`,
    category: randomCat._id,
    author: currentUser._id,
    views: Math.floor(Math.random() * 5000) + 100,
    isRecommended: Math.random() > 0.8,
    createdAt: randomDate
  })
}

db.articles.insertMany(articles)
print('🎉 成功插入 50 篇文章！请刷新本地网页查看。')
