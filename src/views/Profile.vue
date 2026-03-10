<script setup lang="ts">
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { user, logout } = useAuth()

async function onLogout() {
  try {
    await showConfirmDialog({ title: '确认退出', message: '确定要退出登录吗？' })
    logout()
    router.replace('/login')
  } catch { /* cancelled */ }
}

const menuItems = [
  { label: '我的品牌', icon: 'shop-o', path: '/profile/brands' },
  { label: '我的甜度', icon: 'fire-o', path: '/profile/sweetness' },
  { label: '我的小料', icon: 'gem-o', path: '/profile/toppings' },
  { label: '记录设置', icon: 'setting-o', path: '/profile/fields' },
  { label: '成就墙', icon: 'medal-o', path: '/profile/achievements' },
  { label: '红黄黑榜', icon: 'star-o', path: '/ranking' },
]
</script>

<template>
  <div class="profile-page">
    <!-- User Card -->
    <div class="user-card">
      <div class="user-avatar">
        <img v-if="user?.avatar" :src="user.avatar" alt="" />
        <span v-else>{{ (user?.nickname || user?.username || '?')[0] }}</span>
      </div>
      <div class="user-info">
        <div class="user-nickname">{{ user?.nickname || user?.username || '奶茶爱好者' }}</div>
        <div class="user-username">@{{ user?.username }}</div>
      </div>
    </div>

    <!-- Menu -->
    <div class="menu-card">
      <div
        v-for="item in menuItems"
        :key="item.path"
        class="menu-item"
        @click="router.push(item.path)"
      >
        <van-icon :name="item.icon" class="menu-icon" />
        <span class="menu-label">{{ item.label }}</span>
        <van-icon name="arrow" class="menu-arrow" />
      </div>
    </div>

    <!-- Logout -->
    <div class="logout-wrap">
      <van-button round block plain type="danger" @click="onLogout">退出登录</van-button>
    </div>
  </div>
</template>

<style scoped>
.profile-page { min-height: 100vh; background: #FBF5F0; padding: 0 16px 80px; }

.user-card {
  display: flex; align-items: center; gap: 16px;
  background: linear-gradient(135deg, #D4956A, #E8A87C);
  border-radius: 20px; padding: 24px 20px; margin-top: 16px;
  box-shadow: 0 4px 20px rgba(212,149,106,0.3);
}
.user-avatar {
  width: 60px; height: 60px; border-radius: 50%;
  background: rgba(255,255,255,0.3); display: flex;
  align-items: center; justify-content: center;
  color: white; font-size: 26px; font-weight: 700; overflow: hidden;
}
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.user-nickname { font-size: 20px; font-weight: 700; color: white; }
.user-username { font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 2px; }

.menu-card {
  background: white; border-radius: 16px; margin-top: 16px;
  box-shadow: 0 2px 12px rgba(212,149,106,0.08); overflow: hidden;
}
.menu-item {
  display: flex; align-items: center; padding: 16px;
  border-bottom: 1px solid #F5EDE6; cursor: pointer;
}
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: #FBF5F0; }
.menu-icon { font-size: 20px; color: #D4956A; margin-right: 12px; }
.menu-label { flex: 1; font-size: 15px; color: #5D4037; font-weight: 500; }
.menu-arrow { font-size: 14px; color: #BCAAA4; }

.logout-wrap { margin-top: 24px; }
</style>
