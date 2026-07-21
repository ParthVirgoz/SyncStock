import axios from 'axios'
import { getStoredToken } from '../utils/authStorage'
import { useAuthStore } from '../store/useAuthStore'

const PUBLIC_PATHS = ['/health', '/auth/login']

function getRequestPath(url = '') {
  if (url.includes('://')) {
    return new URL(url).pathname
  }

  return url.split('?')[0]
}

function isPublicRequest(url = '') {
  const path = getRequestPath(url)
  return PUBLIC_PATHS.some((publicPath) => path === publicPath || path.endsWith(publicPath))
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (!isPublicRequest(config.url)) {
    const token = getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = error.config?.url || ''

    if ((status === 401 || status === 403) && !isPublicRequest(requestUrl)) {
      useAuthStore.getState().logout()

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    const message =
      error.response?.data?.errorMessage ||
      error.message ||
      'Something went wrong'

    return Promise.reject(new Error(message))
  },
)

export default api
