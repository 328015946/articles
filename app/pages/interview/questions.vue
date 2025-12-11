<script setup>
definePageMeta({ layout: 'admin' })

// 获取待审核列表
const { data: list, refresh } = await useFetch('/api/admin/interview/pending')

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
// ... 原有的代码 ...

// ★★★ 新增：安全获取预览内容的函数 ★★★
// 这个函数能保证无论数据多么烂，都不会报错
const getPreviewContent = (q) => {
  // 1. 尝试获取值，优先取 analysis (新字段)，其次取 answer (旧字段)
  const val = q.analysis || q.answer
  console.log('看看',q)
  // 2. 如果都是空的，直接返回空字符串
  if (!val) return '暂无解析'

  // 3. 强制转为字符串 (防止数据库里存的是数字) 并截取
  return String(val).substring(0, 60)
}
</script>

<template>
  <div class="audit-page">
    <h2>📝 题库审核</h2>

    <!-- 调试信息：如果列表没出来，看看这里显示什么 -->
    <!-- <pre>{{ list }}</pre> -->

    <div v-if="list && list.length > 0" class="list-container">
      <div v-for="q in list" :key="q._id" class="audit-card">
        <div class="info">
          <h3>
            <!-- 加上非空保护 -->
            <span class="badge">{{ q?.type === 'choice' ? '选择题' : '简答' }}</span>
            {{ q?.title || '无标题' }}
          </h3>

          <p class="answer-preview">
            <!-- 调用安全函数 -->
            解析预览: {{ getPreviewContent(q) }}...
          </p>

          <div class="meta">
            <span>出题人: {{ q?.author?.nickname || '未知' }}</span>
            <!-- 防止 createdAt 为空导致 Date 报错 -->
            <span class="time">{{ q?.createdAt ? new Date(q.createdAt).toLocaleDateString() : '刚刚' }}</span>
          </div>
        </div>

        <div class="actions">
          <button class="btn-pass" @click="handleAudit(q._id, true)">通过 (发币)</button>
          <button class="btn-reject" @click="handleAudit(q._id, false)">拒绝</button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      🎉 暂无待审核题目，去休息一下吧！
    </div>
  </div>
</template>
<style scoped>
.audit-page { max-width: 900px; margin: 0 auto; }
h2 { margin-bottom: 20px; border-left: 4px solid #1e80ff; padding-left: 10px; }

.audit-card {
  background: white; padding: 20px; margin-bottom: 15px;
  display: flex; justify-content: space-between; align-items: flex-start;
  border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.info { flex: 1; margin-right: 20px; }
.info h3 { margin: 0 0 10px 0; font-size: 16px; display: flex; align-items: center; gap: 8px; }
.badge { font-size: 12px; background: #e6f7ff; color: #1e80ff; padding: 2px 6px; border-radius: 4px; font-weight: normal;}

.answer-preview { font-size: 13px; color: #666; background: #f9f9f9; padding: 8px; border-radius: 4px; line-height: 1.5; }
.meta { font-size: 12px; color: #999; margin-top: 8px; }
.meta span { margin-right: 15px; }

.actions { display: flex; flex-direction: column; gap: 10px; }
.btn-pass { background: #52c41a; color: white; border: none; padding: 6px 15px; border-radius: 4px; cursor: pointer; white-space: nowrap; }
.btn-pass:hover { background: #389e0d; }

.btn-reject { background: #fff1f0; color: #ff4d4f; border: 1px solid #ffa39e; padding: 6px 15px; border-radius: 4px; cursor: pointer; white-space: nowrap; }
.btn-reject:hover { background: #ffccc7; }

.empty-state { text-align: center; padding: 40px; color: #999; background: white; border-radius: 8px; }
</style>