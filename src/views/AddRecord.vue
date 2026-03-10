<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, showToast, showConfirmDialog } from 'vant'
import type { UploaderFileListItem } from 'vant'
import type { MilkTeaRecord } from '../types'
import { TEMPERATURE_OPTIONS } from '../constants'
import { useRecords } from '../composables/useRecords'
import { useBrands } from '../composables/useBrands'
import { useCustomOptions } from '../composables/useCustomOptions'
import { useFieldSettings } from '../composables/useFieldSettings'
import BrandLogo from '../components/BrandLogo.vue'

const route = useRoute()
const router = useRouter()
const { addRecord, getRecord, updateRecord, deleteRecord, loading } = useRecords()
const { brands } = useBrands()
const { sweetnessOptions, toppingOptions } = useCustomOptions()
const { fieldConfig } = useFieldSettings()

const editId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!editId.value)

const showDatePicker = ref(false)
const showBrandPicker = ref(false)

const form = ref({
  date: formatDate(new Date()),
  name: '',
  price: '',
  brandId: '' as string,
  shop: '',
  sweetness: '',
  temperature: '',
  toppings: [] as string[],
  rating: 0,
  notes: '',
})
const fileList = ref<UploaderFileListItem[]>([])
const photoBase64 = ref<string | undefined>()

const visibleFields = computed(() =>
  [...fieldConfig.value]
    .filter(f => f.visible)
    .sort((a, b) => a.order - b.order)
)

const selectedBrand = computed(() => brands.value.find(b => b.id === form.value.brandId))

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const datePickerValue = computed(() => form.value.date.split('-'))
const dateDisplay = computed(() => {
  const [y, m, d] = form.value.date.split('-')
  return `${y}年${m}月${d}日`
})

function onDateConfirm({ selectedValues }: { selectedValues: string[] }) {
  form.value.date = selectedValues.join('-')
  showDatePicker.value = false
}

function selectBrand(id: string) {
  form.value.brandId = id
  const brand = brands.value.find(b => b.id === id)
  if (brand) form.value.shop = brand.name
  showBrandPicker.value = false
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxW = 800
        let w = img.width, h = img.height
        if (w > maxW) { h = (h * maxW) / w; w = maxW }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.6))
      }
      img.onerror = reject
      img.src = e.target!.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function onAfterRead(item: UploaderFileListItem | UploaderFileListItem[]) {
  const file = Array.isArray(item) ? item[0] : item
  if (!file.file) return
  try {
    photoBase64.value = await compressImage(file.file)
    fileList.value = [{ url: photoBase64.value, isImage: true }]
  } catch {
    showToast('图片处理失败')
  }
}

function onDeletePhoto() {
  photoBase64.value = undefined
  fileList.value = []
  return true
}

async function onSubmit() {
  // Validate required fields
  const requiredFields = fieldConfig.value.filter(f => f.required && f.visible)
  for (const f of requiredFields) {
    if (f.key === 'brand' && !form.value.brandId) {
      showToast('请选择奶茶品牌'); return
    }
    if (f.key === 'name' && !form.value.name.trim()) {
      showToast('请输入奶茶名称'); return
    }
    if (f.key === 'price') {
      const price = parseFloat(form.value.price)
      if (isNaN(price) || price < 0) {
        showToast('请输入有效价格'); return
      }
    }
  }

  const price = parseFloat(form.value.price) || 0

  const data: any = {
    date: form.value.date,
    name: form.value.name.trim(),
    price,
    shop: form.value.shop.trim(),
    brandId: form.value.brandId || null,
    sweetness: form.value.sweetness,
    temperature: form.value.temperature,
    toppings: [...form.value.toppings],
    rating: form.value.rating,
    notes: form.value.notes.trim(),
    photo: photoBase64.value,
  }

  try {
    if (isEdit.value) {
      await updateRecord(editId.value!, data)
      showToast('已更新')
    } else {
      await addRecord({ ...data, id: crypto.randomUUID(), createdAt: Date.now() })
      showToast('已添加')
    }
    router.back()
  } catch {
    showDialog({ title: '操作失败', message: '请检查网络连接后重试' })
  }
}

async function onDelete() {
  try {
    await showConfirmDialog({ title: '确认删除', message: '删除后无法恢复' })
    await deleteRecord(editId.value!)
    showToast('已删除')
    router.back()
  } catch { /* cancelled */ }
}

onMounted(async () => {
  if (loading) await loading
  if (editId.value) {
    const record = getRecord(editId.value)
    if (record) {
      form.value.date = record.date
      form.value.name = record.name
      form.value.price = String(record.price)
      form.value.shop = record.shop
      form.value.brandId = record.brandId || ''
      form.value.sweetness = record.sweetness
      form.value.temperature = record.temperature
      form.value.toppings = [...record.toppings]
      form.value.rating = record.rating
      form.value.notes = record.notes
      if (record.photo) {
        photoBase64.value = record.photo
        fileList.value = [{ url: record.photo, isImage: true }]
      }
    }
  }
})
</script>

