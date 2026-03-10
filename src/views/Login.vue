<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { showToast } from 'vant'

const router = useRouter()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const loading = ref(false)

async function onSubmit() {
  if (!username.value || !password.value) {
    showToast('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    await login(username.value, password.value)
    router.replace('/home')
  } catch (e: any) {
    showToast(e.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="login-icon">🧋</div>
        <h1 class="login-title">奶茶记录</h1>
        <p class="login-subtitle">记录每一杯小确幸</p>
      </div>

      <van-cell-group inset class="login-form">
        <van-field
          v-model="username"
          label="用户名"
          placeholder="英文或英文+数字"
          :rules="[{ required: true }]"
          autocomplete="username"
        />
        <van-field
          v-model="password"
          type="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true }]"
          autocomplete="current-password"
          @keyup.enter="onSubmit"
        />
      </van-cell-group>

      <div class="login-actions">
        <van-button
          round
          block
          type="primary"
          :loading="loading"
          loading-text="登录中..."
          class="login-btn"
          @click="onSubmit"
        >
          登录
        </van-button>
        <p class="login-link" @click="router.push('/register')">
          还没有账号？<span>立即注册</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FFF8F0 0%, #FDEBD3 50%, #F5D5B8 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 24px;
  padding: 40px 24px 32px;
  box-shadow: 0 8px 32px rgba(212, 149, 106, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #5D4037;
  margin: 0 0 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #8D6E63;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.login-actions {
  padding: 0 8px;
}

.login-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #D4956A, #E8A87C);
  border: none;
}

.login-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #8D6E63;
  cursor: pointer;
}

.login-link span {
  color: #D4956A;
  font-weight: 600;
}
</style>
