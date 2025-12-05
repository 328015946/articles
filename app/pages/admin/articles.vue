<!-- pages/admin/articles.vue -->
<script setup>
  definePageMeta({ layout: 'admin' })

  // === 分页状态 ===
  const page = ref(1)
  const limit = 10 // 后台通常每页显示多一点，比如 10 条

  // === 获取数据 ===
  // 传入 page 和 limit 参数
  // 注意：因为 page 是响应式的，当 page.value 变化时，useFetch 会自动重新请求
  const { data: res, refresh } = await useFetch('/api/articles', {
    query: { page, limit }
  })

  // === 计算属性 ===
  // 适配后端的新格式 { list: [], total: 100 }
  const articles = computed(() => res.value?.list || [])
  const total = computed(() => res.value?.total || 0)
  const totalPages = computed(() => Math.ceil(total.value / limit) || 1)

  // === 功能逻辑 ===

  // 翻页
  const changePage = newPage => {
    if (newPage < 1 || newPage > totalPages.value) return
    page.value = newPage
  }

  // 切换推荐
  const toggleRecommend = async item => {
    await $fetch(`/api/articles/${item._id}`, {
      method: 'PUT',
      body: { isRecommended: !item.isRecommended }
    })
    refresh()
  }

  // 删除文章
  // 删除文章
  const deleteArticle = async id => {
    if (!confirm('确定删？')) return

    try {
      // 修正这里：地址改成 /api/articles/${id}
      await $fetch(`/api/articles/${id}`, { method: 'DELETE' })

      // 检查：如果当前页只有1条数据且删除了，应该自动跳回上一页
      if (articles.value.length === 1 && page.value > 1) {
        page.value--
      } else {
        refresh()
      }
    } catch (error) {
      alert('删除失败：' + (error.data?.message || error.message))
    }
  }
</script>

<template>
  <div class="card-container">
    <div class="header-row">
      <h2>📑 文章列表</h2>
      <span class="total-badge">共 {{ total }} 篇</span>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>标题</th>
          <th>分类</th>
          <th>状态</th>
          <th>发布时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in articles" :key="item._id">
          <td class="col-title">
            <NuxtLink :to="`/article/${item._id}`" target="_blank">{{ item.title }}</NuxtLink>
          </td>
          <td>
            <span class="cat-tag" v-if="item.category">{{ item.category.name }}</span>
            <span class="cat-tag none" v-else>未分类</span>
          </td>
          <td>
            <button class="tag-btn" :class="{ active: item.isRecommended }" @click="toggleRecommend(item)">
              {{ item.isRecommended ? '🔥 已推荐' : '普通' }}
            </button>
          </td>
          <td>{{ new Date(item.createdAt).toLocaleDateString() }}</td>
          <td>
            <div class="actions">
              <!-- 这里预留一个编辑按钮，以后可以做文章修改功能 -->
              <!-- <button class="btn-link">编辑</button> -->
              <button class="btn-link danger" @click="deleteArticle(item._id)">删除</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- === 分页工具栏 === -->
    <div class="pagination-bar" v-if="total > 0">
      <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>

      <span class="page-info">第 {{ page }} / {{ totalPages }} 页</span>

      <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<style scoped>
  .card-container {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  h2 {
    margin: 0;
  }
  .total-badge {
    background: #f0f2f5;
    color: #666;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: bold;
  }

  /* 表格样式 */
  .table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    text-align: left;
    background: #fafafa;
    padding: 12px;
    border-bottom: 1px solid #eee;
    color: #666;
    font-weight: 600;
    font-size: 14px;
  }
  td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
    font-size: 14px;
  }

  .col-title a {
    color: #333;
    font-weight: 500;
    display: block;
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .col-title a:hover {
    color: #1890ff;
    text-decoration: underline;
  }

  .cat-tag {
    background: #e6f7ff;
    color: #1890ff;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
  .cat-tag.none {
    background: #f5f5f5;
    color: #999;
  }

  /* 推荐按钮 */
  .tag-btn {
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
    font-size: 12px;
    transition: 0.2s;
  }
  .tag-btn:hover {
    border-color: #999;
  }
  .tag-btn.active {
    background: #ff4d4f;
    color: white;
    border-color: #ff4d4f;
  }

  /* 操作区 */
  .actions {
    display: flex;
    gap: 10px;
  }
  .btn-link {
    background: none;
    border: none;
    cursor: pointer;
    color: #1890ff;
    font-size: 13px;
    padding: 0;
  }
  .btn-link:hover {
    text-decoration: underline;
  }
  .btn-link.danger {
    color: #ff4d4f;
  }

  /* 分页工具栏 */
  .pagination-bar {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 15px;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
  }
  .page-info {
    color: #666;
    font-size: 14px;
  }
  .page-btn {
    padding: 6px 16px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.2s;
    font-size: 13px;
  }
  .page-btn:hover:not(:disabled) {
    border-color: #1890ff;
    color: #1890ff;
  }
  .page-btn:disabled {
    background: #f5f5f5;
    color: #ccc;
    cursor: not-allowed;
  }
</style>
