<!--
 * @Author: zengxiaobin
 * @Date: 2025-12-06 09:24:03
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-06 13:42:20
 * @FilePath: \xiao-nuxt\app\pages\admin\notifications.vue
 * @Description: 注释
-->
<!-- pages/admin/notifications.vue -->
<script setup>
  definePageMeta({ layout: 'admin' })
  const { data: list } = await useFetch('/api/notifications')

  // 标记已读逻辑...
  onMounted(async () => {
    if (list.value?.some(n => !n.isRead)) {
      await $fetch('/api/notifications/read', { method: 'POST' })
    }
  })

  const formatDate = date => new Date(date).toLocaleString()
</script>

<template>
  <div class="notify-page">
    <h2 class="page-title">🔔 消息通知</h2>
    <div class="notify-list">
      <div v-for="item in list" :key="item._id" class="notify-item" :class="{ unread: !item.isRead }">
        <!-- 图标: 沸点也用评论图标 -->
        <div class="icon-box" :class="item.type.includes('like') ? 'like' : 'comment'">
          {{ item.type.includes('like') ? '❤️' : '💬' }}
        </div>

        <div class="content">
          <div class="header">
            <span class="sender">{{ item.sender?.nickname || '用户' }}</span>

            <!-- ★★★ 核心修复：根据类型显示不同文案 ★★★ -->
            <span class="action">
              <span v-if="item.type === 'like'">赞了你的文章</span>
              <span v-else-if="item.type === 'comment'">评论了文章</span>
              <span v-else-if="item.type === 'pin_comment'">评论了沸点</span>
              <span v-else-if="item.type === 'new_pin'">发布了新沸点</span>
              <span v-else-if="item.type === 'new_follower'">关注了你</span>
              <!-- 这里 -->
            </span>

            <!-- 情况1：如果是文章 -->
            <NuxtLink v-if="item.article" :to="`/article/${item.article._id}`" class="link">
              《{{ item.article.title }}》
            </NuxtLink>

            <!-- 情况2：如果是沸点 -->
            <NuxtLink v-if="item.pin" to="/pins" class="link">
              【{{ item.pin.content.substring(0, 15) }}...】
            </NuxtLink>

            <!-- 在跳转链接里增加 -->
            <NuxtLink v-if="item.type === 'new_pin' && item.pin" to="/pins" class="link">
              查看动态: {{ item.pin.content.substring(0, 15) }}...
            </NuxtLink>
            <!-- ★ 关注类型：可以直接显示“去查看”或者留空 -->
            <NuxtLink v-if="item.type === 'new_follower'" :to="`/user/${item.sender._id}`" class="link btn-link">
              查看主页
            </NuxtLink>
          </div>

          <div v-if="item.content" class="quote">“{{ item.content }}”</div>
          <div class="time">{{ formatDate(item.createdAt) }}</div>
        </div>
      </div>
      <div v-if="list?.length === 0" class="empty">暂无消息</div>
    </div>
  </div>
</template>

<style scoped>
  /* 保持原有样式 */
  .notify-page {
    max-width: 100%;
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
  .link {
    color: #1e80ff;
    font-weight: 500;
    text-decoration: none;
    margin-left: 5px;
    cursor: pointer;
  }
  .link:hover {
    text-decoration: underline;
  }
  .deleted {
    color: #999;
    font-style: italic;
    margin-left: 5px;
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
