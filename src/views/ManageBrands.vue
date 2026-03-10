<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useBrands } from '../composables/useBrands'
import BrandLogo from '../components/BrandLogo.vue'

const router = useRouter()
const { brands, addBrand, deleteBrand } = useBrands()

const showAdd = ref(false)
const newName = ref('')
const adding = ref(false)

async function onAdd() {
  if (!newName.value.trim()) {
    showToast('请输入品牌名称')
    return
  }
  adding.value = true
  try {
    await addBrand(newName.value.trim())
    newName.value = ''
    showAdd.value = false
    showToast('添加成功')
  } catch (e: any) {
    showToast(e.message || '添加失败')
  } finally {
    adding.value = false
  }
}

async function onDelete(id: string, name: string) {
  try {
    await showConfirmDialog({ title: '确认删除', message: `删除品牌「${name}」？` })
    await deleteBrand(id)
    showToast('已删除')
  } catch { /* cancelled */ }
}
</script>

<template>
  <div class="manage-page">
    <div class="manage-header">
      <van-icon name="arrow-left" class="back-btn" @click="router.back()" />
      <h2 class="manage-title">我的品牌</h2>
      <van-icon name="plus" class="add-btn" @click="showAdd = true" />
    </div>

    <div class="manage-section">
      <div class="manage-section-title">默认品牌</div>
      <div class="brand-list">
        <div v-for="b in brands.filter(x => x.is_default)" :key="b.id" class="brand-row">
          <BrandLogo :logo="b.logo" :size="40" />
          <span class="brand-name">{{ b.name }}</span>
          <van-tag type="primary" plain size="small">默认</van-tag>
        </div>
      </div>
    </div>

    <div class="manage-section" v-if="brands.filter(x => !x.is_default).length">
      <div class="manage-section-title">自定义品牌</div>
      <div class="brand-list">
        <div v-for="b in brands.filter(x => !x.is_default)" :key="b.id" class="brand-row">
          <BrandLogo :logo="b.logo" :size="40" />
          <span class="brand-name">{{ b.name }}</span>
          <van-icon name="delete-o" class="delete-icon" @click="onDelete(b.id, b.name)" />
        </div>
      </div>
    </div>

    <van-popup v-model:show="showAdd" position="bottom" round class="add-popup">
      <div class="add-popup-header">添加品牌</div>
      <van-cell-group inset>
        <van-field v-model="newName" label="名称" placeholder="品牌名称" @keyup.enter="onAdd" />
      </van-cell-group>
      <div class="add-popup-btn">
        <van-button round block type="primary" color="#D4956A" :loading="adding" @click="onAdd">确认添加</van-button>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.manage-page { min-height: 100vh; background: #FBF5F0; }
.manage-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; }
.back-btn, .add-btn { font-size: 20px; color: #5D4037; cursor: pointer; }
.manage-title { font-size: 17px; font-weight: 700; color: #5D4037; margin: 0; }
.manage-section { padding: 0 16px; margin-bottom: 16px; }
.manage-section-title { font-size: 13px; color: #8D6E63; margin-bottom: 8px; font-weight: 500; }
.brand-list { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(212,149,106,0.08); }
.brand-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #F5EDE6; }
.brand-row:last-child { border-bottom: none; }
.brand-name { flex: 1; font-size: 15px; color: #5D4037; font-weight: 500; }
.delete-icon { font-size: 18px; color: #EF4444; cursor: pointer; }
.add-popup { padding: 20px 16px; }
.add-popup-header { font-size: 16px; font-weight: 700; color: #5D4037; text-align: center; margin-bottom: 16px; }
.add-popup-btn { padding: 16px 0 0; }
</style>
