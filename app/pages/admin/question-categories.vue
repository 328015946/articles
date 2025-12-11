<script setup>
definePageMeta({ layout: 'admin' })

// 获取列表
const { data: list, refresh } = await useFetch('/api/question-categories')

const form = ref({ name: '', icon: '' })

const handleAdd = async () => {
  if (!form.value.name) return alert('请输入名称')
  try {
    await $fetch('/api/admin/question-categories/add', {
      method: 'POST',
      body: form.value
    })
    alert('添加成功')
    form.value = { name: '', icon: '' }
    refresh()
  } catch (e) {
    alert('添加失败')
  }
}
</script>

<template>
  <div class="category-page">
    <h2>📂 题库分类管理</h2>

    <!-- 添加表单 -->
    <div class="form-card">
      <input v-model="form.name" placeholder="分类名称 (如: Vue框架)" class="input" />
      <input v-model="form.icon" placeholder="图标 (如: 💚)" class="input short" />
      <button @click="handleAdd" class="btn-add">添加分类</button>
    </div>

    <!-- 列表 -->
    <div class="list-grid">
      <div v-for="item in list" :key="item._id" class="cat-item">
        <span class="icon">{{ item.icon }}</span>
        <span class="name">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-page { max-width: 800px; }
.form-card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 10px; }
.input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
.input.short { width: 100px; flex: none; }
.btn-add { background: #1e80ff; color: white; border: none; padding: 0 20px; border-radius: 4px; cursor: pointer; }

.list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
.cat-item { background: white; padding: 15px; border-radius: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.icon { font-size: 20px; }
.name { font-weight: bold; color: #333; }
</style>