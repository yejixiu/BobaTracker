<script setup lang="ts">
defineProps<{ year: number; month: number }>()
defineEmits<{ (e: 'prev'): void; (e: 'next'): void }>()
</script>

<template>
  <div class="flex items-center justify-between px-4 py-3">
    <van-icon name="arrow-left" size="20" class="text-tea-800 cursor-pointer" @click="$emit('prev')" />
    <span class="text-base font-bold text-tea-900">{{ year }}年{{ month }}月</span>
    <van-icon name="arrow" size="20" class="text-tea-800 cursor-pointer" @click="$emit('next')" />
  </div>
</template>
