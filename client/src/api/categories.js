import api from './axios'
import { unwrapData } from './apiHelpers'

export async function getCategories(params = {}) {
  const response = await api.get('/categories', { params })
  return unwrapData(response)
}

export async function createCategory(payload) {
  const response = await api.post('/categories', payload)
  return unwrapData(response)
}

export async function updateCategory(id, payload) {
  const response = await api.put(`/categories/${id}`, payload)
  return unwrapData(response)
}
