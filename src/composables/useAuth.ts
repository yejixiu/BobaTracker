import { ref, computed } from 'vue'
import { apiFetch } from './api'
import type { User } from '../types'

const TOKEN_KEY = 'naicha_token'
const USER_KEY = 'naicha_user'

const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
const user = ref<User | null>(JSON.parse(localStorage.getItem(USER_KEY) || 'null'))

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value)

  function setAuth(t: string, u: User) {
    token.value = t
    user.value = u
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  async function login(username: string, password: string) {
    const res = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    setAuth(res.token, res.user)
    return res.user
  }

  async function register(username: string, password: string, nickname?: string) {
    const res = await apiFetch<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, nickname }),
    })
    setAuth(res.token, res.user)
    return res.user
  }

  async function fetchProfile() {
    const u = await apiFetch<User>('/auth/me')
    user.value = u
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    return u
  }

  async function updateProfile(data: { nickname?: string; avatar?: string }) {
    const u = await apiFetch<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    user.value = u
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    return u
  }

  function logout() {
    clearAuth()
  }

  function getToken() {
    return token.value
  }

  return { user, token, isLoggedIn, login, register, logout, fetchProfile, updateProfile, getToken, clearAuth }
}
