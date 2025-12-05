<!--
 * @Author: zengxiaobin
 * @Date: 2025-12-05 14:13:55
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-05 15:03:21
 * @FilePath: \xiao-nuxt\app\pages\admin\categories.vue
 * @Description: 注释
-->
<script setup>
  definePageMeta({ layout: 'admin' })

  const newCategoryName = ref('')
  const { data: categories, refresh } = await useFetch('/api/categories')

  // === 1. 添加分类 ===
  const addCategory = async () => {
    if (!newCategoryName.value.trim()) return
    await $fetch('/api/categories', {
      method: 'POST',
      body: { name: newCategoryName.value }
    })
    newCategoryName.value = ''
    refresh()
  }

  // === 2. 删除分类 ===
  const deleteCategory = async id => {
    if (!confirm('确定要删除这个分类吗？删除后该分类下的文章将不再显示分类。')) return

    await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
    refresh() // 刷新列表
  }

  // === 3. 编辑/更新分类 (行内编辑逻辑) ===
  const editingId = ref(null) // 当前正在编辑哪一行 ID
  const editName = ref('') // 编辑框里的临时名字

  // 开始编辑
  const startEdit = item => {
    editingId.value = item._id
    editName.value = item.name // 把原来的名字填进输入框
  }

  // 取消编辑
  const cancelEdit = () => {
    editingId.value = null
    editName.value = ''
  }

  // 保存编辑
  const saveEdit = async id => {
    if (!editName.value.trim()) return alert('分类名不能为空')

    await $fetch(`/api/categories/${id}`, {
      method: 'PUT',
      body: { name: editName.value }
    })

    // 退出编辑模式并刷新
    editingId.value = null
    refresh()
  }
</script>

<template>
  <div class="card-container">
    <h2>📂 分类管理</h2>

    <!-- 添加区 -->
    <div class="add-box">
      <input v-model="newCategoryName" placeholder="输入新分类名称..." @keyup.enter="addCategory" class="input-main" />
      <button @click="addCategory" class="btn-primary">添加新分类</button>
    </div>

    <!-- 列表区 (改为表格更整齐) -->
    <table class="table">
      <thead>
        <tr>
          <th>分类名称</th>
          <th>ID</th>
          <th style="width: 180px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in categories" :key="c._id">
          <!-- 如果当前行是编辑状态，显示输入框 -->
          <td v-if="editingId === c._id">
            <input v-model="editName" class="input-edit" @keyup.enter="saveEdit(c._id)" />
          </td>
          <!-- 否则，显示普通文本 -->
          <td v-else>
            <span class="cat-name">{{ c.name }}</span>
          </td>

          <td class="id-col">{{ c._id }}</td>

          <!-- 操作按钮区 -->
          <td>
            <!-- 编辑状态下的按钮 -->
            <div v-if="editingId === c._id" class="action-group">
              <button class="btn-text save" @click="saveEdit(c._id)">保存</button>
              <button class="btn-text cancel" @click="cancelEdit">取消</button>
            </div>

            <!-- 普通状态下的按钮 -->
            <div v-else class="action-group">
              <button class="btn-text edit" @click="startEdit(c)">修改</button>
              <span class="divider">|</span>
              <button class="btn-text delete" @click="deleteCategory(c._id)">删除</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
  .card-container {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  /* 添加区样式 */
  .add-box {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
    max-width: 500px;
  }
  .input-main {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .btn-primary {
    background: #1890ff;
    color: white;
    border: none;
    padding: 0 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: 0.2s;
    white-space: nowrap;
  }
  .btn-primary:hover {
    background: #40a9ff;
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
  }
  td {
    padding: 12px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
  }

  /* 字体和颜色 */
  .cat-name {
    font-weight: 500;
    color: #333;
  }
  .id-col {
    color: #ccc;
    font-size: 12px;
    font-family: monospace;
  }

  /* 编辑框样式 */
  .input-edit {
    padding: 6px 10px;
    border: 1px solid #1890ff;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
  }

  /* 操作按钮样式 */
  .action-group {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .btn-text {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: 0.2s;
  }
  .edit {
    color: #1890ff;
  }
  .edit:hover {
    background: #e6f7ff;
  }
  .delete {
    color: #ff4d4f;
  }
  .delete:hover {
    background: #fff1f0;
  }
  .save {
    color: #52c41a;
  }
  .save:hover {
    background: #f6ffed;
  }
  .cancel {
    color: #999;
  }
  .cancel:hover {
    background: #f5f5f5;
  }
  .divider {
    color: #eee;
  }
</style>
