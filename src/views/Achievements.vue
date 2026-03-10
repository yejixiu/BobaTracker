<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBrands } from '../composables/useBrands'
import { useRecords } from '../composables/useRecords'
import BrandLogo from '../components/BrandLogo.vue'

const router = useRouter()
const { brands, fetchBrands } = useBrands()
const { records } = useRecords()

const defaultBrands = computed(() => brands.value.filter(b => b.is_default))

const triedBrandIds = computed(() => {
  const ids = new Set<string>()
  records.value.forEach(r => {
    if (r.brandId) ids.add(r.brandId)
  })
  return ids
})

const unlockedCount = computed(() => {
  return defaultBrands.value.filter(b => triedBrandIds.value.has(b.id)).length
})

onMounted(() => { fetchBrands() })
</script>

<template>
  <div class="achieve-page">
    <div class="achieve-header">
      <van-icon name="arrow-left" class="back-btn" @click="router.back()" />
      <h2 class="achieve-title">成就墙</h2>
      <div style="width:20px"></div>
    </div>

    <div class="achieve-summary">
      已解锁 <span class="highlight">{{ unlockedCount }}</span> / {{ defaultBrands.length }} 个品牌
    </div>

    <div class="achieve-grid">
      <div
        v-for="b in defaultBrands"
        :key="b.id"
        class="achieve-item"
        :class="{ locked: !triedBrandIds.has(b.id) }"
      >
        <BrandLogo :logo="b.logo" :size="56" />
        <span class="achieve-name">{{ b.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.achieve-page { min-height: 100vh; background: #FBF5F0; padding-bottom: 40px; }
.achieve-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; }
.back-btn { font-size: 20px; color: #5D4037; cursor: pointer; }
.achieve-title { font-size: 17px; font-weight: 700; color: #5D4037; margin: 0; }

.achieve-summary {
  text-align: center; font-size: 14px; color: #8D6E63;
  padding: 8px 16px 16px;
}
.highlight { color: #D4956A; font-weight: 700; font-size: 18px; }

.achieve-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; padding: 0 16px;
}
.achieve-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 4px; background: white; border-radius: 16px;
  box-shadow: 0 2px 12px rgba(212,149,106,0.08);
  transition: transform 0.2s;
}
.achieve-item:active { transform: scale(0.96); }
.achieve-item.locked { opacity: 1; }
.achieve-item.locked :deep(.brand-logo) {
  filter: grayscale(1) opacity(0.4);
}
.achieve-name {
  font-size: 11px; color: #5D4037; text-align: center;
  line-height: 1.2; max-width: 100%;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.achieve-item.locked .achieve-name { color: #BCAAA4; }
</style>
