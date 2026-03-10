<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend,
} from 'chart.js'
import { apiFetch } from '../composables/api'
import { useRecords } from '../composables/useRecords'
import BrandLogo from '../components/BrandLogo.vue'
import type { BrandStats } from '../types'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const router = useRouter()
const { records } = useRecords()

// Period selector
const periodTab = ref(0) // 0=月, 1=年, 2=自定义
const now = new Date()
const selYear = ref(now.getFullYear())
const selMonth = ref(now.getMonth() + 1)
const customStart = ref('')
const customEnd = ref('')
const showStartPicker = ref(false)
const showEndPicker = ref(false)

const periodStats = ref<any>(null)
const brandStats = ref<BrandStats[]>([])
const loading = ref(false)

function getDateRange() {
  if (periodTab.value === 0) {
    const m = String(selMonth.value).padStart(2, '0')
    const lastDay = new Date(selYear.value, selMonth.value, 0).getDate()
    return { start: `${selYear.value}-${m}-01`, end: `${selYear.value}-${m}-${lastDay}` }
  } else if (periodTab.value === 1) {
    return { start: `${selYear.value}-01-01`, end: `${selYear.value}-12-31` }
  } else {
    return { start: customStart.value || `${selYear.value}-01-01`, end: customEnd.value || `${selYear.value}-12-31` }
  }
}

async function fetchStats() {
  loading.value = true
  try {
    const { start, end } = getDateRange()
    periodStats.value = await apiFetch(`/records/stats/period?start=${start}&end=${end}`)
    brandStats.value = await apiFetch<BrandStats[]>('/records/stats/brands')
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

watch([periodTab, selYear, selMonth], fetchStats, { immediate: true })

function prevMonth() {
  if (selMonth.value === 1) { selYear.value--; selMonth.value = 12 }
  else selMonth.value--
}
function nextMonth() {
  if (selMonth.value === 12) { selYear.value++; selMonth.value = 1 }
  else selMonth.value++
}

// Charts
const brandChartData = computed(() => {
  const top = brandStats.value.slice(0, 6)
  return {
    labels: top.map(b => b.name),
    datasets: [{
      data: top.map(b => b.count),
      backgroundColor: ['#D4956A', '#E8A87C', '#F5E6D3', '#8D6E63', '#A1887F', '#BCAAA4'],
    }],
  }
})

const sweetnessChartData = computed(() => {
  if (!periodStats.value?.bySweetness) return { labels: [], datasets: [{ data: [], backgroundColor: [] }] }
  return {
    labels: periodStats.value.bySweetness.map((s: any) => s.sweetness),
    datasets: [{
      data: periodStats.value.bySweetness.map((s: any) => s.count),
      backgroundColor: ['#D4956A', '#E8A87C', '#F5E6D3', '#8D6E63', '#A1887F'],
    }],
  }
})

const doughnutOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 12 } } },
}

function formatPrice(p: number) { return '¥' + Number(p).toFixed(1) }

function onStartConfirm({ selectedValues }: { selectedValues: string[] }) {
  customStart.value = selectedValues.join('-')
  showStartPicker.value = false
  fetchStats()
}
function onEndConfirm({ selectedValues }: { selectedValues: string[] }) {
  customEnd.value = selectedValues.join('-')
  showEndPicker.value = false
  fetchStats()
}
</script>

