<!-- pages/register.vue -->
<script setup>
  // === 逻辑保持不变 ===
  const form = ref({ username: '', password: '', nickname: '' })
  const user = useUser()
  const router = useRouter()

  const handleRegister = async () => {
    try {
      const res = await $fetch('/api/auth/register', { method: 'POST', body: form.value })
      user.value = res.user // 更新全局状态
      alert('注册成功！')
      router.push('/') // 注意：，这里以后可能要改成 /admin
    } catch (err) {
      alert(err.data?.message || '注册失败')
    }
  }
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h2>🚀 加入我们</h2>
      <p class="subtitle">创建一个新账号开始创作</p>

      <!-- 账号 -->
      <div class="input-group">
        <label>账号</label>
        <input v-model="form.username" placeholder="请输入用户名" />
      </div>

      <!-- 密码 -->
      <div class="input-group">
        <label>密码</label>
        <input v-model="form.password" type="password" placeholder="设置登录密码" />
      </div>

      <!-- 昵称 -->
      <div class="input-group">
        <label>昵称</label>
        <input v-model="form.nickname" placeholder="大家怎么称呼你" @keyup.enter="handleRegister" />
      </div>

      <button @click="handleRegister" class="btn-login">立即注册</button>

      <div class="footer-links">
        <NuxtLink to="/login">已有账号？去登录</NuxtLink>
        <span class="divider">|</span>
        <NuxtLink to="/">返回首页</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 样式复用 login.vue 的风格 */
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f2f5;
    background-image: linear-gradient(135deg, #f0f2f5 0%, #e6e9f0 100%);
  }
  .login-card {
    background: white;
    padding: 40px;
    border-radius: 12px;
    width: 100%;
    max-width: 380px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  }

  h2 {
    margin: 0 0 10px 0;
    color: #333;
    text-align: center;
  }
  .subtitle {
    color: #888;
    margin-bottom: 30px;
    font-size: 0.9rem;
    text-align: center;
  }

  .input-group {
    margin-bottom: 20px;
  }
  .input-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #555;
    font-weight: 500;
  }
  input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    box-sizing: border-box;
    transition: 0.2s;
  }
  input:focus {
    border-color: #764ba2;
    outline: none;
    box-shadow: 0 0 0 3px rgba(118, 75, 162, 0.1);
  }

  .btn-login {
    width: 100%;
    padding: 12px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: 0.2s;
    font-weight: bold;
    margin-bottom: 20px;
  }
  .btn-login:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .footer-links {
    text-align: center;
    font-size: 14px;
    color: #999;
  }
  .footer-links a {
    color: #666;
    text-decoration: none;
  }
  .footer-links a:hover {
    color: #764ba2;
  }
  .divider {
    margin: 0 10px;
    color: #ddd;
  }
</style>
