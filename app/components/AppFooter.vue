<!-- components/AppFooter.vue -->
<template>
  <footer class="site-footer">
    <div class="footer-container">
      <!-- 第一列：关于本站 -->
      <div class="footer-col">
        <h3 class="footer-title">Blogs</h3>
        <p class="footer-desc">
          基于 Nuxt 4 + MongoDB 构建的全栈内容社区。 分享技术心得，记录生活点滴，致力于打造优雅的阅读与写作体验。
        </p>
        <div class="social-icons"></div>
      </div>

      <!-- 第二列：快速导航 -->
      <div class="footer-col">
        <h3 class="footer-title">探索</h3>
        <ul class="footer-links">
          <li><NuxtLink to="/">首页</NuxtLink></li>
          <li><NuxtLink to="/admin/">个人中心</NuxtLink></li>
        </ul>
      </div>

      <!-- 第三列：相关资源/备案信息 -->
      <div class="footer-col">
        <h3 class="footer-title">信息</h3>
        <ul class="footer-links">
          <li><a href="#">关于作者</a></li>
          <li><a href="#">免责声明</a></li>
        </ul>
      </div>
    </div>

    <!-- 底部版权条 -->
    <div class="copyright-bar">
      <p>
        © 2025 Blogs. Powered by
        <a href="https://nuxt.com" target="_blank">Nuxt</a> &
        <a href="https://www.mongodb.com" target="_blank">MongoDB</a>.
      </p>
    </div>
  </footer>
</template>

<style scoped>
  .site-footer {
    background-color: #2c3e50; /* 深蓝灰色背景 */
    color: #ecf0f1;
    padding-top: 60px;
    margin-top: 60px; /* 与上方内容拉开距离 */
  }

  .footer-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 40px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr; /* 左边宽，右边两列窄 */
    gap: 40px;
  }

  /* 手机端变成单列 */
  @media (max-width: 768px) {
    .footer-container {
      grid-template-columns: 1fr;
      gap: 30px;
    }
  }

  .footer-title {
    color: #fff;
    font-size: 18px;
    margin-bottom: 20px;
    font-weight: 600;
    position: relative;
  }

  /* 标题下面的小短线装饰 */
  .footer-title::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -8px;
    width: 30px;
    height: 2px;
    background-color: #764ba2; /* 用你的主色调紫色 */
  }

  .footer-desc {
    font-size: 14px;
    line-height: 1.6;
    color: #bdc3c7;
    margin-bottom: 20px;
    max-width: 300px;
  }

  .social-icons {
    display: flex;
    gap: 15px;
  }
  .icon {
    font-size: 14px;
    color: #bdc3c7;
    transition: 0.3s;
  }
  .icon:hover {
    color: #fff;
    text-decoration: underline;
  }

  .footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .footer-links li {
    margin-bottom: 10px;
  }
  .footer-links a {
    color: #bdc3c7;
    font-size: 14px;
    transition: all 0.2s;
  }
  .footer-links a:hover {
    color: #fff;
    padding-left: 5px; /* 悬停时微微右移 */
  }

  /* 底部版权 */
  .copyright-bar {
    background-color: #243342; /* 比上面再深一点 */
    text-align: center;
    padding: 20px 0;
    font-size: 13px;
    color: #7f8c8d;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
  .copyright-bar a {
    color: #95a5a6;
  }
  .copyright-bar a:hover {
    color: #fff;
  }
</style>
