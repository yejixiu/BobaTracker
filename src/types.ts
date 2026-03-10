export interface User {
  id: string
  username: string
  nickname: string
  avatar?: string | null
}

export interface Brand {
  id: string
  name: string
  logo?: string | null
  is_default: number
  user_id?: string | null
}

export interface UserSweetness {
  id: string
  label: string
  sort_order: number
}

export interface UserTopping {
  id: string
  label: string
  sort_order: number
}

export interface FieldConfig {
  key: string
  label: string
  visible: boolean
  required: boolean
  order: number
}

export interface MilkTeaRecord {
  id: string
  date: string            // 'YYYY-MM-DD'
  name: string
  price: number
  shop: string
  brandId?: string | null
  brand_name?: string
  brand_logo?: string
  sweetness: string
  temperature: string
  toppings: string[]
  rating: number          // 0-5, 0 means no rating
  notes: string
  photo?: string          // base64 data URL
  createdAt: number
}

export interface CalendarRecord {
  date: string
  id: string
  name: string
  price: number
  rating: number
  brand_name?: string
  brand_logo?: string
}

export interface BrandStats {
  id: string
  name: string
  logo?: string
  count: number
  totalSpent: number
  avgRating: number
}

export interface HomeSummary {
  totalCups: number
  totalSpent: number
  totalDays: number
  todayRecords: MilkTeaRecord[]
}
