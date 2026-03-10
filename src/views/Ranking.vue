<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRecords } from '../composables/useRecords'
import BrandLogo from '../components/BrandLogo.vue'

const router = useRouter()
const { records } = useRecords()

const activeTab = ref(0)

const redList = computed(() => records.value.filter(r => r.rating >= 4).sort((a, b) => b.rating - a.rating))
const yellowList = computed(() => records.value.filter(r => r.rating === 3))
const blackList = computed(() => records.value.filter(r => r.rating > 0 && r.rating <= 2).sort((a, b) => a.rating - b.rating))

function currentList() {
  if (activeTab.value === 0) return redList.value
  if (activeTab.value === 1) return yellowList.value
  return blackList.value
}

function getBorderColor(tab: number) {
  if (tab === 0) return '#EF4444'
  if (tab === 1) return '#F59E0B'
  return '#374151'
}

function formatPrice(price: number) {
  return '¥' + Number(price).toFixed(1)
}
</script>

<template>
  <div class="ranking-page">
    <div class="ranking-header">
      <van-icon name="arrow-left" class="back-btn" @click="router.back()" />
      <h2 class="ranking-title">红黄黑榜</h2>
      <div style="width:20px"></div>
    </div>

    <van-tabs v-model:active="activeTab" shrink animated color="#D4956A" title-active-color="#D4956A">
      <van-tab title="红榜" />
      <van-tab title="黄榜" />
      <van-tab title="黑榜" />
    </van-tabs>

    <div class="ranking-list" v-if="currentList().length">
      <div
        v-for="r in currentList()"
        :key="r.id"
        class="ranking-card"
        :style="{ borderLeftColor: getBorderColor(activeTab) }"
        @click="router.push(`/edit/${r.id}`)"
      >
        <BrandLogo :logo="r.brand_logo" :size="44" :rating="r.rating" />
        <div class="ranking-info">
          <div class="ranking-name">{{ r.name }}</div>
          <div class="ranking-brand">{{ r.brand_name || r.shop || '未知品牌' }}</div>
          <div class="ranking-date">{{ r.date }}</div>
        </div>
        <div class="ranking-right">
          <van-rate :model-value="r.rating" readonly size="12" color="#D4956A" void-color="#F0E0D0" />
          <div class="ranking-price">{{ formatPrice(r.price) }}</div>
        </div>
      </div>
    </div>
    <van-empty v-else description="暂无记录" image="search" />
  </div>
</template>

<style scoped>
.ranking-page { min-height: 100vh; background: #FBF5F0; padding-bottom: 40px; }
.ranking-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; }
.back-btn { font-size: 20px; color: #5D4037; cursor: pointer; }
.ranking-title { font-size: 17px; font-weight: 700; color: #5D4037; margin: 0; }

.ranking-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.ranking-card {
  display: flex; align-items: center; gap: 12px;
  background: white; border-radius: 16px; padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(212,149,106,0.08);
  border-left: 4px solid transparent; cursor: pointer;
}
.ranking-card:active { background: #FBF5F0; }
.ranking-info { flex: 1; min-width: 0; }
.ranking-name { font-size: 15px; font-weight: 600; color: #5D4037; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ranking-brand { font-size: 12px; color: #8D6E63; margin-top: 2px; }
.ranking-date { font-size: 11px; color: #BCAAA4; margin-top: 2px; }
.ranking-right { text-align: right; }
.ranking-price { font-size: 14px; font-weight: 700; color: #D4956A; margin-top: 4px; }
</style>