<template>
  <div class="add-page">
    <div class="add-header">
      <van-icon name="arrow-left" class="back-btn" @click="router.back()" />
      <h2 class="add-title">{{ isEdit ? '编辑记录' : '添加记录' }}</h2>
      <div style="width:24px"></div>
    </div>

    <!-- Date picker always visible -->
    <van-cell-group inset class="form-group">
      <van-field
        v-model="dateDisplay"
        label="日期"
        placeholder="选择日期"
        readonly
        is-link
        @click="showDatePicker = true"
      />
    </van-cell-group>

    <!-- Dynamic fields based on fieldConfig -->
    <van-cell-group inset class="form-group" v-for="field in visibleFields" :key="field.key">
      <!-- Brand -->
      <template v-if="field.key === 'brand'">
        <van-field
          :model-value="selectedBrand?.name || ''"
          label="品牌"
          placeholder="选择奶茶品牌"
          readonly
          is-link
          :required="field.required"
          @click="showBrandPicker = true"
        >
          <template #left-icon>
            <BrandLogo v-if="selectedBrand" :logo="selectedBrand.logo" :size="24" style="margin-right:6px" />
          </template>
        </van-field>
      </template>

      <!-- Name -->
      <template v-if="field.key === 'name'">
        <van-field v-model="form.name" label="名称" placeholder="奶茶名称" :required="field.required" />
      </template>

      <!-- Price -->
      <template v-if="field.key === 'price'">
        <van-field v-model="form.price" label="价格" placeholder="0.00" type="digit" :required="field.required">
          <template #button>元</template>
        </van-field>
      </template>

      <!-- Temperature -->
      <template v-if="field.key === 'temperature'">
        <div class="option-section">
          <div class="option-label">温度</div>
          <van-radio-group v-model="form.temperature" direction="horizontal" class="option-group">
            <van-radio v-for="t in TEMPERATURE_OPTIONS" :key="t" :name="t" shape="dot">{{ t }}</van-radio>
          </van-radio-group>
        </div>
      </template>

      <!-- Sweetness -->
      <template v-if="field.key === 'sweetness'">
        <div class="option-section">
          <div class="option-label">甜度</div>
          <van-radio-group v-model="form.sweetness" direction="horizontal" class="option-group">
            <van-radio v-for="s in sweetnessOptions" :key="s" :name="s" shape="dot">{{ s }}</van-radio>
          </van-radio-group>
        </div>
      </template>

      <!-- Toppings -->
      <template v-if="field.key === 'toppings'">
        <div class="option-section">
          <div class="option-label">小料</div>
          <van-checkbox-group v-model="form.toppings" direction="horizontal" class="option-group">
            <van-checkbox v-for="t in toppingOptions" :key="t" :name="t" shape="square">{{ t }}</van-checkbox>
          </van-checkbox-group>
        </div>
      </template>

      <!-- Rating -->
      <template v-if="field.key === 'rating'">
        <div class="option-section">
          <div class="option-label">评分</div>
          <van-rate v-model="form.rating" color="#D4956A" void-color="#F0E0D0" allow-half />
        </div>
      </template>

      <!-- Photo -->
      <template v-if="field.key === 'photo'">
        <div class="option-section">
          <div class="option-label">照片</div>
          <van-uploader
            v-model="fileList"
            :max-count="1"
            :after-read="onAfterRead"
            :before-delete="onDeletePhoto"
            accept="image/*"
          />
        </div>
      </template>

      <!-- Notes -->
      <template v-if="field.key === 'notes'">
        <van-field v-model="form.notes" label="评价" type="textarea" rows="2" placeholder="口感、心情..." />
      </template>
    </van-cell-group>

    <!-- Buttons -->
    <div class="btn-row">
      <van-button type="primary" block round @click="onSubmit" color="#D4956A">
        {{ isEdit ? '保存修改' : '添加记录' }}
      </van-button>
      <van-button v-if="isEdit" type="danger" block round plain @click="onDelete">
        删除
      </van-button>
    </div>

    <!-- Date Picker Popup -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-date-picker
        :model-value="datePickerValue"
        title="选择日期"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <!-- Brand Picker Popup -->
    <van-popup v-model:show="showBrandPicker" position="bottom" round class="brand-popup">
      <div class="brand-popup-header">
        <span class="brand-popup-title">选择品牌</span>
        <van-icon name="cross" @click="showBrandPicker = false" />
      </div>
      <div class="brand-grid">
        <div
          v-for="brand in brands"
          :key="brand.id"
          class="brand-item"
          :class="{ active: form.brandId === brand.id }"
          @click="selectBrand(brand.id)"
        >
          <BrandLogo :logo="brand.logo" :size="48" />
          <span class="brand-item-name">{{ brand.name }}</span>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.add-page {
  min-height: 100vh;
  background: #FBF5F0;
  padding: 0 0 100px;
}

.add-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.back-btn {
  font-size: 20px;
  color: #5D4037;
  cursor: pointer;
}

.add-title {
  font-size: 17px;
  font-weight: 700;
  color: #5D4037;
  margin: 0;
}

.form-group {
  margin-bottom: 0;
}

.option-section {
  padding: 12px 16px;
}

.option-label {
  font-size: 14px;
  color: #5D4037;
  margin-bottom: 8px;
  font-weight: 500;
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-row {
  padding: 20px 16px;
  display: flex;
  gap: 12px;
}

.brand-popup {
  max-height: 60vh;
  padding: 16px;
}

.brand-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.brand-popup-title {
  font-size: 16px;
  font-weight: 700;
  color: #5D4037;
}

.brand-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-height: 50vh;
  overflow-y: auto;
  padding-bottom: 16px;
}

.brand-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.brand-item:active,
.brand-item.active {
  background: #FFF0E0;
}

.brand-item-name {
  font-size: 11px;
  color: #5D4037;
  text-align: center;
  line-height: 1.2;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
