<script setup>
  const user = useUser()
  const router = useRouter()

  // 1. 获取 "题库" 专属分类
  const { data: categories } = await useFetch('/api/question-categories')

  const form = reactive({
    title: '',
    categoryId: '', // 必选
    type: 'text', // 默认简答题
    difficulty: 1,
    // 选择题专用数据
    options: ['', '', '', ''], // 默认4个空选项
    correctIndex: 0, // 单选答案
    correctIndices: [], // ★ 多选答案数组
    // 解析/答案
    analysis: ''
  })

  const isSubmitting = ref(false)

  const submit = async () => {
    if (!user.value) return router.push('/login')

    // 校验逻辑
    if (!form.title.trim()) return alert('请填写题目')
    if (!form.categoryId) return alert('请选择所属分类')
    if (!form.analysis.trim()) return alert('请填写解析或参考答案')

    // 选择题特殊校验
    if (form.type === 'choice') {
      if (form.options.some(opt => !opt.trim())) {
        return alert('选择题必须填写完整的4个选项')
      }
    }
    if (form.type === 'multiple' && form.correctIndices.length === 0) {
      return alert('多选题至少选一个正确答案')
    }

    isSubmitting.value = true
    try {
      await $fetch('/api/interview/submit', {
        method: 'POST',
        body: {
          ...form,
          // 如果是简答题，清理掉选择题字段，防止污染数据
          options: form.type === 'choice' || form.type === 'multiple' ? form.options : [],
          correctAnswer: form.type === 'choice' ? form.correctIndex : -1,
          correctAnswers: form.type === 'multiple' ? form.correctIndices : []
        }
      })
      alert('提交成功！审核通过后将获得 50 牛马币奖励 🎉')
      router.push('/interview')
    } catch (e) {
      alert('提交失败: ' + (e.data?.message || e.message))
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <div class="submit-page">
    <div class="container">
      <div class="header">
        <h2>📝 贡献面试题 (赚牛马币)</h2>
        <p class="sub-text">分享你的面试经验，帮助更多牛马兄弟上岸</p>
      </div>

      <div class="form-box">
        <!-- 1. 题目 -->
        <div class="form-group">
          <label>题目描述 <span class="required">*</span></label>
          <input v-model="form.title" placeholder="例如: Vue3 的生命周期有哪些? (一句话描述)" class="input" />
        </div>

        <!-- 2. 分类与属性 -->
        <div class="row">
          <div class="form-group half">
            <label>所属分类 <span class="required">*</span></label>
            <select v-model="form.categoryId" class="select">
              <option disabled value="">请选择分类</option>
              <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.icon }} {{ c.name }}</option>
            </select>
          </div>

          <div class="form-group quarter">
            <label>题目类型</label>
            <select v-model="form.type" class="select">
              <option value="text">简答/代码题</option>
              <option value="choice">单选题</option>
              <option value="multiple">多选题</option>
              <!-- 新增 -->
            </select>
          </div>

          <div class="form-group quarter">
            <label>难度</label>
            <select v-model="form.difficulty" class="select">
              <option :value="1">🟢 简单</option>
              <option :value="2">🟡 中等</option>
              <option :value="3">🔴 困难</option>
            </select>
          </div>
        </div>

        <!-- ★★★ 3. 选择题专用区域 ★★★ -->
        <transition name="fade">
          <div v-if="form.type === 'choice' || form.type === 'multiple'" class="options-area">
            <div v-for="(opt, idx) in form.options" :key="idx" class="option-row">
              <div class="radio-wrap">
                <!-- 单选显示 Radio -->
                <input v-if="form.type === 'choice'" type="radio" :value="idx" v-model="form.correctIndex" />

                <!-- ★ 多选显示 Checkbox ★ -->
                <input v-else type="checkbox" :value="idx" v-model="form.correctIndices" />

                <label>{{ String.fromCharCode(65 + idx) }}</label>
              </div>
              <input v-model="form.options[idx]" />
            </div>
          </div>
        </transition>

        <!-- 4. 解析/参考答案 -->
        <div class="form-group">
          <label>{{ form.type === 'choice' ? '题目解析' : '参考答案' }} <span class="required">*</span></label>
          <textarea
            v-model="form.analysis"
            placeholder="请详细说明答案的原理、代码示例或解题思路..."
            rows="8"
            class="textarea"></textarea>
        </div>

        <button @click="submit" class="btn-submit" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : '提交审核' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .submit-page {
    background: #f4f5f5;
    min-height: 100vh;
    padding: 20px 0;
  }
  .container {
    max-width: 800px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 20px;
    text-align: center;
  }
  .header h2 {
    margin: 0 0 5px 0;
    color: #333;
  }
  .sub-text {
    color: #8a919f;
    font-size: 14px;
    margin: 0;
  }

  .form-box {
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .form-group {
    margin-bottom: 24px;
  }
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    font-size: 14px;
    color: #333;
  }
  .required {
    color: #ff4d4f;
    margin-left: 4px;
  }

  .input,
  .select,
  .textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 14px;
    transition: 0.2s;
  }
  .input:focus,
  .select:focus,
  .textarea:focus {
    border-color: #1e80ff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(30, 128, 255, 0.1);
  }

  .row {
    display: flex;
    gap: 20px;
  }
  .half {
    flex: 2;
  }
  .quarter {
    flex: 1;
  }

  /* 选择题样式 */
  .options-area {
    background: #f9fbff;
    padding: 20px;
    border-radius: 6px;
    margin-bottom: 24px;
    border: 1px dashed #1e80ff;
  }
  .area-label {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
    display: block;
    color: #1e80ff;
  }
  .option-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }
  .option-row:last-child {
    margin-bottom: 0;
  }

  .radio-wrap {
    display: flex;
    align-items: center;
    width: 60px;
    flex-shrink: 0;
    cursor: pointer;
  }
  .radio-wrap input {
    margin-right: 8px;
    cursor: pointer;
    width: 16px;
    height: 16px;
    accent-color: #1e80ff;
  }
  .opt-ABC {
    font-weight: bold;
    cursor: pointer;
    font-size: 16px;
  }
  .opt-input {
    flex: 1;
    border-color: #e5e6eb;
  }

  .btn-submit {
    width: 100%;
    background: #1e80ff;
    color: white;
    padding: 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 1px;
    transition: 0.2s;
  }
  .btn-submit:hover {
    background: #1171ee;
  }
  .btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  @media (max-width: 600px) {
    .row {
      flex-direction: column;
      gap: 0;
    }
  }
</style>
