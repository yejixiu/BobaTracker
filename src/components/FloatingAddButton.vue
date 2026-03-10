<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="fab" @click="router.push('/add')">
    <van-icon name="plus" />
  </div>
</template>

<style scoped>
.fab {
  position: fixed;
  right: 20px;
  bottom: 76px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D4956A, #E8A87C);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 16px rgba(212, 149, 106, 0.4);
  cursor: pointer;
  z-index: 100;
  transition: transform 0.2s ease;
}

.fab:active {
  transform: scale(0.92);
}
</style>
