<script setup lang="ts">
import type { MilkTeaRecord } from '../types'
import BrandLogo from './BrandLogo.vue'

defineProps<{ record: MilkTeaRecord }>()
defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <div class="record-card" @click="$emit('click')">
    <img
      v-if="record.photo"
      :src="record.photo"
      class="record-photo"
      alt="奶茶照片"
    />
    <BrandLogo
      v-else
      :logo="record.brand_logo"
      :size="64"
      :rating="record.rating"
    />
    <div class="record-info">
      <div class="record-top">
        <span class="record-name">{{ record.name }}</span>
        <span class="record-price">¥{{ record.price }}</span>
      </div>
      <div class="record-brand">{{ record.brand_name || record.shop || '未填写品牌' }}</div>
      <div class="record-bottom">
        <span class="record-date">{{ record.date }}</span>
        <van-rate
          v-if="record.rating"
          :model-value="record.rating"
          readonly
          size="12"
          color="#D4956A"
          void-color="#F0E0D0"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.record-card {
  background: white;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 12px rgba(212, 149, 106, 0.08);
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.record-card:active {
  transform: scale(0.98);
}
.record-photo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}
.record-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.record-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.record-name {
  font-size: 15px;
  font-weight: 600;
  color: #5D4037;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.record-price {
  font-size: 14px;
  font-weight: 700;
  color: #D4956A;
  white-space: nowrap;
}
.record-brand {
  font-size: 12px;
  color: #8D6E63;
  margin-top: 2px;
}
.record-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}
.record-date {
  font-size: 11px;
  color: #BCAAA4;
}
</style>
