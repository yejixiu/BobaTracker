import { computed } from 'vue'
import type { MilkTeaRecord } from '../types'
import { useStorage } from './useStorage'
import { apiFetch } from './api'

export function useRecords() {
  const { records, refresh, loading } = useStorage()

  async function addRecord(record: MilkTeaRecord) {
    await apiFetch('/records', {
      method: 'POST',
      body: JSON.stringify(record),
    })
    records.value.unshift(record)
  }

  async function updateRecord(id: string, data: Partial<MilkTeaRecord>) {
    await apiFetch(`/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    const idx = records.value.findIndex(r => r.id === id)
    if (idx !== -1) records.value[idx] = { ...records.value[idx], ...data }
  }

  async function deleteRecord(id: string) {
    await apiFetch(`/records/${id}`, { method: 'DELETE' })
    const idx = records.value.findIndex(r => r.id === id)
    if (idx !== -1) records.value.splice(idx, 1)
  }

  function getRecord(id: string) {
    return records.value.find(r => r.id === id)
  }

  function getRecordsByMonth(year: number, month: number) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return computed(() =>
      records.value
        .filter(r => r.date.startsWith(prefix))
        .sort((a, b) => b.createdAt - a.createdAt)
    )
  }

  return { records, addRecord, updateRecord, deleteRecord, getRecord, getRecordsByMonth, refresh, loading }
}
