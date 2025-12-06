<!-- pages/user/[id].vue -->
<script setup>
  const route = useRoute()
  const targetId = route.params.id
  const currentUser = useUser() // 获取当前登录用户

  // 1. 获取用户资料 & 统计数据
  const { data: profileData, refresh: refreshProfile } = await useFetch(`/api/users/${targetId}/profile`)

  const userInfo = computed(() => profileData.value?.user)
  const stats = computed(() => profileData.value?.stats)

  // 关注状态 (从接口获取初始值)
  const isFollowing = ref(false)
  watch(
    () => profileData.value,
    val => {
      if (val) isFollowing.value = val.isFollowing
    },
    { immediate: true }
  )

  // 2. 获取动态列表 (文章 + 沸点)
  const { data: activities } = await useFetch(`/api/users/${targetId}/activities`)

  // ==========================================
  // ★★★ Tab 切换与筛选逻辑 ★★★
  // ==========================================
  const currentTab = ref('all') // 'all' | 'article' | 'pin'

  const filteredList = computed(() => {
    const list = activities.value || []
    if (currentTab.value === 'all') return list
    return list.filter(item => item.type === currentTab.value)
  })

  // ==========================================
  // ★★★ 关注/取关逻辑 ★★★
  // ==========================================
  const handleFollow = async () => {
    if (!currentUser.value) return navigateTo('/login')

    // 乐观更新
    const oldVal = isFollowing.value
    isFollowing.value = !oldVal

    try {
      await $fetch('/api/users/follow', {
        method: 'POST',
        body: { targetId }
      })
      // 成功后刷新一下个人资料(更新粉丝数)
      refreshProfile()
    } catch (e) {
      // 失败回滚
      isFollowing.value = oldVal
      alert('操作失败: ' + e.message)
    }
  }

  const formatDate = date => new Date(date).toLocaleDateString()
  // ★★★ 关注列表/粉丝列表 弹窗逻辑 ★★★
  // ==========================================
  const showModal = ref(false)
  const modalTitle = ref('')
  const followList = ref([])
  const listLoading = ref(false)

  // 打开弹窗
  const openFollowList = async type => {
    modalTitle.value = type === 'followers' ? '关注者' : '关注了'
    showModal.value = true
    listLoading.value = true
    followList.value = [] // 先清空

    try {
      // 调用刚才写的接口
      const res = await $fetch(`/api/users/${targetId}/follows`, {
        query: { type }
      })
      followList.value = res
    } catch (e) {
      console.error(e)
    } finally {
      listLoading.value = false
    }
  }

  // 列表里的关注/取关操作
  const handleListFollow = async userItem => {
    if (!currentUser.value) return navigateTo('/login')

    // 乐观更新
    userItem.isFollowing = !userItem.isFollowing

    try {
      await $fetch('/api/users/follow', {
        method: 'POST',
        body: { targetId: userItem._id }
      })
      // 这里不需要刷新整个大页面，只需要变按钮状态即可
    } catch (e) {
      userItem.isFollowing = !userItem.isFollowing // 回滚
      alert('操作失败')
    }
  }
  // ... 原有代码 ...

  // ==========================================
  // ★★★ 新增：样式生成逻辑 (修复背景和颜色不显示) ★★★
  // ==========================================

  // 1. 生成 Header 背景样式
  const headerStyle = computed(() => {
    const theme = userInfo.value?.theme
    console.log('背景', theme)
    if (!theme || !theme.bg) return {}

    const bgValue = theme.bg

    // 判断是 "渐变色/纯色" 还是 "图片URL"
    // 如果包含 'gradient' (渐变) 或 '#' (颜色代码) 或 'rgb'，直接作为 background
    if (bgValue.includes('gradient') || bgValue.startsWith('#') || bgValue.startsWith('rgb')) {
      return {
        background: bgValue,
        color: 'white' // 有背景时文字变白
      }
    }

    // 否则认为是图片 URL，需要包裹 url()
    return {
      backgroundImage: `url(${bgValue})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      color: 'white'
    }
  })

  // 2. 生成昵称颜色样式
  const nameStyle = computed(() => {
    const color = userInfo.value?.theme?.color
    if (!color) return {}
    return { color: color }
  })
</script>

<template>
  <div class="user-profile-page">
    <div class="container" v-if="userInfo">
      <!-- 1. 顶部个人信息卡片 -->
      <div class="profile-header" :style="headerStyle">
        <div class="avatar-container">
          <!-- 绑定头像框 -->
          <img v-if="userInfo.theme?.frame" :src="userInfo.theme.frame" class="p-frame" />
          <img v-else :src="userInfo.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'" class="p-avatar" />
        </div>
        <div class="p-info">
          <h1 class="p-name" :style="nameStyle">
            {{ userInfo.nickname }}
          </h1>
          <div class="p-job">
            <span v-if="userInfo.jobTitle">💼 {{ userInfo.jobTitle }}</span>
            <span v-if="userInfo.company"> | {{ userInfo.company }}</span>
          </div>
          <div class="p-intro">📃 {{ userInfo.intro || '这个人很懒，什么都没写' }}</div>
        </div>

        <div class="p-actions">
          <!-- 如果是自己，显示编辑 -->
          <NuxtLink v-if="currentUser?._id === targetId" to="/admin/profile" class="btn-outline"> 编辑资料 </NuxtLink>

          <!-- 如果是别人，显示关注 -->
          <div v-else class="btns">
            <button class="btn-primary" :class="{ following: isFollowing }" @click="handleFollow">
              {{ isFollowing ? '已关注' : '关注' }}
            </button>
            <!-- <button class="btn-outline">私信</button> -->
          </div>
        </div>
      </div>

      <div class="main-layout">
        <!-- 2. 左侧：动态列表 -->
        <div class="left-col">
          <!-- ★ Tab 切换栏 ★ -->
          <div class="tabs">
            <span class="tab" :class="{ active: currentTab === 'all' }" @click="currentTab = 'all'"> 动态 </span>
            <span class="tab" :class="{ active: currentTab === 'article' }" @click="currentTab = 'article'">
              文章 {{ stats?.articleCount || 0 }}
            </span>
            <span class="tab" :class="{ active: currentTab === 'pin' }" @click="currentTab = 'pin'">
              沸点 {{ stats?.pinCount || 0 }}
            </span>
          </div>

          <div class="activity-list">
            <!-- ★ 遍历筛选后的列表 ★ -->
            <div v-for="item in filteredList" :key="item._id" class="activity-item">
              <!-- 类型A：文章 -->
              <div v-if="item.type === 'article'" class="act-card article">
                <div class="tag">发布了文章</div>
                <h3 class="act-title">
                  <NuxtLink :to="`/article/${item._id}`">{{ item.title }}</NuxtLink>
                </h3>
                <p class="act-desc">{{ item.content.substring(0, 100).replace(/[#*`]/g, '') }}...</p>
                <div class="act-meta">
                  {{ formatDate(item.createdAt) }} · {{ item.views }} 阅读 · {{ item.likes?.length }} 点赞
                </div>
              </div>

              <!-- 类型B：沸点 -->
              <div v-if="item.type === 'pin'" class="act-card pin">
                <div class="tag">发布了沸点</div>
                <div class="act-content">{{ item.content }}</div>
                <div class="act-meta">{{ formatDate(item.createdAt) }} · {{ item.likes?.length }} 点赞</div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredList.length === 0" class="empty">
              {{ currentTab === 'article' ? '暂无文章' : currentTab === 'pin' ? '暂无沸点' : '暂无动态' }}
            </div>
          </div>
        </div>

        <!-- 3. 右侧：成就与统计 -->
        <aside class="right-col">
          <div class="stat-card">
            <h3>个人成就</h3>
            <div class="achieve-list">
              <div class="achieve-item"><span class="icon">👍</span> 获得点赞 {{ stats?.totalLikes || 0 }}</div>
              <div class="achieve-item"><span class="icon">👁️</span> 文章被阅读 {{ stats?.articleCount * 100 }}+</div>
            </div>
          </div>

          <div class="follow-stat-card">
            <div class="fs-item clickable" @click="openFollowList('following')">
              <div class="label">关注了</div>
              <div class="num">{{ stats?.followingCount || 0 }}</div>
            </div>
            <div class="fs-item clickable" @click="openFollowList('followers')">
              <div class="label">关注者</div>
              <div class="num">{{ stats?.followerCount || 0 }}</div>
            </div>
          </div>

          <div class="meta-card">
            <div class="join-time">用户加入于 {{ formatDate(userInfo.createdAt) }}</div>
          </div>
        </aside>
      </div>
    </div>

    <div v-else class="loading">加载中...</div>
    <!-- ★★★ 关注/粉丝列表弹窗 ★★★ -->
    <div v-if="showModal" class="modal-mask" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <span class="close-btn" @click="showModal = false">×</span>
        </div>

        <div class="modal-body">
          <div v-if="listLoading" class="loading">加载中...</div>

          <div v-else-if="followList.length > 0" class="user-list">
            <div v-for="u in followList" :key="u._id" class="user-item">
              <NuxtLink :to="`/user/${u._id}`" @click="showModal = false">
                <img :src="u.avatar || 'https://api.dicebear.com/7.x/avataaars/svg'" class="u-avatar" />
              </NuxtLink>

              <div class="u-info">
                <NuxtLink :to="`/user/${u._id}`" class="u-name" @click="showModal = false">
                  {{ u.nickname }}
                </NuxtLink>
                <div class="u-job">
                  {{ u.jobTitle || '暂无介绍' }}
                  <span v-if="u.company"> @ {{ u.company }}</span>
                </div>
              </div>

              <!-- 如果不是自己，显示关注按钮 -->
              <button
                v-if="currentUser?.id !== u._id"
                class="btn-small"
                :class="{ following: u.isFollowing }"
                @click="handleListFollow(u)">
                {{ u.isFollowing ? '已关注' : '关注' }}
              </button>
            </div>
          </div>

          <div v-else class="empty">暂无数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .user-profile-page {
    background: #f4f5f5;
    min-height: 100vh;
    padding-bottom: 40px;
  }
  .container {
    max-width: 1300px;
    margin: 0 auto;
    padding-top: 20px;
  }

  /* 顶部信息卡 */
  .profile-header {
    background: white;
    padding: 30px;
    border-radius: 4px;
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .p-avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-right: 24px;
    object-fit: cover;
  }
  .p-info {
    flex: 1;
  }
  .p-name {
    margin: 0 0 10px 0;
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
  .p-job {
    color: #515767;
    font-size: 14px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .p-intro {
    color: #8a919f;
    font-size: 14px;
    line-height: 1.5;
  }

  .p-actions {
    display: flex;
    gap: 10px;
    align-self: center;
  }
  .btns {
    display: flex;
    gap: 10px;
  }

  /* 按钮样式 */
  .btn-primary {
    background: #1e80ff;
    color: white;
    border: none;
    padding: 8px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: 0.2s;
  }
  .btn-primary:hover {
    background: #1171ee;
  }
  .btn-primary.following {
    background: #8a919f;
  } /* 已关注变灰 */

  .btn-outline {
    background: #eaf2ff;
    color: #1e80ff;
    border: 1px solid rgba(30, 128, 255, 0.3);
    padding: 8px 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    text-decoration: none;
    transition: 0.2s;
  }
  .btn-outline:hover {
    background: #dceaff;
  }

  /* 布局 */
  .main-layout {
    display: grid;
    grid-template-columns: 1fr 240px;
    gap: 20px;
  }
  @media (max-width: 800px) {
    .main-layout {
      grid-template-columns: 1fr;
    }
    .right-col {
      display: none;
    }
  }

  /* 左侧内容 */
  .left-col {
    background: white;
    border-radius: 4px;
    min-height: 500px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .tabs {
    border-bottom: 1px solid #e4e6eb;
    padding: 0 20px;
    display: flex;
  }
  .tab {
    padding: 15px 20px;
    font-size: 15px;
    color: #515767;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: 0.2s;
  }
  .tab:hover {
    color: #1e80ff;
  }
  .tab.active {
    color: #1e80ff;
    border-bottom-color: #1e80ff;
    font-weight: 500;
  }

  .activity-list {
    padding: 20px;
  }
  .act-card {
    padding-bottom: 20px;
    border-bottom: 1px solid #e5e6eb;
    margin-bottom: 20px;
  }
  .act-card:last-child {
    border-bottom: none;
  }

  .tag {
    font-size: 12px;
    color: #8a919f;
    margin-bottom: 8px;
  }

  /* 文章卡片 */
  .act-title {
    margin: 0 0 8px 0;
    font-size: 18px;
    line-height: 1.4;
  }
  .act-title a {
    color: #252933;
    text-decoration: none;
    font-weight: bold;
  }
  .act-title a:hover {
    color: #1e80ff;
  }
  .act-desc {
    color: #515767;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 8px;
  }
  .act-meta {
    font-size: 12px;
    color: #8a919f;
  }

  /* 沸点卡片 */
  .act-content {
    font-size: 15px;
    color: #252933;
    margin-bottom: 8px;
    white-space: pre-wrap;
    line-height: 1.6;
  }

  /* 右侧卡片 */
  .stat-card,
  .follow-stat-card,
  .meta-card {
    background: white;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .stat-card h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    border-bottom: 1px solid #e4e6eb;
    padding-bottom: 10px;
    color: #333;
  }
  .achieve-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    color: #515767;
    font-size: 14px;
  }
  .achieve-item .icon {
    background: #eaf2ff;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    font-size: 14px;
  }

  .follow-stat-card {
    display: flex;
  }
  .fs-item {
    flex: 1;
    text-align: center;
  }
  .fs-item .num {
    font-size: 18px;
    font-weight: bold;
    color: #252933;
    margin-top: 5px;
  }
  .fs-item .label {
    font-size: 13px;
    color: #8a919f;
  }

  .join-time {
    color: #8a919f;
    font-size: 13px;
    text-align: center;
  }
  .loading,
  .empty {
    text-align: center;
    padding: 50px;
    color: #999;
  }
  /* 鼠标手势 */
  .fs-item.clickable {
    cursor: pointer;
    transition: 0.2s;
    border-radius: 4px;
    padding: 4px 0;
  }
  .fs-item.clickable:hover {
    background: #f4f5f5;
  }

  /* === 模态框样式 === */
  .modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-content {
    background: white;
    width: 500px;
    max-height: 80vh;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e5e6eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .modal-header h3 {
    margin: 0;
    font-size: 16px;
    color: #333;
  }
  .close-btn {
    font-size: 24px;
    color: #999;
    cursor: pointer;
    line-height: 1;
  }
  .close-btn:hover {
    color: #666;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px;
  }

  /* 列表项样式 */
  .user-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f1f1f1;
  }
  .user-item:last-child {
    border-bottom: none;
  }

  .u-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 12px;
    object-fit: cover;
    border: 1px solid #eee;
  }
  .u-info {
    flex: 1;
    overflow: hidden;
  }
  .u-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    display: block;
    text-decoration: none;
    margin-bottom: 2px;
  }
  .u-name:hover {
    color: #1e80ff;
  }
  .u-job {
    font-size: 12px;
    color: #8a919f;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 小关注按钮 */
  .btn-small {
    padding: 6px 16px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    border: none;
    background: #eaf2ff;
    color: #1e80ff;
    font-weight: 500;
  }
  .btn-small:hover {
    background: #d4e3fc;
  }
  .btn-small.following {
    background: #f4f5f5;
    color: #8a919f;
  }
  /* 修改 pages/user/[id].vue 的 style */

  /* 头像容器：为了定位头像框 */
  .avatar-container {
    position: relative;
    width: 90px;
    height: 90px;
    margin-right: 24px;
  }
  .p-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid white; /* 默认白边 */
  }
  /* 头像框 */
  .p-frame {
    position: absolute;
    top: -18%;
    left: -18%; /* 根据框的大小微调 */
    width: 136%;
    height: 136%;
    z-index: 10;
    pointer-events: none;
  }

  /* 如果有背景图，文字变白，增加阴影防止看不清 */
  .profile-header[style*='background'] .p-name,
  .profile-header[style*='background'] .p-job,
  .profile-header[style*='background'] .p-intro {
    color: white;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }
</style>
