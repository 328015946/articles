<!-- pages/user/lottery.vue -->
<script setup>
  const user = useUser()
  // 获取最新余额
  const { data: myStats, refresh } = await useFetch('/api/users/stats', { immediate: !!user.value })

  // 奖品配置 (需要和后端对应，为了显示图片/文字)
  // 顺序：0 1 2
  //       7 x 3
  //       6 5 4
  const prizes = ref([
    { id: 0, name: '10 币', color: '#FFF4D6' },
    { id: 1, name: '谢谢', color: '#F2F3F5' },
    { id: 2, name: '20 币', color: '#FFF4D6' },
    { id: 7, name: '再来', color: '#EAF2FF' }, // 这个位置是DOM顺序的第4个，逻辑顺序的第8个
    { id: 3, name: '50 币', color: '#FFDFA8' },
    { id: 6, name: '1000 币', color: '#FF4D4F', textWhite: true },
    { id: 5, name: '周边', color: '#E1D3FF' },
    { id: 4, name: '100 币', color: '#FF9F38' }
  ])

  // 奖品排列顺序 (对应九宫格顺时针旋转的索引)
  // DOM布局是 3x3 Grid，索引 0-8，中间是 4(按钮)
  // 我们的 prizes 数组长度是8，我们需要把它们映射到 Grid 的 0,1,2, 5,8,7, 6,3 的位置
  // 简单点：我们直接在 template 里按 Grid 顺序写死，然后高亮索引按顺时针跑。

  // 顺时针索引映射表: 0->1->2->5->8->7->6->3 (中间是4，不跑)
  const gridOrder = [0, 1, 2, 5, 8, 7, 6, 3]
  // 对应奖品ID:     0, 1, 2, 3, 4, 5, 6, 7

  const activeIndex = ref(-1) // 当前亮起的位置 (0-7)
  const isDrawing = ref(false)

  const startLottery = async () => {
    if (isDrawing.value) return
    if ((myStats.value?.coin || 0) < 50) return alert('余额不足50牛马币')

    isDrawing.value = true

    try {
      // 1. 请求接口获取结果
      const res = await $fetch('/api/users/lottery', { method: 'POST' })
      if (!res.success) {
        alert(res.message)
        isDrawing.value = false
        return
      }

      const targetId = res.prizeIndex // 后端返回的中奖ID (0-7)

      // 2. 开始动画
      let currentStep = 0
      let speed = 100 // 初始速度
      let round = 0 // 圈数
      const maxRound = 4 // 至少转几圈

      const run = () => {
        // 计算当前亮起的是哪个奖品ID
        activeIndex.value = currentStep % 8

        // 停止条件：转够圈数 且 当前位置等于目标位置
        if (round >= maxRound && activeIndex.value === targetId) {
          setTimeout(() => {
            alert(`🎉 恭喜获得：${res.prizeName}`)
            isDrawing.value = false
            // 更新余额
            if (myStats.value) myStats.value.coin = res.balance
          }, 500)
          return
        }

        // 计数
        currentStep++
        if (currentStep % 8 === 0) round++

        // 减速逻辑：最后半圈开始减速
        if (round >= maxRound - 1) {
          speed += 20
        }

        setTimeout(run, speed)
      }

      run()
    } catch (e) {
      alert('抽奖出错')
      isDrawing.value = false
    }
  }
</script>

