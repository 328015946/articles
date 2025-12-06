<script setup>
  definePageMeta({ layout: 'admin' })
  import { MdEditor } from 'md-editor-v3'
  import 'md-editor-v3/lib/style.css'

  const router = useRouter()
  // lazy: true 防止阻塞页面渲染
  const { data: categories } = await useFetch('/api/categories', { lazy: true })

  const form = ref({ title: '', categoryId: '', content: '' })
  const user = useUser()
  const isPublishing = ref(false)

  // === 1. 精简工具栏配置 ===
  // 只保留写技术博客最常用的功能
  const toolbars = [
    'bold',
    'underline',
    'italic',
    '-', // 文本样式
    'title',
    'quote',
    'unorderedList',
    'orderedList',
    '-', // 结构
    'codeRow',
    'code',
    'link',
    'image',
    'table',
    '-', // 插入内容
    'revoke',
    'next',
    '=', // 撤销重做
    'preview',
    'fullscreen' // 预览与全屏
  ]

  // 图片上传
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
            rev(url)
          } catch (error) {
            rej(error)
          }
        })
      })
    )
    callback(res.map(item => item))
  }

  const publish = async () => {
    if (!form.value.title) return alert('文章标题不能为空')
    if (!form.value.categoryId) return alert('请选择文章分类')
    if (!form.value.content) return alert('文章内容不能为空')

    isPublishing.value = true
    try {
      await $fetch('/api/articles', {
        method: 'POST',
        body: {
          title: form.value.title,
          content: form.value.content,
          category: form.value.categoryId
        }
      })
      alert('发布成功！🎉')
      if (user.value?.role === 'admin') router.push('/admin/articles')
      else router.push('/admin/my-articles')
    } catch (err) {
      alert('发布失败：' + (err.data?.message || err.message))
    } finally {
      isPublishing.value = false
    }
  }
</script>

<template>
  <div class="publish-container">
    <!-- 顶部操作栏 -->
    <header class="publish-header">
      <div class="left">
        <span class="page-title">✏️ 写文章</span>
      </div>

      <div class="right">
        <!-- 分类选择器 -->
        <div class="category-wrapper">
          <select v-model="form.categoryId" class="category-select">
            <option disabled value="">请选择分类</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
          </select>
          <span class="arrow-icon">▼</span>
        </div>

        <!-- 发布按钮 -->
        <button class="btn-publish" @click="publish" :disabled="isPublishing">
          {{ isPublishing ? '发布中...' : '发布' }}
        </button>
      </div>
    </header>

    <!-- 标题输入区 (大字号，沉浸式) -->
    <div class="title-section">
      <input v-model="form.title" placeholder="输入文章标题..." class="title-input" maxlength="100" />
    </div>

    <!-- 编辑器区域 -->
    <div class="editor-section">
      <ClientOnly fallback-tag="div">
        <template #fallback>
          <div class="loading-editor"><span class="spinner"></span> 编辑器加载中...</div>
        </template>

        <MdEditor
          v-model="form.content"
          placeholder="在此开始您的创作..."
          @onUploadImg="onUploadImg"
          :toolbars="toolbars"
          preview-theme="github"
          class="custom-editor" />
      </ClientOnly>
    </div>
  </div>
</template>

<style scoped>
  .publish-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 84px); /* 减去 layout 顶栏高度，适配你的 admin layout */
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }

  /* === 顶部栏 === */
  .publish-header {
    height: 60px;
    padding: 0 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
  }
  .page-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }
  .right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  /* 分类选择器美化 */
  .category-wrapper {
    position: relative;
  }
  .category-select {
    appearance: none; /* 去掉默认样式 */
    background: #f4f5f5;
    border: none;
    padding: 8px 32px 8px 16px;
    border-radius: 4px;
    color: #555;
    font-size: 14px;
    cursor: pointer;
    outline: none;
    transition: 0.2s;
  }
  .category-select:hover,
  .category-select:focus {
    background: #e8e9eb;
    color: #1e80ff;
  }
  .arrow-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    color: #999;
    pointer-events: none;
  }

  /* 发布按钮 */
  .btn-publish {
    background: #1e80ff;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-publish:hover {
    background: #1171ee;
    box-shadow: 0 4px 10px rgba(30, 128, 255, 0.3);
  }
  .btn-publish:disabled {
    background: #a0cfff;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* === 标题输入区 === */
  .title-section {
    padding: 20px 24px 10px;
  }
  .title-input {
    width: 100%;
    border: none;
    font-size: 28px; /* 大字号 */
    font-weight: bold;
    color: #1d2129;
    outline: none;
    padding: 10px 0;
    background: transparent;
  }
  .title-input::placeholder {
    color: #cfd3dc;
  }

  /* === 编辑器区域 === */
  .editor-section {
    flex: 1;
    overflow: hidden; /* 防止双重滚动条 */
    display: flex;
    flex-direction: column;
  }

  /* 自定义编辑器样式覆盖 */
  .custom-editor {
    height: 100% !important;
    border: none !important; /* 去掉编辑器边框，更沉浸 */
  }
  /* 深度选择器修改 md-editor 内部样式 (可选) */
  :deep(.md-editor-toolbar-wrapper) {
    border-bottom: 1px solid #f0f0f0 !important;
  }
  :deep(.md-editor-content) {
    background: #fff;
  }

  /* 加载动画 */
  .loading-editor {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9f9f9;
    color: #999;
    font-size: 14px;
    gap: 10px;
  }
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #1e80ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
