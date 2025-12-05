<!-- error.vue -->
<script setup>
  // Nuxt 会自动传入 error 对象
  const props = defineProps({
    error: Object
  })

  // 清除错误并跳转回首页
  const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="error-container">
    <div class="content">
      <!-- 巨大的 404 文字 -->
      <h1 class="error-code">404</h1>

      <div class="message-box">
        <h2 class="title">哎呀，页面迷路了</h2>
        <p class="description">
          您访问的页面似乎已经飞向了外太空 🪐<br />
          可能是网址输错了，或者这篇文章已经被作者删除了。
        </p>

        <!-- 返回按钮 -->
        <button @click="handleError" class="btn-home">🚀 返回地球 (首页)</button>
      </div>
    </div>

    <!-- 背景装饰圆圈 -->
    <div class="circle c1"></div>
    <div class="circle c2"></div>
  </div>
</template>

<style scoped>
  /* 全屏容器 */
  .error-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    position: relative;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .content {
    text-align: center;
    position: relative;
    z-index: 10;
    padding: 0 20px;
  }

  /* 404 特效文字 */
  .error-code {
    font-size: 10rem; /* 超大字体 */
    font-weight: 900;
    margin: 0;
    line-height: 1;
    /* 使用你网站的主题渐变色 */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    /* 添加浮动动画 */
    animation: float 6s ease-in-out infinite;
    /* 添加投影 */
    filter: drop-shadow(0 10px 20px rgba(118, 75, 162, 0.2));
  }

  .title {
    font-size: 2rem;
    color: #333;
    margin-top: 20px;
    margin-bottom: 10px;
  }

  .description {
    color: #666;
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 40px;
  }

  /* 按钮样式 */
  .btn-home {
    padding: 12px 30px;
    font-size: 1rem;
    border: none;
    border-radius: 50px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
    font-weight: bold;
  }

  .btn-home:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(118, 75, 162, 0.4);
  }

  .btn-home:active {
    transform: translateY(0);
  }

  /* 背景装饰球 */
  .circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.1;
    pointer-events: none;
  }

  .c1 {
    width: 300px;
    height: 300px;
    background: #667eea;
    top: -50px;
    left: -50px;
    filter: blur(80px);
  }

  .c2 {
    width: 400px;
    height: 400px;
    background: #764ba2;
    bottom: -100px;
    right: -100px;
    filter: blur(100px);
  }

  /* 浮动动画关键帧 */
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  /* 手机端适配 */
  @media (max-width: 600px) {
    .error-code {
      font-size: 6rem;
    }
    .title {
      font-size: 1.5rem;
    }
  }
</style>
