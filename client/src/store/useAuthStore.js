import { create } from 'zustand'
import {
  clearStoredAuth,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
} from '../utils/authStorage'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (user, token) => {
    setStoredAuth(user, token)
    set({ user, token, isAuthenticated: true })
  },

  logout: () => {
    clearStoredAuth()
    set({ user: null, token: null, isAuthenticated: false })
  },

  hydrate: () => {
    const token = getStoredToken()
    const user = getStoredUser()

    if (token && user) {
      set({ user, token, isAuthenticated: true })
      return
    }

    clearStoredAuth()
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
