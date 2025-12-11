<!-- pages/login.vue -->
<script setup>
  const username = ref('') // 新增：用户名
  const password = ref('')
  const errorMsg = ref('')
  const router = useRouter()
  const userState = useUser() // 获取全局用户状态

  const handleLogin = async () => {
    if (!username.value || !password.value) {
      errorMsg.value = '请输入账号和密码'
      return
    }

    try {
      // 调用后端标准登录接口
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          username: username.value,
          password: password.value
        }
      })

      // 登录成功后：
      // 1. 更新全局用户状态
      userState.value = res.user

      // 2. 跳转
      // 如果是管理员，去后台；如果是普通用户，去个人中心(或首页)
      router.push('/')
    } catch (err) {
      // 显示后端返回的错误信息
      errorMsg.value = err.data?.message || '登录失败，请检查账号密码'
    }
  }
  // ★★★ 新增：检查退出原因并弹窗 ★★★
  onMounted(() => {
    // 1. 读取 Cookie
    const logoutReason = useCookie('logout_reason')

    // 2. 如果有值，说明是被强制踢出来的
    if (logoutReason.value) {
      // 弹出提示 (或者用更高级的 Toast/Dialog组件)
      alert(logoutReason.value) // 效果： "账号已被封禁，禁止访问"

      // 3. 销毁 Cookie，防止刷新再次弹出
      logoutReason.value = null
    }
  })
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h2>👋 欢迎回来</h2>
      <p class="subtitle">请登录您的账号</p>

      <!-- 账号输入框 -->
      <div class="input-group">
        <label>账号</label>
        <input type="text" v-model="username" placeholder="请输入用户名" autofocus />
      </div>

      <!-- 密码输入框 -->
      <div class="input-group">
        <label>密码</label>
        <input type="password" v-model="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
      </div>

      <div class="error" v-if="errorMsg">{{ errorMsg }}</div>

      <button @click="handleLogin" class="btn-login">立即登录</button>

      <div class="footer-links">
        <NuxtLink to="/register">没有账号？去注册</NuxtLink>
        <span class="divider">|</span>
        <NuxtLink to="/">返回首页</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

  .error {
    color: #ff4d4f;
    font-size: 0.9rem;
    margin-bottom: 20px;
    background: #fff1f0;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ffccc7;
    text-align: center;
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
