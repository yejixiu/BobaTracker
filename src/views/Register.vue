<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { showToast } from 'vant'

const router = useRouter()
const { register } = useAuth()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const loading = ref(false)

function validateUsername(val: string) {
  if (!val) return '请输入用户名'
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(val)) return '用户名只能包含英文和数字，且以英文开头'
  if (val.length < 3 || val.length > 20) return '用户名长度需要3-20个字符'
  return ''
}

async function onSubmit() {
  const usernameErr = validateUsername(username.value)
  if (usernameErr) {
    showToast(usernameErr)
    return
  }
  if (password.value.length < 6) {
    showToast('密码至少6个字符')
    return
  }
  if (password.value !== confirmPassword.value) {
    showToast('两次密码不一致')
    return
  }

  loading.value = true
  try {
    await register(username.value, password.value, nickname.value || undefined)
    showToast('注册成功')
    router.replace('/home')
  } catch (e: any) {
    showToast(e.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <div class="register-header">
        <div class="register-icon">🧋</div>
        <h1 class="register-title">创建账号</h1>
        <p class="register-subtitle">开始记录你的奶茶之旅</p>
      </div>

      <van-cell-group inset class="register-form">
        <van-field
          v-model="username"
          label="用户名"
          placeholder="英文或英文+数字（3-20位）"
          autocomplete="username"
        />
        <van-field
          v-model="nickname"
          label="昵称"
          placeholder="选填，默认使用用户名"
        />
        <van-field
          v-model="password"
          type="password"
          label="密码"
          placeholder="至少6个字符"
          autocomplete="new-password"
        />
        <van-field
          v-model="confirmPassword"
          type="password"
          label="确认密码"
          placeholder="再次输入密码"
          autocomplete="new-password"
          @keyup.enter="onSubmit"
        />
      </van-cell-group>

      <div class="register-actions">
        <van-button
          round
          block
          type="primary"
          :loading="loading"
          loading-text="注册中..."
          class="register-btn"
          @click="onSubmit"
        >
          注册
        </van-button>
        <p class="register-link" @click="router.push('/login')">
          已有账号？<span>去登录</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF8F0 0%, #FDEBD3 50%, #F5D5B8 100%);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 24px;
  padding: 40px 24px 32px;
  box-shadow: 0 8px 32px rgba(212, 149, 106, 0.15);
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.register-title {
  font-size: 24px;
  font-weight: 700;
  color: #5D4037;
  margin: 0 0 8px;
}

.register-subtitle {
  font-size: 14px;
  color: #8D6E63;
  margin: 0;
}

.register-form {
  margin-bottom: 24px;
}

.register-actions {
  padding: 0 8px;
}

.register-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #D4956A, #E8A87C);
  border: none;
}

.register-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #8D6E63;
  cursor: pointer;
}

.register-link span {
  color: #D4956A;
  font-weight: 600;
}
</style>
