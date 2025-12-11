<!-- components/AppFooter.vue -->
<template>
  <footer class="cool-footer">
    <!-- 顶部的流光线条 -->
    <div class="rainbow-line"></div>

    <div class="footer-content">
      <!-- 背景装饰球（营造氛围感） -->
      <div class="glow-orb orb-1"></div>
      <div class="glow-orb orb-2"></div>

      <div class="footer-container">
        <!-- 第一列：品牌与理念 -->
        <div class="footer-col brand-col">
          <div class="brand-wrapper">
            <span class="brand-icon">&gt;_</span>
            <h3 class="footer-title">牛马社区</h3>
          </div>
          <p class="footer-desc">
            为开发者打造的精神角落。<br />
            在这里，代码不仅是工作，更是连接世界的桥梁。 拒绝内卷，享受技术。
          </p>
        </div>

        <!-- 第二列：导航 -->
        <div class="footer-col">
          <h4 class="col-title">探索发现</h4>
          <ul class="link-list">
            <li><NuxtLink to="/">首页动态</NuxtLink></li>
            <li><NuxtLink to="/pins">摸鱼沸点</NuxtLink></li>
            <li><NuxtLink to="/admin/publish">开始创作</NuxtLink></li>
          </ul>
        </div>

        <!-- 第三列：技术栈 (致敬) -->
        <div class="footer-col">
          <h4 class="col-title">技术驱动</h4>
          <ul class="link-list tech-list">
            <li><span class="dot nuxt"></span> Nuxt 4</li>
            <li><span class="dot mongo"></span> MongoDB</li>
            <li><span class="dot node"></span> Node.js</li>
            <li><span class="dot vue"></span> Vue 3</li>
          </ul>
        </div>
      </div>

      <!-- 底部版权 -->
      <div class="copyright-area">
        <div class="cr-content">
          <span>&copy; 2025 Niuma Coders.</span>
          <span class="sep">|</span>
          <span>Made with <span class="heart">❤</span> and Caffeine.</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
  /* === 整体容器 === */
  .cool-footer {
    position: relative;
    background: #0f172a; /* 深邃蓝黑 */
    color: #94a3b8;
    overflow: hidden; /* 裁剪溢出的光晕 */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  /* === 顶部流光线条 === */
  .rainbow-line {
    height: 4px;
    width: 100%;
    background: linear-gradient(90deg, #ff4d4f, #f9cb28, #4caf50, #1e80ff, #9747ff);
    background-size: 200% 100%;
    animation: rainbowMove 5s linear infinite;
  }
  @keyframes rainbowMove {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 200% 0%;
    }
  }

  /* === 氛围背景光晕 === */
  .glow-orb {
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    z-index: 0;
    pointer-events: none;
  }
  .orb-1 {
    background: #1e80ff;
    top: -100px;
    left: -50px;
  }
  .orb-2 {
    background: #9747ff;
    bottom: -50px;
    right: -50px;
  }

  /* === 内容布局 === */
  .footer-content {
    position: relative;
    z-index: 1; /* 保证内容在光晕之上 */
    padding: 60px 0 0;
  }

  .footer-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 60px;
  }

  /* 品牌列 */
  .brand-wrapper {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    color: #fff;
  }
  .brand-icon {
    font-family: 'Consolas', monospace;
    font-weight: bold;
    font-size: 24px;
    color: #1e80ff;
    margin-right: 10px;
    text-shadow: 0 0 10px rgba(30, 128, 255, 0.5);
  }
  .footer-title {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1px;
  }
  .footer-desc {
    font-size: 14px;
    line-height: 1.8;
    margin-bottom: 24px;
    max-width: 320px;
    color: #64748b;
  }

  /* 社交图标 */
  .social-links {
    display: flex;
    gap: 15px;
  }
  .s-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    transition: all 0.3s;
  }
  .s-icon:hover {
    background: #1e80ff;
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(30, 128, 255, 0.3);
  }

  /* 链接列表 */
  .col-title {
    color: #fff;
    font-size: 16px;
    margin-bottom: 20px;
    font-weight: 600;
  }
  .link-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .link-list li {
    margin-bottom: 12px;
  }
  .link-list a {
    color: #94a3b8;
    text-decoration: none;
    font-size: 14px;
    transition: 0.2s;
    position: relative;
    display: inline-block;
  }
  /* 链接悬停动效：文字变白，左移 */
  .link-list a:hover {
    color: #1e80ff;
    transform: translateX(5px);
  }

  /* 技术栈小圆点 */
  .tech-list li {
    display: flex;
    align-items: center;
    font-size: 14px;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    display: inline-block;
  }
  .dot.nuxt {
    background: #00dc82;
    box-shadow: 0 0 8px #00dc82;
  }
  .dot.mongo {
    background: #4db33d;
    box-shadow: 0 0 8px #4db33d;
  }
  .dot.node {
    background: #3c873a;
  }
  .dot.vue {
    background: #42b883;
  }

  /* === 底部版权 === */
  .copyright-area {
    margin-top: 60px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding: 24px 0;
    background: rgba(0, 0, 0, 0.2);
  }
  .cr-content {
    max-width: 1100px;
    margin: 0 auto;
    text-align: center;
    font-size: 13px;
    color: #475569;
  }
  .sep {
    margin: 0 10px;
    opacity: 0.3;
  }
  .heart {
    color: #ff4d4f;
    animation: beat 1.5s infinite;
    display: inline-block;
  }

  @keyframes beat {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  /* 响应式 */
  @media (max-width: 768px) {
    .footer-container {
      grid-template-columns: 1fr;
      gap: 40px;
      text-align: center;
    }
    .brand-wrapper {
      justify-content: center;
    }
    .footer-desc {
      margin: 0 auto 24px;
    }
    .social-links {
      justify-content: center;
    }
  }
</style>
