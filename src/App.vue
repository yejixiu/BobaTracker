<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabMap: Record<string, number> = {
  '/home': 0,
  '/calendar': 1,
  '/stats': 2,
  '/profile': 3,
}
const pathMap = ['home', 'calendar', 'stats', 'profile']
const active = ref(0)

const noTabRoutes = ['/login', '/register']
const showTabBar = computed(() => !noTabRoutes.includes(route.path))

watch(() => route.path, (path) => {
  if (path.startsWith('/edit') || path === '/add') {
    // Don't change tab for add/edit
  } else if (path.startsWith('/stats')) {
    active.value = 2
  } else if (path.startsWith('/profile')) {
    active.value = 3
  } else {
    active.value = tabMap[path] ?? 0
  }
}, { immediate: true })

function onTabChange(index: number | string) {
  router.push('/' + pathMap[index as number])
}
</script>

<template>
  <div :class="{ 'pb-14': showTabBar }">
    <router-view />
  </div>
  <van-tabbar
    v-if="showTabBar"
    v-model="active"
    @change="onTabChange"
    active-color="#D4956A"
    inactive-color="#8D6E63"
  >
    <van-tabbar-item icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item icon="calendar-o">日历</van-tabbar-item>
    <van-tabbar-item icon="chart-trending-o">统计</van-tabbar-item>
    <van-tabbar-item icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template>
