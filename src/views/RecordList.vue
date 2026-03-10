<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import MonthPicker from '../components/MonthPicker.vue'
import RecordCard from '../components/RecordCard.vue'
import { useRecords } from '../composables/useRecords'

const router = useRouter()
const { records } = useRecords()

const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth() + 1)

function prev() {
  if (month.value === 1) { year.value--; month.value = 12 }
  else month.value--
}
function next() {
  if (month.value === 12) { year.value++; month.value = 1 }
  else month.value++
}

const filtered = computed(() => {
  const prefix = `${year.value}-${String(month.value).padStart(2, '0')}`
  return records.value
    .filter(r => r.date.startsWith(prefix))
    .sort((a, b) => b.createdAt - a.createdAt)
})

const monthTotal = computed(() =>
  filtered.value.reduce((sum, r) => sum + r.price, 0).toFixed(1)
)

function goEdit(id: string) {
  router.push(`/edit/${id}`)
}
</script>

<template>
  <div>
    <MonthPicker :year="year" :month="month" @prev="prev" @next="next" />

    <div v-if="filtered.length" class="px-4">
      <div class="text-xs text-tea-800/60 mb-2">
        本月 {{ filtered.length }} 杯，共 ¥{{ monthTotal }}
      </div>
      <RecordCard
        v-for="r in filtered"
        :key="r.id"
        :record="r"
        @click="goEdit(r.id)"
      />
    </div>

    <van-empty v-else description="这个月还没有喝奶茶哦~" image="search" />
  </div>
</template>
