import { ref } from 'vue'
import { apiFetch } from './api'
import type { FieldConfig } from '../types'

const DEFAULT_FIELD_CONFIG: FieldConfig[] = [
  { key: 'brand', label: '奶茶品牌', visible: true, required: true, order: 0 },
  { key: 'name', label: '奶茶名称', visible: true, required: true, order: 1 },
  { key: 'price', label: '奶茶金额', visible: true, required: true, order: 2 },
  { key: 'temperature', label: '奶茶温度', visible: true, required: false, order: 3 },
  { key: 'sweetness', label: '奶茶甜度', visible: true, required: false, order: 4 },
  { key: 'toppings', label: '奶茶小料', visible: true, required: false, order: 5 },
  { key: 'rating', label: '奶茶评分', visible: true, required: false, order: 6 },
  { key: 'notes', label: '奶茶评价', visible: true, required: false, order: 7 },
  { key: 'photo', label: '奶茶照片', visible: true, required: false, order: 8 },
]

const fieldConfig = ref<FieldConfig[]>([...DEFAULT_FIELD_CONFIG])
let loaded = false

async function fetchSettings() {
  try {
    const res = await apiFetch<{ field_config: FieldConfig[] }>('/settings')
    fieldConfig.value = res.field_config || DEFAULT_FIELD_CONFIG
  } catch {
    fieldConfig.value = [...DEFAULT_FIELD_CONFIG]
  }
  loaded = true
}

export function useFieldSettings() {
  if (!loaded) fetchSettings()

  async function saveFieldConfig(config: FieldConfig[]) {
    await apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify({ field_config: config }),
    })
    fieldConfig.value = config
  }

  return { fieldConfig, saveFieldConfig, refreshSettings: fetchSettings, DEFAULT_FIELD_CONFIG }
}
