<!-- pages/user/coin.vue -->
<script setup>
  const user = useUser()
  const { data: myStats } = await useFetch('/api/users/stats', { immediate: !!user.value })

  const tasks = [
    // 注意：给签到任务加一个特殊的 action 标记，方便模板里识别
    {
      title: '每日签到',
      reward: '+10',
      desc: '每日登录并签到，连续签到奖励更多',
      btnText: '去签到',
      action: 'sign'
    },

    { title: '发布沸点', reward: '+100', desc: '每日首次发布沸点', btnText: '去发布', link: '/pins' },
    { title: '文章被点赞', reward: '+10', desc: '优质内容被他人认可', btnText: '去创作', link: '/admin/publish' }
  ]

  const handleTask = async task => {
    if (task.action === 'sign') {
      // 如果已经签到了，直接返回（防止连点）
      if (myStats.value?.isSignedToday) return

      try {
        const res = await $fetch('/api/users/sign', { method: 'POST' })

        if (res.success) {
          alert(res.message) // "签到成功！获得 10 牛马币"

          // ★★★ 核心：手动更新本地状态，不用刷新页面 ★★★
          if (myStats.value) {
            myStats.value.coin = res.data.coin
            myStats.value.isSignedToday = true // 立即把按钮变灰
          }
        } else {
          // 如果后端返回 "今天已经搬过砖了"
          alert(res.message)
          if (myStats.value) myStats.value.isSignedToday = true
        }
      } catch (e) {
        alert(e.data?.message || '签到失败')
      }
    } else {
      navigateTo(task.link)
    }
  }
</script>

<template>
  <div class="user-center-layout">
    <div class="center-container">
      <aside class="left-nav">
        <!-- 左侧导航代码保持不变 -->
        <div class="nav-title">个人中心</div>
        <NuxtLink to="/user/coin" class="nav-item active">💰 我的资产</NuxtLink>
        <NuxtLink to="/user/lottery" class="nav-item">🎁 幸运抽奖</NuxtLink>
        <NuxtLink to="/user/shop" class="nav-item">🛍️ 牛马商城</NuxtLink>
      </aside>

      <main class="right-content">
        <!-- 顶部卡片保持不变 -->
        <div class="asset-card">
          <div class="card-bg"></div>
          <div class="asset-info">
            <div class="label">当前牛马币余额</div>
            <div class="amount">{{ myStats?.coin || 0 }}</div>
            <div class="tip">努力搬砖，早日赎身</div>
          </div>
          <NuxtLink to="/user/lottery" class="btn-draw">去抽奖</NuxtLink>
        </div>

        <div class="task-section">
          <h3 class="section-title">获取渠道</h3>

          <div class="task-list">
            <div v-for="(item, index) in tasks" :key="index" class="task-item">
              <div class="task-icon">📝</div>
              <div class="task-info">
                <div class="t-title">
                  {{ item.title }}
                  <span class="highlight">{{ item.reward }}</span>
                </div>
                <div class="t-desc">{{ item.desc }}</div>
              </div>

              <!-- ★★★ 修改这里：按钮状态控制 ★★★ -->
              <!-- 如果是签到任务 且 isSignedToday 为 true，则显示“已签到”并应用 disabled 样式 -->
              <button
                class="btn-task"
                :class="{ signed: item.action === 'sign' && myStats?.isSignedToday }"
                @click="handleTask(item)">
                {{ item.action === 'sign' && myStats?.isSignedToday ? '已签到' : item.btnText }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
  /* 原有样式保持不变 ... */
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
  .asset-card {
    background: linear-gradient(135deg, #70a1ff 0%, #1e80ff 100%);
    border-radius: 8px;
    padding: 30px;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(30, 128, 255, 0.3);
  }
  .card-bg {
    position: absolute;
    top: -50%;
    right: -10%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    pointer-events: none;
  }
  .label {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 5px;
  }
  .amount {
    font-size: 36px;
    font-weight: bold;
    font-family: DINAlternate-Bold, sans-serif;
  }
  .tip {
    font-size: 12px;
    opacity: 0.7;
    margin-top: 5px;
  }
  .btn-draw {
    background: white;
    color: #1e80ff;
    padding: 8px 24px;
    border-radius: 20px;
    font-weight: bold;
    text-decoration: none;
    transition: 0.2s;
    z-index: 1;
  }
  .btn-draw:hover {
    transform: scale(1.05);
  }
  .task-section {
    background: white;
    border-radius: 4px;
    padding: 20px;
  }
  .section-title {
    margin: 0 0 20px 0;
    font-size: 18px;
    border-left: 4px solid #1e80ff;
    padding-left: 10px;
  }
  .task-item {
    display: flex;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #f4f5f5;
  }
  .task-item:last-child {
    border-bottom: none;
  }
  .task-icon {
    width: 40px;
    height: 40px;
    background: #eaf2ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-right: 15px;
  }
  .task-info {
    flex: 1;
  }
  .t-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }
  .highlight {
    color: #ff9f38;
    font-weight: bold;
    margin-left: 5px;
  }
  .t-desc {
    font-size: 13px;
    color: #8a919f;
  }

  .btn-task {
    padding: 6px 20px;
    border-radius: 16px;
    border: 1px solid #1e80ff;
    color: #1e80ff;
    background: white;
    cursor: pointer;
    transition: 0.2s;
  }
  .btn-task:hover {
    background: #1e80ff;
    color: white;
  }

  /* ★★★ 新增：已签到样式 ★★★ */
  .btn-task.signed {
    background: #f2f3f5;
    color: #8a919f;
    border-color: #f2f3f5;
    cursor: not-allowed;
  }
  .btn-task.signed:hover {
    background: #f2f3f5;
    color: #8a919f;
  }

  @media (max-width: 768px) {
    .center-container {
      grid-template-columns: 1fr;
    }
    .left-nav {
      display: none;
    }
  }
</style>
