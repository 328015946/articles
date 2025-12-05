<script setup>
definePageMeta({ layout: 'admin' })

// 1. 获取全局用户信息 (用于显示昵称和角色)
const user = useUser()

// 2. 获取统计数据
const { data: stats, pending } = await useFetch('/api/stats')

// 3. 根据角色显示的文案
const roleName = computed(() => user.value?.role === 'admin' ? '超级管理员' : '创作者')
const welcomeMsg = computed(() => user.value?.role === 'admin'
  ? '这里是全站控制中心，您可以管理所有内容。'
  : '这里是您的个人创作空间，继续加油产出好内容！'
)
</script>

<template>
  <div class="dashboard">
    <!-- 头部欢迎区 -->
    <div class="welcome-header">
      <h1>👋 欢迎回来，{{ user?.nickname }}</h1>
      <span class="role-tag" :class="user?.role">{{ roleName }}</span>
      <p class="subtitle">{{ welcomeMsg }}</p>
    </div>

    <!-- 数据卡片区 -->
    <div class="stats-cards">
      <!-- 文章数卡片 -->
      <div class="card blue">
        <div class="card-icon">📝</div>
        <div class="card-info">
          <div class="label">{{ user?.role === 'admin' ? '全站文章数' : '我的文章数' }}</div>
          <div class="number">
            {{ pending ? '...' : (stats?.articleCount || 0) }}
            <span class="unit">篇</span>
          </div>
        </div>
      </div>

      <!-- 阅读量卡片 -->
      <div class="card purple">
        <div class="card-icon">👁️</div>
        <div class="card-info">
          <div class="label">{{ user?.role === 'admin' ? '全站总阅读' : '我的总阅读' }}</div>
          <div class="number">
            {{ pending ? '...' : (stats?.totalViews || 0) }}
            <span class="unit">次</span>
          </div>
        </div>
      </div>

      <!-- 这里可以预留第三个卡片，比如 "加入天数" 或者 "获赞数" -->
      <div class="card green">
        <div class="card-icon">📅</div>
        <div class="card-info">
          <div class="label">加入时间</div>
          <div class="date-text">
            {{ user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '刚刚' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard { padding: 10px; }

/* 欢迎区 */
.welcome-header h1 { margin: 0 0 10px 0; display: inline-block; vertical-align: middle; }
.role-tag {
  display: inline-block; font-size: 12px; padding: 2px 8px; border-radius: 4px;
  margin-left: 10px; vertical-align: middle; font-weight: bold;
}
.role-tag.admin { background: #fff1f0; color: #f5222d; border: 1px solid #ffa39e; }
.role-tag.user { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }

.subtitle { color: #888; margin-top: 5px; font-size: 14px; }

/* 卡片容器 */
.stats-cards { display: flex; gap: 24px; margin-top: 30px; flex-wrap: wrap; }

/* 卡片通用样式 */
.card {
  flex: 1; min-width: 240px;
  background: white; padding: 24px; border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #f0f0f0;
  display: flex; align-items: center; gap: 20px;
  transition: transform 0.2s;
}
.card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }

.card-icon {
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}

/* 不同颜色的卡片 */
.card.blue .card-icon { background: #e6f7ff; }
.card.blue .number { color: #1890ff; }

.card.purple .card-icon { background: #f9f0ff; }
.card.purple .number { color: #722ed1; }

.card.green .card-icon { background: #f6ffed; }
.card.green .date-text { color: #52c41a; font-size: 1.2rem; font-weight: bold; }

/* 文字排版 */
.card-info { flex: 1; }
.label { color: #888; font-size: 14px; margin-bottom: 4px; }
.number { font-size: 28px; font-weight: bold; line-height: 1; }
.unit { font-size: 14px; font-weight: normal; color: #999; margin-left: 4px; }
</style>