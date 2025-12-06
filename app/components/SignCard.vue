<script setup>
  const user = useUser() // 获取全局用户状态
  const isSigned = ref(false) // 今天是否已签
  const loading = ref(false)

  // 检查状态 (简单的本地检查，严谨应该调用接口)
  onMounted(() => {
    if (user.value && user.value.lastSignDate) {
      const last = new Date(user.value.lastSignDate)
      const now = new Date()
      if (last.getDate() === now.getDate() && last.getMonth() === now.getMonth()) {
        isSigned.value = true
      }
    }
  })

  const handleSign = async () => {
    if (!user.value) return alert('请先登录才能领工资！')

    loading.value = true
    try {
      const res = await $fetch('/api/users/sign', { method: 'POST' })

      if (res.success) {
        alert(res.message) // 或者用更漂亮的 Toast
        // 更新本地状态
        user.value.coin = res.data.coin
        user.value.lastSignDate = new Date()
        isSigned.value = true
      } else {
        alert(res.message)
        isSigned.value = true
      }
    } catch (e) {
      alert('网络开了小差')
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div class="card sign-card">
    <div class="sign-header">
      <div class="title">
        <span v-if="isSigned">✅ 今日已打卡</span>
        <span v-else>📅 上午好！</span>
      </div>
      <div class="desc">
        <span v-if="user"
          >当前资产: <b style="color: #f5a623">{{ user.coin }}</b> 牛马币</span
        >
        <span v-else>点亮在社区的每一天</span>
      </div>
    </div>

    <button class="btn-sign" :class="{ signed: isSigned }" @click="handleSign" :disabled="isSigned || loading">
      {{ isSigned ? '已领取' : loading ? '打卡中...' : '去签到' }}
    </button>
  </div>
</template>

<style scoped>
  .card {
    background: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    overflow: hidden;
  }
  .sign-card {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sign-header .title {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
    margin-bottom: 4px;
  }
  .sign-header .desc {
    font-size: 12px;
    color: #86909c;
  }

  .btn-sign {
    border: 1px solid #1e80ff;
    color: #1e80ff;
    background: white;
    border-radius: 4px;
    padding: 6px 14px;
    cursor: pointer;
    transition: 0.2s;
    white-space: nowrap;
    font-size: 14px;
  }
  .btn-sign:hover {
    background: #eaf2ff;
  }

  /* 已签到样式 */
  .btn-sign.signed {
    background: #f2f3f5;
    color: #86909c;
    border-color: transparent;
    cursor: default;
  }
</style>
