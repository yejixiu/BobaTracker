import { ref } from 'vue'
import type { MilkTeaRecord } from '../types'
import { apiFetch } from './api'

const records = ref<MilkTeaRecord[]>([])
let loaded = false
let loading: Promise<void> | null = null

async function fetchAll() {
  records.value = await apiFetch<MilkTeaRecord[]>('/records')
  loaded = true
}

export function useStorage() {
  if (!loaded && !loading) {
    loading = fetchAll().finally(() => { loading = null })
  }

  return { records, refresh: fetchAll, loading }
}
