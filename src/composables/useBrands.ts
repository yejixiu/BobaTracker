import { ref } from 'vue'
import { apiFetch } from './api'
import type { Brand } from '../types'

const brands = ref<Brand[]>([])
let loaded = false

async function fetchBrands() {
  brands.value = await apiFetch<Brand[]>('/brands')
  loaded = true
}

export function useBrands() {
  if (!loaded) {
    fetchBrands()
  }

  async function addBrand(name: string, logo?: string) {
    const brand = await apiFetch<Brand>('/brands', {
      method: 'POST',
      body: JSON.stringify({ name, logo }),
    })
    brands.value.push(brand)
    return brand
  }

  async function deleteBrand(id: string) {
    await apiFetch(`/brands/${id}`, { method: 'DELETE' })
    brands.value = brands.value.filter(b => b.id !== id)
  }

  function getBrand(id: string) {
    return brands.value.find(b => b.id === id)
  }

  return { brands, fetchBrands, addBrand, deleteBrand, getBrand }
}
