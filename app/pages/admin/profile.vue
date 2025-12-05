<script setup>
  definePageMeta({ layout: 'admin' })

  const user = useUser() // 获取全局用户状态

  // --- 模块1：基本资料 (头像 & 昵称) ---
  const profileForm = reactive({
    nickname: user.value?.nickname || '',
    avatar: user.value?.avatar || ''
  })
  const profileLoading = ref(false)

  // 触发文件选择
  const handleFileChange = async e => {
    const file = e.target.files[0]
    if (!file) return

    // 限制图片大小 (例如 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return alert('图片大小不能超过 2MB')
    }

    const formData = new FormData()
    // 注意：这里的 key 'file' 必须和你 upload.post.ts 里的 files.file 对应
    formData.append('file', file)

    try {
      // 1. 上传图片
      const res = await $fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      // 2. 上传成功，回显图片 (你的接口返回格式是 { url: ... })
      if (res.url) {
        profileForm.avatar = res.url
      }
    } catch (error) {
      console.error(error)
      alert('图片上传失败')
    }
  }

  // 保存资料
  const handleProfileUpdate = async () => {
    profileLoading.value = true
    try {
      const res = await $fetch('/api/user/profile', {
        method: 'PUT',
        body: {
          nickname: profileForm.nickname,
          avatar: profileForm.avatar
        }
      })

      // ★★★ 更新全局状态，让左侧菜单和顶部的头像立马变过来
      user.value = res.user
      alert('资料已更新 🎉')
    } catch (error) {
      alert(error.data?.message || '更新失败')
    } finally {
      profileLoading.value = false
    }
  }

  // --- 模块2：修改密码 ---
  const pwdForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const pwdLoading = ref(false)

  const handlePwdUpdate = async () => {
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      return alert('两次新密码不一致')
    }

    pwdLoading.value = true
    try {
      await $fetch('/api/auth/password', {
        method: 'POST',
        body: {
          oldPassword: pwdForm.oldPassword,
          newPassword: pwdForm.newPassword
        }
      })

      alert('密码修改成功，请重新登录')
      // 退出逻辑
      const token = useCookie('auth_token')
      token.value = null
      user.value = null
      navigateTo('/login')
    } catch (error) {
      alert(error.data?.message || '修改失败')
    } finally {
      pwdLoading.value = false
    }
  }
</script>

<template>
  <div class="profile-page">
    <!-- 左边：资料卡片 -->
    <div class="card">
      <h3 class="card-header">👤 个人资料</h3>

      <!-- 头像区域 -->
      <div class="avatar-box">
        <div class="avatar-wrapper">
          <img
            :src="profileForm.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.username"
            class="avatar-img" />
          <!-- 覆盖在头像上的上传按钮 -->
          <label class="upload-mask">
            <span>📷 更换</span>
            <input type="file" accept="image/*" hidden @change="handleFileChange" />
          </label>
        </div>
        <p class="avatar-tip">支持 jpg/png，最大 5MB</p>
      </div>

      <div class="form-item">
        <label>账号</label>
        <input type="text" :value="user?.username" disabled class="input disabled" />
      </div>

      <div class="form-item">
        <label>昵称</label>
        <input type="text" v-model="profileForm.nickname" class="input" placeholder="请输入昵称" />
      </div>

      <button class="btn btn-primary" @click="handleProfileUpdate" :disabled="profileLoading">
        {{ profileLoading ? '保存中...' : '保存修改' }}
      </button>
    </div>

    <!-- 右边：安全卡片 -->
    <div class="card">
      <h3 class="card-header">🛡️ 安全设置</h3>

      <div class="form-item">
        <label>旧密码</label>
        <input type="password" v-model="pwdForm.oldPassword" class="input" placeholder="验证当前密码" />
      </div>

      <div class="form-item">
        <label>新密码</label>
        <input type="password" v-model="pwdForm.newPassword" class="input" placeholder="设置新密码" />
      </div>

      <div class="form-item">
        <label>确认密码</label>
        <input type="password" v-model="pwdForm.confirmPassword" class="input" placeholder="再次输入新密码" />
      </div>

      <button class="btn btn-danger" @click="handlePwdUpdate" :disabled="pwdLoading">
        {{ pwdLoading ? '处理中...' : '修改密码' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
  .profile-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    max-width: 1000px;
    margin: 0 auto;
  }

  /* 响应式：手机端变成单列 */
  @media (max-width: 768px) {
    .profile-page {
      grid-template-columns: 1fr;
    }
  }

  .card {
    background: white;
    border-radius: 8px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .card-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 18px;
    color: #333;
  }

  /* 头像样式 */
  .avatar-box {
    text-align: center;
    margin-bottom: 24px;
  }
  .avatar-wrapper {
    position: relative;
    width: 100px;
    height: 100px;
    margin: 0 auto 10px;
    border-radius: 50%;
    overflow: hidden;
    border: 4px solid #f5f5f5;
    cursor: pointer;
  }
  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  /* 鼠标悬停显示上传遮罩 */
  .upload-mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: 0.3s;
    cursor: pointer;
    font-size: 13px;
  }
  .avatar-wrapper:hover .upload-mask {
    opacity: 1;
  }
  .avatar-tip {
    font-size: 12px;
    color: #999;
  }

  /* 表单样式 */
  .form-item {
    margin-bottom: 20px;
  }
  .form-item label {
    display: block;
    margin-bottom: 8px;
    color: #666;
    font-size: 14px;
  }
  .input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    transition: 0.3s;
    box-sizing: border-box; /* 必须加，防止宽度溢出 */
  }
  .input:focus {
    border-color: #1890ff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
  }
  .input.disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }

  /* 按钮 */
  .btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: 0.3s;
  }
  .btn-primary {
    background: #1890ff;
    color: white;
  }
  .btn-primary:hover {
    background: #40a9ff;
  }
  .btn-danger {
    background: white;
    color: #ff4d4f;
    border: 1px solid #ffccc7;
  }
  .btn-danger:hover {
    background: #fff1f0;
    border-color: #ff4d4f;
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
