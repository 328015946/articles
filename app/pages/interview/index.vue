<script setup>
  const router = useRouter()

  // 1. 获取题库分类
  const { data: categories } = await useFetch('/api/question-categories')

  const currentCat = ref('') // 当前分类ID
  const page = ref(1) // ★ 当前页码
  const limit = 10 // ★ 每页条数

  // 2. 获取题目列表 (自动监听 currentCat 和 page)
  const { data: res, refresh } = await useFetch('/api/interview/list', {
    query: computed(() => ({
      categoryId: currentCat.value,
      page: page.value, // ★ 传给后端
      limit: limit
    }))
  })

  const questions = computed(() => res.value?.list || [])
  const total = computed(() => res.value?.total || 0) // ★ 总条数
  const totalPages = computed(() => Math.ceil(total.value / limit) || 1) // ★ 总页数

  // 监听分类变化，重置页码
  watch(currentCat, () => {
    page.value = 1
  })

  // ★ 分页切换函数
  const changePage = newPage => {
    if (newPage < 1 || newPage > totalPages.value) return
    page.value = newPage
    // 滚动回顶部
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // 3. 控制答案显示状态 Map
  const showAnswerMap = ref({})
  const toggleAnswer = id => {
    showAnswerMap.value[id] = !showAnswerMap.value[id]
  }

  // ★★★ 修改点 1：新建一个 Ref 来存储用户的选择 { [questionId]: selectedIndex } ★★★
  const selections = ref({})

  // 4. 选择题点击逻辑 (修改)
  const selectOption = (question, index) => {
    if (showAnswerMap.value[question._id]) return

    // 修改为：存入 selections 对象，而不是修改 question 本身
    selections.value[question._id] = index
  }

  // 存储多选的选择状态：{ [id]: [0, 2] } (选中了A和C)
  const multiSelections = ref({})

  // 3. ★★★ 新增：多选点击逻辑 ★★★
  const toggleMultiOption = (q, idx) => {
    // 如果已看答案，禁止修改
    if (showAnswerMap.value[q._id]) return

    const selected = multiSelections.value[q._id] || []
    if (selected.includes(idx)) {
      // 已选 -> 取消
      multiSelections.value[q._id] = selected.filter(i => i !== idx)
    } else {
      // 未选 -> 选中 (并排序，方便比对)
      multiSelections.value[q._id] = [...selected, idx].sort()
    }
  }
  // 4. ★★★ 新增：判断多选是否正确 ★★★
  const isMultiCorrect = q => {
    // 把用户选的索引数组 和 正确答案数组 转成字符串比对
    const userAns = JSON.stringify(multiSelections.value[q._id] || [])
    // 确保后端返回的 correctAnswers 也是排序过的，或者在这里 sort 一下
    const correctAns = JSON.stringify((q.correctAnswers || []).sort())
    return userAns === correctAns
  }
</script>

<template>
  <div class="interview-page">
    <div class="container">
      <!-- 顶部区域 -->
      <div class="header-area">
        <div class="title-box">
          <h1>🧠 牛马面试题库</h1>
          <p>每日一练，Offer 就在眼前</p>
        </div>
        <NuxtLink to="/interview/submit" class="btn-add">➕ 我要出题</NuxtLink>
      </div>

      <!-- 分类 Tab -->
      <div class="cat-tabs">
        <span class="cat-item" :class="{ active: currentCat === '' }" @click="currentCat = ''">全部</span>

        <span
          v-for="c in categories"
          :key="c._id"
          class="cat-item"
          :class="{ active: currentCat === c._id }"
          @click="currentCat = c._id">
          {{ c.icon }} {{ c.name }}
        </span>
      </div>

      <!-- 题目列表 -->
      <div class="q-list">
        <div v-for="q in questions" :key="q._id" class="q-card">
          <!-- 题目头部 -->
          <div class="q-header">
            <span v-if="q.category" class="cat-tag">{{ q.category.icon }} {{ q.category.name }}</span>

            <span class="badge" :class="`diff-${q.difficulty}`">
              {{ q.difficulty === 1 ? '简单' : q.difficulty === 2 ? '中等' : '困难' }}
            </span>
            <span class="type-tag">
              {{ q.type === 'choice' ? '单选题' : q.type === 'multiple' ? '多选题' : '简答题' }}
            </span>

            <h3 class="q-title">{{ q.title }}</h3>
          </div>

          <div class="q-meta">
            <span class="meta-item">出题人: {{ q.author?.nickname || '匿名' }}</span>
          </div>

          <!-- A. 选择题区域 -->
          <div v-if="q.type === 'choice' && q.options" class="choices-box">
            <div
              v-for="(opt, idx) in q.options"
              :key="idx"
              class="choice-item"
              :class="{
                /* 正确答案：显示答案后，正确的那一项永远变绿 */
                correct: showAnswerMap[q._id] && idx === q.correctAnswer,

                /* 错误答案：显示答案后 && 你选了这个 && 这个不是正确答案 -> 变红 */
                wrong: showAnswerMap[q._id] && selections[q._id] === idx && idx !== q.correctAnswer,

                /* ★★★ 核心修复：只有在【没看答案】的时候，才显示蓝色的选中状态 ★★★ */
                /* 这样一旦看了答案，蓝色 class 就会消失，红色 class 就能显示出来了 */
                selected: !showAnswerMap[q._id] && selections[q._id] === idx,

                disabled: showAnswerMap[q._id]
              }"
              @click="selectOption(q, idx)">
              <span class="opt-tag">{{ String.fromCharCode(65 + idx) }}.</span>
              <span class="opt-text">{{ opt }}</span>
              <span v-if="showAnswerMap[q._id] && idx === q.correctAnswer" class="result-icon">✅</span>
              <span
                v-if="showAnswerMap[q._id] && selections[q._id] === idx && idx !== q.correctAnswer"
                class="result-icon"
                >❌</span
              >
            </div>
          </div>
          <!-- B. ★★★ 多选区域 ★★★ -->
          <!-- ★★★ 修复点 2：新增多选题区域 ★★★ -->
          <div v-if="q.type === 'multiple' && q.options" class="choices-box">
            <div class="tip-text">（多选题，请选择所有正确选项）</div>
            <div
              v-for="(opt, idx) in q.options"
              :key="idx"
              class="choice-item"
              :class="{
                /* 选中样式 (蓝色) */
                selected: !showAnswerMap[q._id] && multiSelections[q._id]?.includes(idx),

                /* 结果揭晓：正确答案 (绿色) */
                correct: showAnswerMap[q._id] && q.correctAnswers?.includes(idx),

                /* 结果揭晓：漏选/错选 (红色) */
                /* 逻辑：我看过答案了 && (我选了这个但它不对 OR 我没选这个但它是对的) -> 其实简单点，只要跟正确答案对不上就标红 */
                wrong: showAnswerMap[q._id] && multiSelections[q._id]?.includes(idx) && !q.correctAnswers?.includes(idx)
              }"
              @click="toggleMultiOption(q, idx)">
              <!-- 多选用方块图标表示 -->
              <span class="opt-tag">◻️ {{ String.fromCharCode(65 + idx) }}.</span>
              <span class="opt-text">{{ opt }}</span>
            </div>
          </div>

          <!-- B. 答案解析区域 -->
          <!-- 答案解析区域 -->
          <transition name="slide">
            <div class="answer-box" v-if="showAnswerMap[q._id]">
              <div class="answer-header">
                <span class="answer-label">
                  <!-- ★★★ 修复点 3：多选题显示判分结果 ★★★ -->
                  <span v-if="q.type === 'multiple'">
                    {{ isMultiCorrect(q) ? '🎉 回答正确！' : '😭 回答错误' }}
                    正确选项：
                    <strong class="correct-text">
                      {{ q.correctAnswers?.map(i => String.fromCharCode(65 + i)).join('') }}
                    </strong>
                  </span>

                  <span v-else-if="q.type === 'choice'">
                    正确答案：<strong class="correct-text">{{ String.fromCharCode(65 + q.correctAnswer) }}</strong>
                  </span>

                  <span v-else>参考解析：</span>
                </span>
              </div>
              <div class="answer-content">{{ q.analysis || q.answer }}</div>
            </div>
          </transition>

          <!-- 操作栏 -->
          <div class="q-footer">
            <button class="btn-toggle" @click="toggleAnswer(q._id)">
              {{ showAnswerMap[q._id] ? '收起解析' : '查看解析 / 核对' }}
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="questions.length === 0" class="empty-state">该分类下暂时没有题目，快去贡献一道吧！</div>

        <!-- ★★★ 分页组件 ★★★ -->
        <div v-if="total > limit" class="pagination">
          <button class="page-btn" :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>

          <span class="page-info">{{ page }} / {{ totalPages }}</span>

          <button class="page-btn" :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .interview-page {
    background: #f4f5f5;
    min-height: 100vh;
    padding: 20px 0;
  }
  .container {
    max-width: 1100px;
    margin: 0 auto;
  }

  /* 头部 */
  .header-area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .title-box h1 {
    margin: 0 0 5px 0;
    font-size: 24px;
    color: #333;
  }
  .title-box p {
    margin: 0;
    color: #8a919f;
    font-size: 14px;
  }
  .btn-add {
    background: linear-gradient(90deg, #1e80ff, #0052cc);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    text-decoration: none;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(30, 128, 255, 0.3);
    transition: 0.2s;
  }
  .btn-add:hover {
    transform: translateY(-2px);
  }

  /* Tabs */
  .cat-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    overflow-x: auto;
    padding-bottom: 5px;
    scrollbar-width: none;
  }
  .cat-item {
    padding: 8px 18px;
    background: white;
    border-radius: 20px;
    cursor: pointer;
    color: #515767;
    font-size: 14px;
    border: 1px solid transparent;
    transition: 0.2s;
    white-space: nowrap;
  }
  .cat-item:hover {
    color: #1e80ff;
  }
  .cat-item.active {
    background: #e8f3ff;
    color: #1e80ff;
    border-color: #1e80ff;
    font-weight: bold;
  }

  /* 题目卡片 */
  .q-card {
    background: white;
    padding: 24px;
    margin-bottom: 16px;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  .q-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  .q-title {
    margin: 0;
    font-size: 17px;
    line-height: 1.5;
    color: #1d2129;
    flex: 1;
  }

  /* 标签 */
  .badge {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    color: white;
    height: fit-content;
    white-space: nowrap;
  }
  .diff-1 {
    background: #52c41a;
  }
  .diff-2 {
    background: #faad14;
  }
  .diff-3 {
    background: #ff4d4f;
  }
  .type-tag {
    font-size: 12px;
    background: #f2f3f5;
    color: #86909c;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
  }
  .cat-tag {
    font-size: 12px;
    background: #fff7e6;
    color: #fa8c16;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #ffd591;
    white-space: nowrap;
  }

  .q-meta {
    font-size: 12px;
    color: #86909c;
    margin-bottom: 16px;
  }
  .meta-item {
    margin-right: 15px;
  }

  /* 选项列表 */
  .choices-box {
    margin-bottom: 20px;
  }
  .choice-item {
    padding: 12px 16px;
    border: 1px solid #e5e6eb;
    border-radius: 6px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    align-items: center;
    position: relative;
  }
  .choice-item:hover:not(.disabled) {
    background: #f7f8fa;
    border-color: #1e80ff;
  }
  .opt-tag {
    font-weight: bold;
    margin-right: 12px;
    color: #1e80ff;
  }
  .opt-text {
    color: #333;
    font-size: 15px;
  }
  .result-icon {
    margin-left: auto;
    font-weight: bold;
  }

  .choice-item.selected {
    border-color: #1e80ff;
    background: #e8f3ff;
    color: #1e80ff;
    font-weight: 500;
  }
  .choice-item.correct {
    background-color: #f6ffed;
    border-color: #b7eb8f;
    color: #52c41a;
  }
  .choice-item.wrong {
    background-color: #fff1f0;
    border-color: #ffa39e;
    color: #f5222d;
  }

  /* 答案解析 */
  .answer-box {
    background: #f9f9f9;
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 16px;
    border-left: 4px solid #1e80ff;
  }
  .answer-header {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
  }
  .answer-label {
    font-weight: bold;
    color: #333;
  }
  .correct-text {
    color: #52c41a;
    font-size: 18px;
    margin-left: 5px;
  }
  .answer-content {
    white-space: pre-wrap;
    font-size: 14px;
    color: #515767;
    line-height: 1.6;
  }

  .q-footer {
    text-align: right;
  }
  .btn-toggle {
    background: none;
    border: 1px solid #1e80ff;
    color: #1e80ff;
    padding: 6px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: 0.2s;
  }
  .btn-toggle:hover {
    background: #1e80ff;
    color: white;
  }

  .empty-state {
    text-align: center;
    color: #999;
    padding: 60px 0;
    font-size: 14px;
  }

  /* 动画 */
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.3s ease;
    max-height: 500px;
    opacity: 1;
    overflow: hidden;
  }
  .slide-enter-from,
  .slide-leave-to {
    max-height: 0;
    opacity: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin: 0;
  }

  /* ★★★ 分页样式 ★★★ */
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 30px;
    padding-bottom: 20px;
  }
  .page-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    color: #555;
    transition: 0.2s;
  }
  .page-btn:hover:not(:disabled) {
    border-color: #1e80ff;
    color: #1e80ff;
  }
  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f5f5f5;
  }
  .page-info {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }
  /* 选中状态 (未揭晓答案前 - 蓝色) */
  .choice-item.selected {
    border-color: #1e80ff;
    background-color: #e8f3ff;
    color: #1e80ff;
    font-weight: 500;
  }

  /* 结果揭晓：正确 (绿色 - 保持不变) */
  .choice-item.correct {
    background-color: #f6ffed;
    border-color: #b7eb8f;
    color: #52c41a;
  }

  /* ★★★ 修改这里：错误 (红色系) ★★★ */
  /* 注意：这段 CSS 必须写在 .selected 下面，这样才能覆盖掉蓝色的选中样式 */
  .choice-item.wrong {
    background-color: #fff2f0; /* 浅红背景 */
    border-color: #ff4d4f; /* 红色边框 */
    color: #ff4d4f; /* 红色文字 */
  }
  .tip-text {
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
    margin-left: 2px;
  }
</style>
