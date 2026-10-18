import { defineBoot } from '#q-app'
import axios from 'axios'

// Base URL comes from QCLI_API_URL (set it in .env locally,
// or in Project Settings → Environment Variables on Vercel).
const api = axios.create({
  baseURL: import.meta.env.QCLI_API_URL || '/api',
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

// Example interceptors — adjust to your backend's needs
api.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token')
  // if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default defineBoot(({ app }) => {
  // Options API: this.$axios and this.$api
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

// Composition API / stores: import { api } from '@/boot/axios'
export { api }