<template>
  <div class="stats-page">
    <h2 class="stats-title">统计</h2>

    <!-- Period tabs -->
    <van-tabs v-model:active="periodTab" shrink animated color="#D4956A" title-active-color="#D4956A" class="period-tabs">
      <van-tab title="按月" />
      <van-tab title="按年" />
      <van-tab title="自定义" />
    </van-tabs>

    <!-- Month selector -->
    <div v-if="periodTab === 0" class="month-selector">
      <van-icon name="arrow-left" @click="prevMonth" />
      <span>{{ selYear }}年{{ selMonth }}月</span>
      <van-icon name="arrow" @click="nextMonth" />
    </div>

    <!-- Year selector -->
    <div v-if="periodTab === 1" class="month-selector">
      <van-icon name="arrow-left" @click="selYear--" />
      <span>{{ selYear }}年</span>
      <van-icon name="arrow" @click="selYear++" />
    </div>

    <!-- Custom range -->
    <div v-if="periodTab === 2" class="custom-range">
      <van-field :model-value="customStart || '开始日期'" readonly is-link @click="showStartPicker = true" />
      <span class="range-sep">至</span>
      <van-field :model-value="customEnd || '结束日期'" readonly is-link @click="showEndPicker = true" />
    </div>

    <!-- Summary cards -->
    <div v-if="periodStats" class="summary-row">
      <div class="summary-card">
        <div class="summary-val">{{ periodStats.totalCups }}</div>
        <div class="summary-label">杯数</div>
      </div>
      <div class="summary-card">
        <div class="summary-val">{{ formatPrice(periodStats.totalSpent) }}</div>
        <div class="summary-label">花费</div>
      </div>
      <div class="summary-card">
        <div class="summary-val">{{ periodStats.totalDays }}</div>
        <div class="summary-label">天数</div>
      </div>
    </div>

    <!-- Brand stats -->
    <div class="section-card" v-if="brandStats.length">
      <div class="section-card-title">品牌排行</div>
      <Doughnut :data="brandChartData" :options="doughnutOptions" />
      <div class="brand-rank-list">
        <div v-for="b in brandStats" :key="b.id" class="brand-rank-item" @click="router.push(`/stats/brand/${b.id}`)">
          <BrandLogo :logo="b.logo" :size="36" />
          <div class="brand-rank-info">
            <div class="brand-rank-name">{{ b.name }}</div>
            <div class="brand-rank-meta">{{ b.count }}杯 · {{ formatPrice(b.totalSpent) }}</div>
          </div>
          <van-icon name="arrow" class="brand-rank-arrow" />
        </div>
      </div>
    </div>

    <!-- By drink name -->
    <div class="section-card" v-if="periodStats?.byName?.length">
      <div class="section-card-title">奶茶排行</div>
      <div class="name-rank-list">
        <div v-for="(n, idx) in periodStats.byName.slice(0, 10)" :key="n.name" class="name-rank-item">
          <span class="name-rank-idx">{{ idx + 1 }}</span>
          <span class="name-rank-name">{{ n.name }}</span>
          <span class="name-rank-count">{{ n.count }}杯</span>
          <span class="name-rank-price">{{ formatPrice(n.totalSpent) }}</span>
        </div>
      </div>
    </div>

    <!-- Sweetness distribution -->
    <div class="section-card" v-if="periodStats?.bySweetness?.length">
      <div class="section-card-title">甜度分布</div>
      <Doughnut :data="sweetnessChartData" :options="doughnutOptions" />
    </div>

    <van-empty v-if="!loading && !periodStats?.totalCups" description="该时段暂无数据" image="search" />

    <!-- Date pickers -->
    <van-popup v-model:show="showStartPicker" position="bottom" round>
      <van-date-picker title="开始日期" @confirm="onStartConfirm" @cancel="showStartPicker = false" />
    </van-popup>
    <van-popup v-model:show="showEndPicker" position="bottom" round>
      <van-date-picker title="结束日期" @confirm="onEndConfirm" @cancel="showEndPicker = false" />
    </van-popup>
  </div>
</template>

<style scoped>
.stats-page { min-height: 100vh; background: #FBF5F0; padding: 16px 16px 80px; }
.stats-title { font-size: 18px; font-weight: 700; color: #5D4037; margin: 0 0 12px; }
.period-tabs { margin-bottom: 12px; }

.month-selector {
  display: flex; align-items: center; justify-content: center; gap: 20px;
  font-size: 15px; font-weight: 600; color: #5D4037; padding: 8px 0;
}
.month-selector .van-icon { font-size: 16px; color: #8D6E63; cursor: pointer; }

.custom-range { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.range-sep { color: #8D6E63; font-size: 13px; }

.summary-row { display: flex; gap: 10px; margin: 12px 0; }
.summary-card {
  flex: 1; background: white; border-radius: 14px; padding: 14px 8px;
  text-align: center; box-shadow: 0 2px 12px rgba(212,149,106,0.08);
}
.summary-val { font-size: 20px; font-weight: 700; color: #D4956A; }
.summary-label { font-size: 12px; color: #8D6E63; margin-top: 4px; }

.section-card {
  background: white; border-radius: 16px; padding: 16px;
  margin-bottom: 12px; box-shadow: 0 2px 12px rgba(212,149,106,0.08);
}
.section-card-title { font-size: 15px; font-weight: 700; color: #5D4037; margin-bottom: 12px; }

.brand-rank-list { margin-top: 12px; }
.brand-rank-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 0;
  border-bottom: 1px solid #F5EDE6; cursor: pointer;
}
.brand-rank-item:last-child { border-bottom: none; }
.brand-rank-info { flex: 1; }
.brand-rank-name { font-size: 14px; font-weight: 600; color: #5D4037; }
.brand-rank-meta { font-size: 12px; color: #8D6E63; margin-top: 2px; }
.brand-rank-arrow { font-size: 12px; color: #BCAAA4; }

.name-rank-list { }
.name-rank-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 0;
  border-bottom: 1px solid #F5EDE6; font-size: 14px;
}
.name-rank-item:last-child { border-bottom: none; }
.name-rank-idx { width: 20px; font-weight: 700; color: #D4956A; text-align: center; }
.name-rank-name { flex: 1; color: #5D4037; font-weight: 500; }
.name-rank-count { color: #8D6E63; font-size: 13px; }
.name-rank-price { color: #D4956A; font-weight: 600; min-width: 50px; text-align: right; }
</style>