<template>
  <div class="user-center-layout">
    <div class="center-container">
      <!-- 左侧导航 -->
      <aside class="left-nav">
        <div class="nav-title">个人中心</div>
        <NuxtLink to="/user/coin" class="nav-item">💰 我的资产</NuxtLink>
        <NuxtLink to="/user/lottery" class="nav-item">🎁 幸运抽奖</NuxtLink>
        <NuxtLink to="/user/shop" class="nav-item">🛍️ 牛马商城</NuxtLink>
      </aside>

      <!-- 右侧内容 -->
      <main class="right-content">
        <div class="lottery-card">
          <div class="lottery-header">
            <h2>幸运大抽奖</h2>
            <p>每次消耗 50 牛马币，博一博单车变摩托</p>
            <div class="balance">当前余额: {{ myStats?.coin || 0 }}</div>
          </div>

          <div class="grid-box">
            <!--
              九宫格布局：
              0  1  2
              7  btn 3
              6  5  4

              对应的 Prize ID:
              0: 10币, 1: 谢谢, 2: 20币
              7: 再来,        3: 50币
              6: 1000币, 5: 周边, 4: 100币
            -->

            <div class="grid-item" :class="{ active: activeIndex === 0 }">💰 10 币</div>
            <div class="grid-item" :class="{ active: activeIndex === 1 }">😭 谢谢参与</div>
            <div class="grid-item" :class="{ active: activeIndex === 2 }">💰 20 币</div>

            <div class="grid-item" :class="{ active: activeIndex === 7 }">🔄 再来一次</div>

            <!-- 中间按钮 -->
            <div class="grid-btn" @click="startLottery" :class="{ disabled: isDrawing }">
              <div class="btn-text">立即<br />抽奖</div>
              <div class="btn-cost">-50</div>
            </div>

            <div class="grid-item" :class="{ active: activeIndex === 3 }">💰 50 币</div>

            <div class="grid-item rare" :class="{ active: activeIndex === 6 }">💎 1000 币</div>
            <div class="grid-item" :class="{ active: activeIndex === 5 }">🎁 周边礼物</div>
            <div class="grid-item" :class="{ active: activeIndex === 4 }">💰 100 币</div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
  /* 复用布局样式 */
  .user-center-layout {
    background: #f4f5f5;
    min-height: 100vh;
    padding-top: 20px;
  }
  .center-container {
    max-width: 1300px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 20px;
  }
  .left-nav {
    background: white;
    border-radius: 4px;
    padding: 10px 0;
    height: fit-content;
  }
  .nav-title {
    font-size: 16px;
    font-weight: bold;
    padding: 10px 20px;
    border-bottom: 1px solid #eee;
    margin-bottom: 5px;
  }
  .nav-item {
    display: block;
    padding: 12px 20px;
    color: #515767;
    text-decoration: none;
    transition: 0.2s;
    border-left: 3px solid transparent;
  }
  .nav-item:hover {
    background: #f4f5f5;
  }
  .nav-item.active {
    background: #eaf2ff;
    color: #1e80ff;
    border-left-color: #1e80ff;
  }
  .right-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* 抽奖卡片 */
  .lottery-card {
    background: white;
    border-radius: 8px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .lottery-header {
    text-align: center;
    margin-bottom: 30px;
  }
  .lottery-header h2 {
    margin: 0 0 10px 0;
    color: #1e80ff;
  }
  .lottery-header p {
    color: #8a919f;
    margin: 0;
  }
  .balance {
    margin-top: 10px;
    font-weight: bold;
    color: #ff9f38;
    background: #fff7e6;
    padding: 4px 12px;
    border-radius: 20px;
    display: inline-block;
  }

  /* 九宫格 */
  .grid-box {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    grid-template-rows: repeat(3, 100px);
    gap: 10px;
    background: #1e80ff;
    padding: 10px;
    border-radius: 8px;
  }

  .grid-item {
    background: #fff;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #333;
    font-weight: bold;
    box-shadow: 0 4px 0 #ddd;
    transition: 0.1s;
  }
  .grid-item.active {
    background: #ffeb3b; /* 高亮黄 */
    box-shadow: 0 0 15px #ffeb3b;
    transform: scale(1.05);
  }
  .grid-item.rare {
    color: #ff4d4f;
  }

  /* 中间按钮 */
  .grid-btn {
    background: linear-gradient(180deg, #ff9f38 0%, #ff4d4f 100%);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    box-shadow: 0 4px 0 #c41d1f;
    transition: 0.1s;
  }
  .grid-btn:active {
    transform: translateY(4px);
    box-shadow: none;
  }
  .grid-btn.disabled {
    filter: grayscale(1);
    cursor: not-allowed;
  }

  .btn-text {
    font-size: 18px;
    font-weight: 900;
    line-height: 1.2;
  }
  .btn-cost {
    font-size: 12px;
    margin-top: 4px;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    .center-container {
      grid-template-columns: 1fr;
    }
    .left-nav {
      display: none;
    }
    .grid-box {
      grid-template-columns: repeat(3, 80px);
      grid-template-rows: repeat(3, 80px);
    }
  }
</style>
