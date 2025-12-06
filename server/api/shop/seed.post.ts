import Decoration from '../../models/Decoration'

export default defineEventHandler(async event => {
  await Decoration.deleteMany({}) // 清空旧数据

  const items = [
    // 头像框
    { name: '黄金矿工框', type: 'frame', price: 100, value: 'https://cdn-icons-png.flaticon.com/512/2583/2583166.png' }, // 示例图
    { name: '王者之环', type: 'frame', price: 500, value: 'https://cdn-icons-png.flaticon.com/512/5716/5716364.png' },

    // 昵称颜色
    { name: '尊贵红名', type: 'color', price: 200, value: '#ff4d4f' },
    { name: '土豪金名', type: 'color', price: 800, value: '#d48806' },

    // 背景图
    { name: '极光背景', type: 'bg', price: 300, value: 'linear-gradient(135deg, #8BC6EC 0%, #9599E2 100%)' },
    { name: '黑金背景', type: 'bg', price: 1000, value: 'linear-gradient(to right, #434343 0%, black 100%)' }
  ]

  await Decoration.insertMany(items)
  return { success: true, message: '商品进货完成' }
})
