<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../composables/api'
import type { CalendarRecord } from '../types'
import BrandLogo from '../components/BrandLogo.vue'
import FloatingAddButton from '../components/FloatingAddButton.vue'
import MonthPicker from '../components/MonthPicker.vue'

const router = useRouter()
const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)
const records = ref<CalendarRecord[]>([])
const loading = ref(false)
const selectedDate = ref('')
const showDayDetail = ref(false)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

function prev() {
  if (month.value === 1) { year.value--; month.value = 12 }
  else month.value--
}
function next() {
  if (month.value === 12) { year.value++; month.value = 1 }
  else month.value++
}

async function fetchCalendar() {
  loading.value = true
  try {
    records.value = await apiFetch<CalendarRecord[]>(
      `/records/stats/calendar?year=${year.value}&month=${month.value}`
    )
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch([year, month], fetchCalendar, { immediate: true })

// Group records by date
const recordsByDate = computed(() => {
  const map: Record<string, CalendarRecord[]> = {}
  records.value.forEach(r => {
    if (!map[r.date]) map[r.date] = []
    map[r.date].push(r)
  })
  return map
})

// Calendar grid
const calendarDays = computed(() => {
  const firstDay = new Date(year.value, month.value - 1, 1).getDay()
  const daysInMonth = new Date(year.value, month.value, 0).getDate()
  const days: Array<{ day: number; date: string } | null> = []

  // Padding for first week
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year.value}-${String(month.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({ day: d, date })
  }
  return days
})

const selectedDayRecords = computed(() => {
  return recordsByDate.value[selectedDate.value] || []
})

function getBestRating(recs: CalendarRecord[]) {
  const ratings = recs.map(r => r.rating).filter(r => r > 0)
  if (ratings.length === 0) return 0
  return Math.max(...ratings)
}

function onDayClick(date: string) {
  selectedDate.value = date
  if (recordsByDate.value[date]?.length) {
    showDayDetail.value = true
  }
}

function goEdit(id: string) {
  router.push(`/edit/${id}`)
}
</script>

<template>
  <div class="calendar-page">
    <MonthPicker :year="year" :month="month" @prev="prev" @next="next" />

    <!-- Week header -->
    <div class="week-header">
      <div v-for="w in weekDays" :key="w" class="week-cell">{{ w }}</div>
    </div>

    <!-- Calendar grid -->
    <div class="calendar-grid">
      <div
        v-for="(cell, idx) in calendarDays"
        :key="idx"
        class="day-cell"
        :class="{ 'has-record': cell && recordsByDate[cell.date]?.length }"
        @click="cell && onDayClick(cell.date)"
      >
        <template v-if="cell">
          <span class="day-num">{{ cell.day }}</span>
          <div v-if="recordsByDate[cell.date]?.length" class="day-logo">
            <BrandLogo
              :logo="recordsByDate[cell.date][0].brand_logo"
              :size="32"
              :rating="getBestRating(recordsByDate[cell.date])"
            />
            <span v-if="recordsByDate[cell.date].length > 1" class="day-count">
              {{ recordsByDate[cell.date].length }}
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- Day detail popup -->
    <van-popup v-model:show="showDayDetail" position="bottom" round class="day-popup">
      <div class="day-popup-header">
        <span>{{ selectedDate }} 的记录</span>
        <van-icon name="cross" @click="showDayDetail = false" />
      </div>
      <div class="day-popup-list">
        <div
          v-for="r in selectedDayRecords"
          :key="r.id"
          class="day-record-card"
          @click="goEdit(r.id)"
        >
          <BrandLogo :logo="r.brand_logo" :size="40" :rating="r.rating" />
          <div class="day-record-info">
            <div class="day-record-name">{{ r.name }}</div>
            <div class="day-record-brand">{{ r.brand_name || '未知品牌' }}</div>
          </div>
          <div class="day-record-price">¥{{ Number(r.price).toFixed(1) }}</div>
        </div>
      </div>
    </van-popup>

    <FloatingAddButton />
  </div>
</template>

<style scoped>
.calendar-page {
  min-height: 100vh;
  background: #FBF5F0;
  padding-bottom: 80px;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 12px;
}

.week-cell {
  text-align: center;
  font-size: 12px;
  color: #8D6E63;
  font-weight: 500;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 12px;
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  gap: 2px;
}

.day-cell.has-record {
  background: #FFF8F0;
}

.day-num {
  font-size: 12px;
  color: #5D4037;
  font-weight: 500;
}

.day-logo {
  position: relative;
}

.day-count {
  position: absolute;
  top: -4px;
  right: -6px;
  background: #D4956A;
  color: white;
  font-size: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.day-popup {
  max-height: 50vh;
  padding: 16px;
}

.day-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 700;
  color: #5D4037;
  margin-bottom: 16px;
}

.day-popup-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.day-record-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #FBF5F0;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
}

.day-record-info {
  flex: 1;
  min-width: 0;
}

.day-record-name {
  font-size: 15px;
  font-weight: 600;
  color: #5D4037;
}

.day-record-brand {
  font-size: 12px;
  color: #8D6E63;
  margin-top: 2px;
}

.day-record-price {
  font-size: 16px;
  font-weight: 700;
  color: #D4956A;
}
</style>
