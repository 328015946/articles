<!-- pages/admin/index.vue -->
<script setup>
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  } from 'chart.js'
  import { Line } from 'vue-chartjs'

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)
  definePageMeta({ layout: 'admin' })

  const { data: stats } = await useFetch('/api/admin/stats')

  // 判断是否是管理员
  const isAdmin = computed(() => stats.value?.role === 'admin')

  // --- 图表数据处理 (保持不变) ---
  // pages/admin/index.vue

  const chartData = computed(() => {
    if (!stats.value?.chart) return { labels: [], datasets: [] }

    const labels = []
    const data = []

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)

      // ★★★ 核心修复：手动拼接本地时间字符串 (YYYY-MM-DD)
      // 这样能确保和你电脑右下角的时间一致
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}` // 生成 "2025-12-05"

      labels.push(`${month}-${day}`) // 生成 "12-05"

      // 查找对应日期的数据
      const item = stats.value.chart.find(c => c._id === dateStr)
      data.push(item ? item.count : 0)
    }

    return {
      labels,
      datasets: [
        {
          label: isAdmin.value ? '全站发布趋势' : '我的创作趋势',
          backgroundColor: '#f87979',
          borderColor: '#1890ff',
          data,
          tension: 0.4,
          fill: true
        }
      ]
    }
  })
  const chartOptions = { responsive: true, maintainAspectRatio: false }
</script>

<template>
  <div class="dashboard">
    <h2 class="page-title">
      {{ isAdmin ? '📊 全站运营概览' : '🎨 创作中心仪表盘' }}
    </h2>

    <div class="stats-grid">
      <!-- 1. 文章卡片 -->
      <div class="stat-card blue">
        <div class="icon">📝</div>
        <div class="info">
          <!-- 动态文案 -->
          <div class="label">{{ isAdmin ? '全站文章' : '我的文章' }}</div>
          <div class="value">{{ stats?.overview?.articles || 0 }}</div>
        </div>
      </div>

      <!-- 2. 用户卡片 (只有管理员可见) -->
      <div v-if="isAdmin" class="stat-card green">
        <div class="icon">👥</div>
        <div class="info">
          <div class="label">总用户数</div>
          <div class="value">{{ stats?.overview?.users || 0 }}</div>
        </div>
      </div>

      <!-- 3. 评论卡片 -->
      <div class="stat-card purple">
        <div class="icon">💬</div>
        <div class="info">
          <div class="label">{{ isAdmin ? '总评论数' : '收到的评论' }}</div>
          <div class="value">{{ stats?.overview?.comments || 0 }}</div>
        </div>
      </div>

      <!-- 4. 浏览量卡片 -->
      <div class="stat-card orange">
        <div class="icon">👀</div>
        <div class="info">
          <div class="label">{{ isAdmin ? '全站浏览量' : '文章阅读量' }}</div>
          <div class="value">{{ stats?.overview?.views || 0 }}</div>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h3>{{ isAdmin ? '📈 站点内容增长趋势' : '📈 个人创作活跃度' }}</h3>
      <div class="chart-container">
        <ClientOnly>
          <Line v-if="stats" :data="chartData" :options="chartOptions" />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 保持之前的 CSS 不变 */
  .dashboard {
    padding-bottom: 40px;
  }
  .page-title {
    margin-bottom: 24px;
    font-size: 20px;
    color: #333;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    margin-bottom: 30px;
  }
  @media (max-width: 1000px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 600px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
  .stat-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;
  }
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  .stat-card .icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    margin-right: 16px;
    background: #f5f5f5;
  }
  .stat-card.blue .icon {
    background: #e6f7ff;
    color: #1890ff;
  }
  .stat-card.green .icon {
    background: #f6ffed;
    color: #52c41a;
  }
  .stat-card.purple .icon {
    background: #f9f0ff;
    color: #722ed1;
  }
  .stat-card.orange .icon {
    background: #fff7e6;
    color: #fa8c16;
  }
  .info .label {
    color: #888;
    font-size: 14px;
    margin-bottom: 4px;
  }
  .info .value {
    color: #333;
    font-size: 24px;
    font-weight: bold;
  }
  .chart-section {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  .chart-container {
    height: 350px;
    position: relative;
  }
</style>
