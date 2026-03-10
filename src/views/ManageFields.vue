<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useFieldSettings } from '../composables/useFieldSettings'
import type { FieldConfig } from '../types'

const router = useRouter()
const { fieldConfig, saveFieldConfig } = useFieldSettings()

const localConfig = ref<FieldConfig[]>([])
const saving = ref(false)

onMounted(() => {
  localConfig.value = JSON.parse(JSON.stringify(fieldConfig.value))
})

const LOCKED_KEYS = ['brand', 'name', 'price']

function moveUp(idx: number) {
  if (idx <= 0) return
  const arr = localConfig.value
  const temp = arr[idx].order
  arr[idx].order = arr[idx - 1].order
  arr[idx - 1].order = temp
  arr.sort((a, b) => a.order - b.order)
}

function moveDown(idx: number) {
  const arr = localConfig.value
  if (idx >= arr.length - 1) return
  const temp = arr[idx].order
  arr[idx].order = arr[idx + 1].order
  arr[idx + 1].order = temp
  arr.sort((a, b) => a.order - b.order)
}

async function onSave() {
  saving.value = true
  try {
    await saveFieldConfig(localConfig.value)
    showToast('保存成功')
    router.back()
  } catch (e: any) {
    showToast(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="manage-page">
    <div class="manage-header">
      <van-icon name="arrow-left" class="back-btn" @click="router.back()" />
      <h2 class="manage-title">记录设置</h2>
      <div style="width:20px"></div>
    </div>

    <div class="manage-section">
      <div class="manage-section-title">自定义添加记录时显示的字段和顺序</div>
      <div class="field-list">
        <div v-for="(f, idx) in localConfig" :key="f.key" class="field-row">
          <div class="field-info">
            <span class="field-label">{{ f.label }}</span>
            <van-tag v-if="LOCKED_KEYS.includes(f.key)" type="warning" plain size="small">必填</van-tag>
          </div>
          <div class="field-actions">
            <van-icon name="arrow-up" class="move-btn" @click="moveUp(idx)" />
            <van-icon name="arrow-down" class="move-btn" @click="moveDown(idx)" />
            <van-switch
              v-if="!LOCKED_KEYS.includes(f.key)"
              v-model="f.visible"
              size="20px"
              active-color="#D4956A"
            />
            <van-tag v-else type="success" plain size="small">锁定</van-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="save-btn-wrap">
      <van-button round block type="primary" color="#D4956A" :loading="saving" @click="onSave">
        保存设置
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.manage-page { min-height: 100vh; background: #FBF5F0; }
.manage-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; }
.back-btn { font-size: 20px; color: #5D4037; cursor: pointer; }
.manage-title { font-size: 17px; font-weight: 700; color: #5D4037; margin: 0; }
.manage-section { padding: 0 16px; margin-bottom: 16px; }
.manage-section-title { font-size: 13px; color: #8D6E63; margin-bottom: 8px; font-weight: 500; }
.field-list { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(212,149,106,0.08); }
.field-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #F5EDE6; }
.field-row:last-child { border-bottom: none; }
.field-info { display: flex; align-items: center; gap: 8px; }
.field-label { font-size: 15px; color: #5D4037; font-weight: 500; }
.field-actions { display: flex; align-items: center; gap: 10px; }
.move-btn { font-size: 16px; color: #8D6E63; cursor: pointer; }
.save-btn-wrap { padding: 0 16px; }
</style>
