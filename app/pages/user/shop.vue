<!-- pages/user/shop.vue -->
<script setup>
  const user = useUser()
  const { data: userStats, refresh: refreshStats } = await useFetch('/api/users/stats', { immediate: !!user.value })
  const { data: goods, refresh: refreshShop } = await useFetch('/api/shop/list')
  // ==========================================
  // ★★★ 新增：判断当前是否已装备 ★★★
  // ==========================================
  const isEquipped = item => {
    if (!user.value || !user.value.theme) return false
    // 比较当前用户的 theme[type] 是否等于该商品的 value
    return user.value.theme[item.type] === item.value
  }

  // 购买
  const handleBuy = async item => {
    if (!confirm(`确定花费 ${item.price} 牛马币购买吗？`)) return
    try {
      const res = await $fetch('/api/shop/buy', {
        method: 'POST',
        body: { itemId: item._id }
      })
      if (res.success) {
        alert('购买成功！')
        refreshShop()
        refreshStats()
      } else {
        alert(res.message)
      }
    } catch (e) {
      alert('购买失败')
    }
  }

  // ==========================================
  // ★★★ 修改：装备/卸下 切换逻辑 ★★★
  // ==========================================
  const toggleEquip = async item => {
    const currentStatus = isEquipped(item)

    // 如果当前是装备状态，操作就是“卸下”(isUnequip: true)
    // 如果当前没装备，操作就是“装备”(isUnequip: false)
    const actionName = currentStatus ? '卸下' : '装备'

    try {
      const res = await $fetch('/api/shop/equip', {
        method: 'POST',
        body: {
          itemId: item._id,
          type: item.type,
          isUnequip: currentStatus // ★ 传给后端
        }
      })

      alert(`${actionName}成功！`)

      // 更新全局用户状态
      if (user.value) {
        user.value.theme = res.theme
      }
    } catch (e) {
      alert(`${actionName}失败`)
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
        <!-- ★★★ 高亮当前页 ★★★ -->
        <NuxtLink to="/user/shop" class="nav-item active">🛍️ 牛马商城</NuxtLink>
        <NuxtLink to="/user/lottery" class="nav-item">🎁 幸运抽奖</NuxtLink>
      </aside>

      <!-- 右侧内容 -->
      <main class="right-content">
        <div class="shop-header-card">
          <h2>🛍️ 牛马商城</h2>
          <div class="my-balance">
            当前余额: <span>{{ userStats?.coin || 0 }}</span> 币
          </div>
        </div>

        <div class="shop-grid">
          <div v-for="item in goods" :key="item._id" class="goods-card">
            <!-- 预览区 -->
            <div class="preview-box" :style="item.type === 'bg' ? { background: item.value } : {}">
              <div v-if="item.type === 'frame'" class="avatar-demo">
                <img :src="item.value" class="frame-img" />
                <!-- <img :src="user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'" class="base-avatar" /> -->
              </div>
              <span v-if="item.type === 'color'" :style="{ color: item.value, fontWeight: 'bold' }">
                {{ user?.nickname || '昵称' }}
              </span>
              <span v-if="item.type === 'bg'" style="color: white; text-shadow: 0 1px 2px black">背景预览</span>
            </div>

            <div class="info">
              <div class="name">{{ item.name }}</div>
              <div class="price">💰 {{ item.price }}</div>
            </div>

            <div class="actions">
              <button v-if="!item.isOwned" class="btn-buy" @click="handleBuy(item)">购买</button>
              <!-- 2. 买了 -> 判断是否装备 -->
              <template v-else>
                <!-- 情况A: 正在使用 -> 显示卸下 -->
                <button v-if="isEquipped(item)" class="btn-unequip" @click="toggleEquip(item)">卸下</button>

                <!-- 情况B: 没在使用 -> 显示装备 -->
                <button v-else class="btn-use" @click="toggleEquip(item)">装备</button>
              </template>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
  /* 布局复用 */
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
    align-items: start;
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

  /* 商城顶部卡片 */
  .shop-header-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .shop-header-card h2 {
    margin: 0;
    font-size: 18px;
  }
  .my-balance {
    font-size: 14px;
    color: #666;
  }
  .my-balance span {
    color: #ff9f38;
    font-weight: bold;
    font-size: 20px;
    margin-left: 5px;
  }

  /* 网格布局 */
  .shop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }
  .goods-card {
    background: white;
    border: 1px solid #eee;
    border-radius: 8px;
    overflow: hidden;
    transition: 0.2s;
  }
  .goods-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .preview-box {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    position: relative;
  }
  .avatar-demo {
    position: relative;
    width: 60px;
    height: 60px;
  }
  .base-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  .frame-img {
    position: absolute;
    top: -15%;
    left: -15%;
    width: 130%;
    height: 130%;
    z-index: 1;
    pointer-events: none;
  }

  .info {
    padding: 10px;
    text-align: center;
  }
  .name {
    font-weight: bold;
    font-size: 15px;
  }
  .price {
    color: #ff9f38;
    margin-top: 5px;
    font-weight: bold;
  }

  .actions {
    padding: 10px;
    text-align: center;
    border-top: 1px solid #f5f5f5;
  }
  .btn-buy {
    background: #1e80ff;
    color: white;
    border: none;
    padding: 6px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  .btn-buy:hover {
    background: #1171ee;
  }
  .btn-use {
    background: #eaf2ff;
    color: #1e80ff;
    border: 1px solid #1e80ff;
    padding: 6px 20px;
    border-radius: 4px;
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .center-container {
      grid-template-columns: 1fr;
    }
    .left-nav {
      display: none;
    }
  }

  /* 购买按钮 (蓝色) */
  .btn-buy {
    background: #1e80ff;
    color: white;
    border: none;
    padding: 6px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }
  .btn-buy:hover {
    background: #1171ee;
  }

  /* 装备按钮 (浅蓝) */
  .btn-use {
    background: #eaf2ff;
    color: #1e80ff;
    border: 1px solid #1e80ff;
    padding: 6px 20px;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-use:hover {
    background: #dceaff;
  }

  /* ★★★ 新增：卸下按钮 (灰色) ★★★ */
  .btn-unequip {
    background: #f4f5f5;
    color: #86909c;
    border: 1px solid #e5e6eb;
    padding: 6px 20px;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-unequip:hover {
    background: #e5e6eb;
    color: #4e5969;
  }
</style>
