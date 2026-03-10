import { ref, computed } from 'vue'
import { apiFetch } from './api'
import { SWEETNESS_OPTIONS, TOPPING_OPTIONS } from '../constants'
import type { UserSweetness, UserTopping } from '../types'

const customSweetness = ref<UserSweetness[]>([])
const customToppings = ref<UserTopping[]>([])
let sweetnessLoaded = false
let toppingsLoaded = false

async function fetchSweetness() {
  customSweetness.value = await apiFetch<UserSweetness[]>('/sweetness')
  sweetnessLoaded = true
}

async function fetchToppings() {
  customToppings.value = await apiFetch<UserTopping[]>('/toppings')
  toppingsLoaded = true
}

export function useCustomOptions() {
  if (!sweetnessLoaded) fetchSweetness()
  if (!toppingsLoaded) fetchToppings()

  const sweetnessOptions = computed(() => [
    ...SWEETNESS_OPTIONS,
    ...customSweetness.value.map(s => s.label),
  ])

  const toppingOptions = computed(() => [
    ...TOPPING_OPTIONS,
    ...customToppings.value.map(t => t.label),
  ])

  async function addSweetness(label: string) {
    const item = await apiFetch<UserSweetness>('/sweetness', {
      method: 'POST',
      body: JSON.stringify({ label, sort_order: customSweetness.value.length }),
    })
    customSweetness.value.push(item)
    return item
  }

  async function deleteSweetness(id: string) {
    await apiFetch(`/sweetness/${id}`, { method: 'DELETE' })
    customSweetness.value = customSweetness.value.filter(s => s.id !== id)
  }

  async function addTopping(label: string) {
    const item = await apiFetch<UserTopping>('/toppings', {
      method: 'POST',
      body: JSON.stringify({ label, sort_order: customToppings.value.length }),
    })
    customToppings.value.push(item)
    return item
  }

  async function deleteTopping(id: string) {
    await apiFetch(`/toppings/${id}`, { method: 'DELETE' })
    customToppings.value = customToppings.value.filter(t => t.id !== id)
  }

  return {
    sweetnessOptions,
    toppingOptions,
    customSweetness,
    customToppings,
    addSweetness,
    deleteSweetness,
    addTopping,
    deleteTopping,
    refreshSweetness: fetchSweetness,
    refreshToppings: fetchToppings,
  }
}
