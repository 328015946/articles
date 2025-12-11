<script setup>
  definePageMeta({ layout: 'admin' })

  const page = ref(1)
  const keyword = ref('')
  const { data: res, refresh } = await useFetch('/api/admin/users', {
    query: computed(() => ({ page: page.value, keyword: keyword.value }))
  })

  const userList = computed(() => res.value?.list || [])
  const total = computed(() => res.value?.total || 0)

  // === 操作逻辑 ===
  const handleAction = async (user, action) => {
    if (action === 'delete' && !confirm('⚠️ 确定要彻底删除该用户吗？此操作不可恢复！')) return
    if (action === 'ban' && !confirm('确定要封禁该用户吗？')) return

    try {
      const r = await $fetch('/api/admin/users/manage', {
        method: 'POST',
        body: { id: user._id, action }
      })
      if (r.success) {
        alert(r.message)
        refresh()
      } else {
        alert(r.message)
      }
    } catch (e) {
      alert('操作失败')
    }
  }

  // === 充值弹窗逻辑 ===
  const showCoinModal = ref(false)
  const coinForm = reactive({ id: '', nickname: '', amount: '', reason: '' })

  const openCoinModal = user => {
    coinForm.id = user._id
    coinForm.nickname = user.nickname
    coinForm.amount = ''
    coinForm.reason = ''
    showCoinModal.value = true
  }
  const handleSearch = () => {
    page.value = 1
    refresh()
  }
  const submitCoin = async () => {
    if (!coinForm.amount) return alert('请输入金额')
    try {
      await $fetch('/api/admin/users/coin', {
        method: 'POST',
        body: { ...coinForm }
      })
      alert('操作成功')
      showCoinModal.value = false
      refresh()
    } catch (e) {
      alert('操作失败')
    }
  }
</script>

<template>
  <div class="user-manage">
    <h2>👥 用户管理 ({{ total }})</h2>

    <!-- 搜索栏 -->
    <div class="toolbar">
      <input v-model="keyword" placeholder="搜索昵称或账号..." class="search-input" />
      <button class="btn-search" @click="handleSearch">搜索</button>
    </div>

    <!-- 表格 -->
    <table class="user-table">
      <thead>
        <tr>
          <th>用户</th>
          <th>身份</th>
          <th>牛马币</th>
          <th>状态</th>
          <th>注册时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in userList" :key="u._id">
          <td>
            <div class="u-info">
              <img :src="u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'" class="avatar" />
              <div>
                <div class="name">{{ u.nickname }}</div>
                <div class="username">@{{ u.username }}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="role-tag" :class="u.role">{{ u.role === 'admin' ? '管理员' : '普通用户' }}</span>
          </td>
          <td class="coin-col">
            💎 {{ u.coin || 0 }}
            <span class="edit-icon" @click="openCoinModal(u)">✏️</span>
          </td>
          <td>
            <span class="status-tag" :class="u.status || 'active'">
              {{ u.status === 'banned' ? '🚫 已封禁' : '✅ 正常' }}
            </span>
          </td>
          <td>{{ new Date(u.createdAt).toLocaleDateString() }}</td>
          <td>
            <div class="actions">
              <!-- 封禁/解封 -->
              <button v-if="u.status === 'banned'" class="btn-text green" @click="handleAction(u, 'active')">
                解封
              </button>
              <button v-else class="btn-text orange" @click="handleAction(u, 'ban')">封禁</button>

              <span class="sep">|</span>

              <!-- 删除 -->
              <button class="btn-text red" @click="handleAction(u, 'delete')">删除</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 分页 -->
    <div class="pagination">
      <button :disabled="page <= 1" @click="page--">上一页</button>
      <span>第 {{ page }} 页</span>
      <button :disabled="userList.length < 10" @click="page++">下一页</button>
    </div>

    <!-- ★★★ 充值弹窗 ★★★ -->
    <div v-if="showCoinModal" class="modal-mask" @click.self="showCoinModal = false">
      <div class="modal-box">
        <h3>💰 余额调整 - {{ coinForm.nickname }}</h3>

        <div class="form-item">
          <label>调整金额 (负数代表扣除)</label>
          <input type="number" v-model="coinForm.amount" placeholder="例如: 100 或 -50" />
        </div>

        <div class="form-item">
          <label>调整原因</label>
          <input v-model="coinForm.reason" placeholder="例如: 违规扣除 / 活动奖励" />
        </div>

        <div class="modal-actions">
          <button @click="showCoinModal = false">取消</button>
          <button class="primary" @click="submitCoin">确认调整</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .user-manage {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  h2 {
    margin-bottom: 20px;
    border-left: 4px solid #1e80ff;
    padding-left: 10px;
  }

  .toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
  .search-input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 250px;
  }
  .btn-search {
    padding: 8px 20px;
    background: #1e80ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  /* 表格样式 */
  .user-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .user-table th,
  .user-table td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  .user-table th {
    background: #fafafa;
    font-weight: bold;
    color: #666;
  }

  .u-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
  }
  .name {
    font-weight: bold;
    font-size: 14px;
  }
  .username {
    color: #999;
    font-size: 12px;
  }

  .role-tag {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    background: #e6f7ff;
    color: #1890ff;
  }
  .role-tag.admin {
    background: #fff7e6;
    color: #fa8c16;
  }

  .status-tag.active {
    color: #52c41a;
  }
  .status-tag.banned {
    color: #ff4d4f;
    font-weight: bold;
  }

  .coin-col {
    font-weight: bold;
    color: #fa8c16;
  }
  .edit-icon {
    cursor: pointer;
    margin-left: 5px;
    opacity: 0.5;
    font-size: 12px;
  }
  .edit-icon:hover {
    opacity: 1;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .btn-text {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
  }
  .btn-text.green {
    color: #52c41a;
  }
  .btn-text.orange {
    color: #fa8c16;
  }
  .btn-text.red {
    color: #ff4d4f;
  }
  .sep {
    color: #ddd;
    margin: 0 5px;
  }

  /* 弹窗样式 */
  .modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  .modal-box {
    background: white;
    padding: 25px;
    border-radius: 8px;
    width: 400px;
  }
  .form-item {
    margin-bottom: 15px;
  }
  .form-item label {
    display: block;
    margin-bottom: 5px;
    font-size: 13px;
    color: #666;
  }
  .form-item input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  .modal-actions button {
    padding: 8px 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
  }
  .modal-actions button.primary {
    background: #1e80ff;
    color: white;
    border: none;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
    align-items: center;
  }
</style>
