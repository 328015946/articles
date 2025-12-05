<!-- pages/admin/my-articles.vue -->
<script setup>
  definePageMeta({ layout: 'admin' })

  // 调用“我的文章”接口 (只返回自己写的)
  const { data: articles, refresh } = await useFetch('/api/articles/my')

  const deleteArticle = async id => {
    if (!confirm('确定要删除这篇文章吗？')) return
    // 这里的删除接口后端需要校验是不是自己的文章
    await $fetch(`/api/articles/${id}`, { method: 'DELETE' })
    refresh()
  }
</script>

<template>
  <div class="card-container">
    <h2>👤 我的文章</h2>
    <table class="table">
      <thead>
        <tr>
          <th>标题</th>
          <th>发布时间</th>
          <th>状态</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in articles" :key="item._id">
          <td>{{ item.title }}</td>
          <td>{{ new Date(item.createdAt).toLocaleDateString() }}</td>
          <td>
            <span v-if="item.isRecommended" style="color: red">🔥被推荐</span>
            <span v-else>正常</span>
          </td>
          <td>
            <button class="btn-link danger" @click="deleteArticle(item._id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!articles?.length" style="padding: 20px; color: #999">你还没有发布过文章</div>
  </div>
</template>

<style scoped>
  /* 样式可以直接复制 articles.vue 的，保持一致 */
  .card-container {
    background: white;
    padding: 30px;
    border-radius: 8px;
  }
  .table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  th,
  td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    text-align: left;
  }
  .btn-link {
    background: none;
    border: none;
    cursor: pointer;
    color: #1890ff;
  }
  .btn-link.danger {
    color: #ff4d4f;
  }
</style>
