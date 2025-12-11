<script setup>
  const user = useUser()
  const { data: pet, refresh: refreshPet } = await useFetch('/api/pet/my')
  const { data: userStats, refresh: refreshStats } = await useFetch('/api/users/stats', { immediate: !!user.value })

  // 宠物形态配置 (这里用 DiceBear 生成不同风格的头像代表进化)
  // 0:蛋, 1:实习生(可爱), 2:打工仔(像素), 3:架构师(机器人), 4:CTO(抽象)
  const STAGE_IMAGES = [
    'https://api.dicebear.com/7.x/shapes/svg?seed=egg',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=happy',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=coder',
    'https://api.dicebear.com/7.x/bottts/svg?seed=robot',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=boss&clothing=blazerAndShirt'
  ]

  const STAGE_NAMES = ['摸鱼蛋', '实习生', '打工仔', '架构师', 'CTO']

  const feedAnim = ref(false) // 喂食动画控制

  // 领养
  const adoptName = ref('')
  const handleAdopt = async () => {
    if (!adoptName.value) return alert('起个名字吧')
    try {
      await $fetch('/api/pet/adopt', { method: 'POST', body: { name: adoptName.value } })
      refreshPet()
    } catch (e) {
      alert('领养失败')
    }
  }

  // 投喂
  const handleFeed = async type => {
    if ((userStats.value?.coin || 0) < 20) return alert('余额不足，快去赚币')

    feedAnim.value = true
    setTimeout(() => (feedAnim.value = false), 500) // 动画复位

    try {
      const res = await $fetch('/api/pet/feed', {
        method: 'POST',
        body: { foodType: type }
      })

      if (res.success) {
        // alert(res.message) // 可选：太频繁弹窗体验不好，可以用 Toast
        refreshPet()
        refreshStats() // 刷新余额
      } else {
        alert(res.message)
      }
    } catch (e) {
      alert('喂食失败')
    }
  }

  // 计算进度条百分比
  const progress = computed(() => {
    if (!pet.value) return 0
    const maxExp = pet.value.level * 100
    return Math.min((pet.value.exp / maxExp) * 100, 100)
  })
</script>

<template>
  <div class="pet-page">
    <div class="container">
      <!-- 场景 A: 还没领养 -->
      <div v-if="!pet" class="adopt-card">
        <div class="egg-icon">🥚</div>
        <h2>领养你的专属牛马</h2>
        <p>它将陪伴你的编程之路，从一颗蛋进化为 CTO！</p>
        <div class="adopt-form">
          <input v-model="adoptName" placeholder="给它起个响亮的名字" />
          <button @click="handleAdopt">免费领养</button>
        </div>
      </div>

      <!-- 场景 B: 养成界面 -->
      <div v-else class="game-boy">
        <div class="screen">
          <!-- 顶部状态 -->
          <div class="status-bar">
            <div class="name-tag">
              {{ pet.name }} <span class="stage-tag">{{ STAGE_NAMES[pet.stage] }}</span>
            </div>
            <div class="level-tag">Lv.{{ pet.level }}</div>
          </div>

          <!-- 宠物展示区 -->
          <div class="pet-display" :class="{ eating: feedAnim }">
            <img :src="STAGE_IMAGES[pet.stage]" class="pet-img" />
            <!-- 对话气泡 -->
            <div class="bubble">
              {{ feedAnim ? '好吃！😋' : '老板，什么时候发工资？' }}
            </div>
          </div>

          <!-- 经验条 -->
          <div class="exp-bar-box">
            <div class="exp-text">EXP: {{ pet.exp }} / {{ pet.level * 100 }}</div>
            <div class="progress-bg">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 底部控制台 -->
        <div class="controls">
          <div class="balance">
            当前余额: <span>{{ userStats?.coin || 0 }}</span> 💰
          </div>

          <div class="food-menu">
            <div class="food-item" @click="handleFeed('coffee')">
              <div class="icon">☕</div>
              <div class="name">冰美式</div>
              <div class="cost">-20币</div>
            </div>
            <div class="food-item" @click="handleFeed('bug')">
              <div class="icon">🐛</div>
              <div class="name">陈年Bug</div>
              <div class="cost">-50币</div>
            </div>
            <div class="food-item" @click="handleFeed('cake')">
              <div class="icon">🥞</div>
              <div class="name">大饼</div>
              <div class="cost">-100币</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .pet-page {
    background: #f4f5f5;
    min-height: 100vh;
    padding: 40px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 领养卡片 */
  .adopt-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    width: 400px;
  }
  .egg-icon {
    font-size: 80px;
    margin-bottom: 20px;
    animation: bounce 2s infinite;
  }
  .adopt-form {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    justify-content: center;
  }
  .adopt-form input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    outline: none;
  }
  .adopt-form button {
    background: #1e80ff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  /* 游戏机风格界面 */
  .game-boy {
    background: #2c3e50;
    padding: 20px;
    border-radius: 20px;
    width: 400px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    color: white;
  }

  .screen {
    background: #87ceeb; /* 天空蓝背景 */
    background: linear-gradient(180deg, #87ceeb 0%, #e0f7fa 100%);
    border-radius: 8px;
    border: 4px solid #34495e;
    height: 300px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 15px;
    color: #333;
  }

  .status-bar {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
  }
  .stage-tag {
    background: #ff9f38;
    color: white;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 4px;
    margin-left: 5px;
  }

  .pet-display {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .pet-img {
    width: 120px;
    height: 120px;
    transition: 0.2s;
  }
  .pet-display.eating .pet-img {
    transform: scale(1.2) rotate(10deg);
  } /* 进食动画 */

  .bubble {
    background: white;
    padding: 5px 10px;
    border-radius: 10px;
    font-size: 12px;
    position: absolute;
    top: 10px;
    right: 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    animation: float 3s ease-in-out infinite;
  }
  .bubble::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 10px;
    border-width: 5px 5px 0;
    border-style: solid;
    border-color: white transparent;
  }

  .exp-bar-box {
    font-size: 12px;
    font-weight: bold;
  }
  .progress-bg {
    height: 10px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    overflow: hidden;
    margin-top: 4px;
    border: 1px solid white;
  }
  .progress-fill {
    height: 100%;
    background: #52c41a;
    transition: width 0.3s;
  }

  /* 底部控制区 */
  .controls {
    margin-top: 20px;
  }
  .balance {
    text-align: right;
    font-size: 14px;
    margin-bottom: 10px;
    color: #f1c40f;
    font-weight: bold;
  }

  .food-menu {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
  }
  .food-item {
    background: #34495e;
    border-radius: 8px;
    padding: 10px;
    text-align: center;
    cursor: pointer;
    transition: 0.2s;
    border: 2px solid transparent;
  }
  .food-item:hover {
    border-color: #f1c40f;
    transform: translateY(-2px);
    background: #3e5871;
  }
  .food-item .icon {
    font-size: 24px;
    margin-bottom: 5px;
  }
  .food-item .name {
    font-size: 12px;
    margin-bottom: 2px;
  }
  .food-item .cost {
    font-size: 10px;
    color: #f1c40f;
  }

  /* 动画关键帧 */
  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
</style>
