<!-- pages/admin/questions.vue -->
<script setup>
  definePageMeta({ layout: 'admin' })

  // 获取待审核列表 (防止 API 报错导致页面白屏，加 lazy)
  const { data: list, refresh } = await useFetch('/api/admin/interview/pending', {
    lazy: true,
    server: false // ★ 强制仅在客户端渲染，避开 SSR 报错 ★
  })

  const handleAudit = async (id, pass) => {
    const reason = pass ? '' : prompt('请输入拒绝理由:')
    if (!pass && !reason) return

    try {
      await $fetch('/api/admin/interview/audit', {
        method: 'POST',
        body: { id, pass, reason }
      })
      alert('操作成功')
      refresh()
    } catch (e) {
      alert('操作失败: ' + e.message)
    }
  }
</script>

<template>
  <div class="audit-page">
    <h2>📝 题库审核</h2>

    <!-- 1. 加载状态 -->
    <div v-if="!list" class="loading">加载中...</div>

    <!-- 2. 空状态 -->
    <div v-else-if="list.length === 0" class="empty-state">🎉 暂无待审核题目</div>

    <!-- 3. 列表内容 -->
    <div v-else class="list-container">
      <div v-for="q in list" :key="q._id" class="audit-card">
        <div class="info">
          <h3>
            <span v-if="q.category" class="badge cat-badge">
              {{ q.category.name }}
            </span>
            <span class="badge">{{ q.type === 'choice' ? '选择题' : '简答' }}</span>

            <!-- 加上 || '' 防止 title 为空 -->
            {{ q.title || '无标题' }}
          </h3>

          <!-- ★★★ 新增：选择题选项预览区域 ★★★ -->
          <div v-if="(q.type === 'choice' || q.type === 'multiple') && q.options" class="options-box">
            <div
              v-for="(opt, idx) in q.options"
              :key="idx"
              class="opt-row"
              :class="{
                /* 单选高亮 */
                'correct-row': q.type === 'choice' && idx === q.correctAnswer,
                /* 多选高亮 */
                'correct-row-multi': q.type === 'multiple' && q.correctAnswers?.includes(idx)
              }">
              <!-- 序号 A. B. C. -->
              <span class="opt-label">{{ String.fromCharCode(65 + idx) }}.</span>
              <!-- 选项内容 -->
              <span class="opt-text">{{ opt }}</span>
              <!-- 正确标记 -->
              <!-- 单选标记 -->
              <span v-if="q.type === 'choice' && idx === q.correctAnswer" class="correct-tag">✅ 正确</span>

              <!-- 多选标记 -->
              <span v-if="q.type === 'multiple' && q.correctAnswers?.includes(idx)" class="correct-tag">✅ 正确</span>
            </div>
          </div>
          <!-- ★★★ 结束 ★★★ -->
          <p class="answer-preview">解析预览: {{ (q.analysis || q.answer || '暂无内容').substring(0, 60) }}...</p>

          <div class="meta">
            <!-- 加上 ?. 防止 author 为空 -->
            <span>出题人: {{ q.author?.nickname || '未知用户' }}</span>
            <span class="time">
              {{ q.createdAt ? new Date(q.createdAt).toLocaleDateString() : '刚刚' }}
            </span>
          </div>
        </div>

        <div class="actions">
          <button class="btn-pass" @click="handleAudit(q._id, true)">通过 (发币)</button>
          <button class="btn-reject" @click="handleAudit(q._id, false)">拒绝</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .audit-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }
  h2 {
    margin-bottom: 20px;
    border-left: 4px solid #1e80ff;
    padding-left: 10px;
  }

  .audit-card {
    background: white;
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid #eee;
  }

  .info {
    flex: 1;
    margin-right: 20px;
  }
  .info h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .badge {
    font-size: 12px;
    background: #e6f7ff;
    color: #1e80ff;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: normal;
  }

  .answer-preview {
    font-size: 13px;
    color: #666;
    background: #f9f9f9;
    padding: 8px;
    border-radius: 4px;
    line-height: 1.5;
  }
  .meta {
    font-size: 12px;
    color: #999;
    margin-top: 8px;
  }
  .meta span {
    margin-right: 15px;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .btn-pass {
    background: #52c41a;
    color: white;
    border: none;
    padding: 6px 15px;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
  }
  .btn-pass:hover {
    background: #389e0d;
  }

  .btn-reject {
    background: #fff1f0;
    color: #ff4d4f;
    border: 1px solid #ffa39e;
    padding: 6px 15px;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
  }
  .btn-reject:hover {
    background: #ffccc7;
  }

  .empty-state,
  .loading {
    text-align: center;
    padding: 40px;
    color: #999;
    background: white;
    border-radius: 8px;
  }
  /* 选项盒子 */
  .options-box {
    margin: 10px 0;
    padding: 10px;
    background: #fdfdfd;
    border: 1px dashed #e0e0e0;
    border-radius: 6px;
  }

  .opt-row {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #555;
    padding: 4px 0;
  }

  /* 正确答案高亮样式 */
  .correct-row {
    color: #52c41a; /* 绿色 */
    font-weight: bold;
  }

  .opt-label {
    margin-right: 8px;
    width: 20px;
  }

  .correct-tag {
    font-size: 12px;
    margin-left: 10px;
    background: #f6ffed;
    border: 1px solid #b7eb8f;
    color: #52c41a;
    padding: 0 6px;
    border-radius: 4px;
    font-weight: normal;
  }
  /* ... 原有样式 ... */

  .badge {
    font-size: 12px;
    background: #e6f7ff;
    color: #1890ff;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: normal;
    margin-right: 6px; /* 增加右边距 */
  }

  /* ★★★ 新增：分类标签样式 (橙色系) ★★★ */
  .cat-badge {
    background: #fff7e6;
    color: #fa8c16;
    border: 1px solid #ffd591; /* 加个边框更精致 */
  }
</style>
