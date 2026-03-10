<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '../composables/api'
import type { MilkTeaRecord } from '../types'
import BrandLogo from '../components/BrandLogo.vue'

const route = useRoute()
const router = useRouter()
const brandId = route.params.id as string

const brand = ref<{ id: string; name: string; logo?: string } | null>(null)
const records = ref<MilkTeaRecord[]>([])
const stats = ref({ count: 0, totalSpent: 0, avgRating: 0 })
const loading = ref(true)

onMounted(async () => {
  try {
    // Fetch brand stats
    const allBrandStats = await apiFetch<any[]>('/records/stats/brands')
    const bs = allBrandStats.find((b: any) => b.id === brandId)
    if (bs) {
      brand.value = { id: bs.id, name: bs.name, logo: bs.logo }
      stats.value = { count: bs.count, totalSpent: bs.totalSpent, avgRating: bs.avgRating }
    }
    // Fetch records for this brand
    const allRecords = await apiFetch<MilkTeaRecord[]>('/records')
    records.value = allRecords.filter(r => r.brandId === brandId || r.brand_name === bs?.name)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function formatPrice(p: number) { return '¥' + Number(p).toFixed(1) }
</script>

<template>
  <div class="brand-detail-page">
    <div class="detail-header">
      <van-icon name="arrow-left" class="back-btn" @click="router.back()" />
      <h2 class="detail-title">品牌详情</h2>
      <div style="width:20px"></div>
    </div>

    <div v-if="loading" class="loading-state"><van-loading color="#D4956A" /></div>

    <template v-else-if="brand">
      <!-- Brand info card -->
      <div class="brand-card">
        <BrandLogo :logo="brand.logo" :size="64" />
        <div class="brand-card-info">
          <div class="brand-card-name">{{ brand.name }}</div>
          <div class="brand-card-stats">
            共 {{ stats.count }} 杯 · {{ formatPrice(stats.totalSpent) }}
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-item">
          <div class="stat-value">{{ stats.count }}</div>
          <div class="stat-label">总杯数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ formatPrice(stats.totalSpent) }}</div>
          <div class="stat-label">总花费</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ stats.avgRating ? Number(stats.avgRating).toFixed(1) : '-' }}</div>
          <div class="stat-label">平均评分</div>
        </div>
      </div>

      <!-- Records list -->
      <div class="section-title">喝过的记录</div>
      <div class="record-list">
        <div
          v-for="r in records"
          :key="r.id"
          class="record-item"
          @click="router.push(`/edit/${r.id}`)"
        >
          <div class="record-left">
            <div class="record-name">{{ r.name }}</div>
            <div class="record-meta">{{ r.date }} · {{ r.sweetness || '' }} {{ r.temperature || '' }}</div>
          </div>
          <div class="record-right">
            <div class="record-price">{{ formatPrice(r.price) }}</div>
            <van-rate v-if="r.rating" :model-value="r.rating" readonly size="10" color="#D4956A" void-color="#F0E0D0" />
          </div>
        </div>
      </div>
    </template>

    <van-empty v-else description="品牌不存在" />
  </div>
</template>

<style scoped>
.brand-detail-page { min-height: 100vh; background: #FBF5F0; padding-bottom: 40px; }
.detail-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; }
.back-btn { font-size: 20px; color: #5D4037; cursor: pointer; }
.detail-title { font-size: 17px; font-weight: 700; color: #5D4037; margin: 0; }
.loading-state { text-align: center; padding: 60px 0; }

.brand-card {
  display: flex; align-items: center; gap: 16px;
  background: white; border-radius: 20px; padding: 20px;
  margin: 0 16px; box-shadow: 0 2px 12px rgba(212,149,106,0.1);
}
.brand-card-name { font-size: 20px; font-weight: 700; color: #5D4037; }
.brand-card-stats { font-size: 13px; color: #8D6E63; margin-top: 4px; }

.stats-row {
  display: flex; gap: 10px; padding: 16px;
}
.stat-item {
  flex: 1; background: white; border-radius: 14px; padding: 14px 8px;
  text-align: center; box-shadow: 0 2px 12px rgba(212,149,106,0.08);
}
.stat-value { font-size: 18px; font-weight: 700; color: #D4956A; }
.stat-label { font-size: 12px; color: #8D6E63; margin-top: 4px; }

.section-title { font-size: 15px; font-weight: 700; color: #5D4037; padding: 8px 16px; }

.record-list { padding: 0 16px; display: flex; flex-direction: column; gap: 8px; }
.record-item {
  display: flex; align-items: center; justify-content: space-between;
  background: white; border-radius: 14px; padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(212,149,106,0.06); cursor: pointer;
}
.record-item:active { background: #FBF5F0; }
.record-name { font-size: 14px; font-weight: 600; color: #5D4037; }
.record-meta { font-size: 12px; color: #BCAAA4; margin-top: 2px; }
.record-right { text-align: right; }
.record-price { font-size: 15px; font-weight: 700; color: #D4956A; margin-bottom: 2px; }
</style>
