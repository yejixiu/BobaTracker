<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiFetch } from '../composables/api'
import { useAuth } from '../composables/useAuth'
import type { HomeSummary, MilkTeaRecord } from '../types'
import StatsCard from '../components/StatsCard.vue'
import BrandLogo from '../components/BrandLogo.vue'
import FloatingAddButton from '../components/FloatingAddButton.vue'

const { user } = useAuth()
const summary = ref<HomeSummary>({ totalCups: 0, totalSpent: 0, totalDays: 0, todayRecords: [] })
const loading = ref(true)

onMounted(async () => {
  try {
    summary.value = await apiFetch<HomeSummary>('/records/stats/summary')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function formatPrice(price: number) {
  return '¥' + Number(price).toFixed(1)
}
</script>

<template>
  <div class="home-page">
    <!-- Header -->
    <div class="home-header">
      <div class="home-greeting">
        <div class="home-avatar">
          <img v-if="user?.avatar" :src="user.avatar" alt="" />
          <span v-else>{{ (user?.nickname || user?.username || '?')[0] }}</span>
        </div>
        <div>
          <div class="home-hello">Hi, {{ user?.nickname || user?.username || '奶茶爱好者' }}</div>
          <div class="home-date">今天也要来一杯吗？</div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-row">
      <StatsCard label="喝茶天数" :value="summary.totalDays" icon="calendar-o" />
      <StatsCard label="总杯数" :value="summary.totalCups" icon="fire-o" color="#E8A87C" />
      <StatsCard label="总花费" :value="formatPrice(summary.totalSpent)" icon="gold-coin-o" color="#8D6E63" />
    </div>

    <!-- Today's Records -->
    <div class="section">
      <div class="section-title">今日奶茶</div>
      <div v-if="loading" class="loading-state">
        <van-loading color="#D4956A" />
      </div>
      <div v-else-if="summary.todayRecords.length === 0" class="empty-today">
        <div class="empty-today-icon">🧋</div>
        <div class="empty-today-text">今天还没有喝奶茶哦</div>
      </div>
      <div v-else class="today-list">
        <div
          v-for="record in summary.todayRecords"
          :key="record.id"
          class="today-card"
        >
          <BrandLogo :logo="record.brand_logo" :size="44" :rating="record.rating" />
          <div class="today-card-info">
            <div class="today-card-name">{{ record.name }}</div>
            <div class="today-card-brand">{{ record.brand_name || record.shop || '未知品牌' }}</div>
          </div>
          <div class="today-card-price">{{ formatPrice(record.price) }}</div>
        </div>
      </div>
    </div>

    <FloatingAddButton />
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #FBF5F0;
  padding: 0 16px 80px;
}

.home-header {
  padding: 24px 0 16px;
}

.home-greeting {
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D4956A, #E8A87C);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 600;
  overflow: hidden;
}

.home-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-hello {
  font-size: 18px;
  font-weight: 700;
  color: #5D4037;
}

.home-date {
  font-size: 13px;
  color: #8D6E63;
  margin-top: 2px;
}

.stats-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #5D4037;
  margin-bottom: 12px;
}

.loading-state {
  text-align: center;
  padding: 40px 0;
}

.empty-today {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(212, 149, 106, 0.08);
}

.empty-today-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.empty-today-text {
  font-size: 14px;
  color: #8D6E63;
}

.today-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.today-card {
  background: white;
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 12px rgba(212, 149, 106, 0.08);
}

.today-card-info {
  flex: 1;
  min-width: 0;
}

.today-card-name {
  font-size: 15px;
  font-weight: 600;
  color: #5D4037;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.today-card-brand {
  font-size: 12px;
  color: #8D6E63;
  margin-top: 2px;
}

.today-card-price {
  font-size: 16px;
  font-weight: 700;
  color: #D4956A;
  white-space: nowrap;
}
</style>
