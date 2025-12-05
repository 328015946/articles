<!-- pages/admin/publish.vue -->
<script setup>
  definePageMeta({ layout: 'admin' })
  import { MdEditor } from 'md-editor-v3'
  import 'md-editor-v3/lib/style.css' // 引入样式

  const router = useRouter()
  const { data: categories } = await useFetch('/api/categories')
  const form = ref({ title: '', categoryId: '', content: '' })
  const user = useUser()

  // === 图片上传处理 (md-editor-v3 自带上传钩子) ===
  const onUploadImg = async (files, callback) => {
    const res = await Promise.all(
      files.map(file => {
        return new Promise(async (rev, rej) => {
          const formData = new FormData()
          formData.append('file', file)
          try {
            const { url } = await $fetch('/api/upload', {
              method: 'POST',
              body: formData
            })
            rev(url) // 返回图片 URL
          } catch (error) {
            rej(error)
          }
        })
      })
    )
    // 把 URL 传回给编辑器，它会自动插入 markdown
    callback(res.map(item => item))
  }

  const publish = async () => {
    if (!form.value.title || !form.value.categoryId) return alert('请填写完整')

    try {
      await $fetch('/api/articles', {
        method: 'POST',
        body: {
          title: form.value.title,
          content: form.value.content,
          // ★★★ 关键修改在这里 ★★★
          // 前端的 form.categoryId 要赋值给数据库的 category 字段
          category: form.value.categoryId
        }
      })

      alert('发布成功！')
      if (user.value?.role === 'admin') router.push('/admin/articles')
      else router.push('/admin/my-articles')
    } catch (err) {
      alert('发布失败：' + err.message)
    }
  }
</script>

<template>
  <div class="card-container">
    <div class="header">
      <h2>✏️ 发布新文章</h2>
      <button class="btn-primary" @click="publish">发布文章</button>
    </div>

    <div class="form-row">
      <div class="form-item title-input">
        <input v-model="form.title" placeholder="请输入文章标题..." />
      </div>

      <div class="form-item category-select">
        <select v-model="form.categoryId">
          <option disabled value="">选择分类</option>
          <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
        </select>
      </div>
    </div>

    <div class="editor-wrapper">
      <!-- ★★★ 核心编辑器组件 ★★★ -->
      <MdEditor
        v-model="form.content"
        placeholder="开始您的创作..."
        @onUploadImg="onUploadImg"
        :toolbarsExclude="['github']"
        preview-theme="github" />
    </div>
  </div>
</template>

<style scoped>
  .card-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    height: calc(100vh - 100px);
    display: flex;
    flex-direction: column;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  h2 {
    margin: 0;
  }
  .form-row {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }
  .title-input {
    flex: 1;
  }
  input,
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
  }
  .btn-primary {
    background: #1890ff;
    color: white;
    border: none;
    padding: 10px 25px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
  /* 编辑器高度 */
  .editor-wrapper {
    flex: 1;
    overflow: hidden;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  :deep(.md-editor) {
    height: 100%;
  }
</style>
