<!--
 * @Author: zengxiaobin
 * @Date: 2025-12-09 19:30:38
 * @LastEditors: xiaobin
 * @LastEditTime: 2025-12-09 19:30:49
 * @FilePath: \xiao-nuxt\app\components\RichList.vue
 * @Description: 注释
-->
<script setup>
  const { data: list } = await useFetch('/api/rank/rich')
</script>

<template>
  <div class="card rich-card">
    <div class="card-title">💰 牛马富豪榜</div>
    <ul class="rank-list">
      <li v-for="(user, index) in list" :key="user._id" class="rank-item">
        <div class="rank-num" :class="'n-' + (index + 1)">{{ index + 1 }}</div>
        <img :src="user.avatar || '...'" class="avatar" />
        <div class="info">
          <div class="name">{{ user.nickname }}</div>
          <div class="coin">💎 {{ user.coin }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
  .rich-card {
    background: white;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 20px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .card-title {
    font-weight: bold;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
  .rank-list {
    padding: 0;
    list-style: none;
  }
  .rank-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  .rank-num {
    width: 20px;
    text-align: center;
    margin-right: 10px;
    font-weight: bold;
    color: #999;
    font-style: italic;
  }
  .n-1 {
    color: #f5222d;
    font-size: 18px;
  }
  .n-2 {
    color: #ff9f38;
    font-size: 16px;
  }
  .n-3 {
    color: #fadb14;
    font-size: 16px;
  }
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin-right: 10px;
  }
  .name {
    font-size: 14px;
    font-weight: 500;
    width: 80px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .coin {
    font-size: 12px;
    color: #ff9f38;
    font-weight: bold;
    margin-left: auto;
  }
</style>
