<script setup lang="ts">
const props = defineProps<{
  logo?: string | null
  size?: number
  rating?: number
}>()

const sizeVal = props.size || 40

function getBorderClass(rating?: number) {
  if (!rating || rating === 0) return ''
  if (rating >= 4) return 'border-red'
  if (rating === 3) return 'border-yellow'
  return 'border-black'
}
</script>

<template>
  <div
    class="brand-logo"
    :class="getBorderClass(rating)"
    :style="{ width: sizeVal + 'px', height: sizeVal + 'px' }"
  >
    <img v-if="logo" :src="logo" alt="" class="brand-logo-img" />
    <span v-else class="brand-logo-fallback">🧋</span>
  </div>
</template>

<style scoped>
.brand-logo {
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFF8F0;
  flex-shrink: 0;
  border: 2px solid transparent;
  box-sizing: border-box;
}

.brand-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-logo-fallback {
  font-size: 60%;
}

.border-red {
  border-color: #EF4444;
  box-shadow: 0 0 0 1px #EF4444;
}

.border-yellow {
  border-color: #F59E0B;
  box-shadow: 0 0 0 1px #F59E0B;
}

.border-black {
  border-color: #374151;
  box-shadow: 0 0 0 1px #374151;
}
</style>
