<!-- pages/admin/notifications.vue -->
<script setup>
  definePageMeta({ layout: 'admin' })

  // 1. 获取通知列表
  const { data: list, refresh } = await useFetch('/api/notifications')

  // 2. 标记已读
  onMounted(async () => {
    if (list.value?.some(n => !n.isRead)) {
      await $fetch('/api/notifications/read', { method: 'POST' })
      // 这里不需要 refresh，因为我们只是为了消掉红点，列表展示不受 isRead 影响
    }
  })

  const formatDate = date => new Date(date).toLocaleString()
</script>

<template>
  <div class="notify-page">
    <h2 class="page-title">🔔 消息通知</h2>

    <div class="notify-list">
      <div v-for="item in list" :key="item._id" class="notify-item" :class="{ unread: !item.isRead }">
        <!-- 图标区分 -->
        <div class="icon-box" :class="item.type">
          {{ item.type === 'like' ? '❤️' : '💬' }}
        </div>

        <div class="content">
          <div class="header">
            <span class="sender">{{ item.sender?.nickname || '有人' }}</span>
            <span class="action">
              {{ item.type === 'like' ? '赞了你的文章' : '评论了你的文章' }}
            </span>
            <NuxtLink :to="`/article/${item.article?._id}`" class="article-link">
              《{{ item.article?.title || '已删除文章' }}》
            </NuxtLink>
          </div>

          <!-- 如果是评论，显示内容 -->
          <div v-if="item.type === 'comment'" class="quote">“{{ item.content }}”</div>

          <div class="time">{{ formatDate(item.createdAt) }}</div>
        </div>
      </div>

      <div v-if="list?.length === 0" class="empty">暂时没有新消息</div>
    </div>
  </div>
</template>

<style scoped>
  .notify-page {
    max-width: 800px;
  }
  .page-title {
    margin-bottom: 20px;
    font-size: 20px;
    color: #333;
  }

  .notify-item {
    display: flex;
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: 0.2s;
  }
  .notify-item.unread {
    border-left: 4px solid #1890ff;
    background: #e6f7ff;
  }

  .icon-box {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-right: 15px;
    flex-shrink: 0;
  }
  .icon-box.like {
    background: #fff1f0;
    color: #ff4d4f;
  }
  .icon-box.comment {
    background: #e6f7ff;
    color: #1890ff;
  }

  .content {
    flex: 1;
  }
  .header {
    font-size: 15px;
    color: #333;
    margin-bottom: 5px;
  }
  .sender {
    font-weight: bold;
    margin-right: 5px;
  }
  .article-link {
    color: #1890ff;
    font-weight: 500;
  }

  .quote {
    background: rgba(0, 0, 0, 0.03);
    padding: 8px 12px;
    border-radius: 4px;
    color: #666;
    font-size: 14px;
    margin: 8px 0;
  }

  .time {
    font-size: 12px;
    color: #999;
  }
  .empty {
    text-align: center;
    color: #999;
    padding: 40px;
    background: white;
    border-radius: 8px;
  }
</style>
