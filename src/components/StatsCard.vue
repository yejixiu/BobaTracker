<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string | number
  icon: string
  color?: string
}>()
</script>

<template>
  <div class="stats-card" :style="{ '--card-color': color || '#D4956A' }">
    <van-icon :name="icon" class="stats-card-icon" />
    <div class="stats-card-value">{{ value }}</div>
    <div class="stats-card-label">{{ label }}</div>
  </div>
</template>

<style scoped>
.stats-card {
  background: white;
  border-radius: 16px;
  padding: 16px 12px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(212, 149, 106, 0.1);
  flex: 1;
  min-width: 0;
}

.stats-card-icon {
  font-size: 24px;
  color: var(--card-color);
  margin-bottom: 8px;
}

.stats-card-value {
  font-size: 22px;
  font-weight: 700;
  color: #5D4037;
  line-height: 1.2;
}

.stats-card-label {
  font-size: 12px;
  color: #8D6E63;
  margin-top: 4px;
}
</style>
