import api from './axios'
import { unwrapData } from './apiHelpers'

export async function getProducts(params = {}) {
  const response = await api.get('/products', { params })
  return unwrapData(response)
}

export async function getProductById(id) {
  const response = await api.get(`/products/${id}`)
  return unwrapData(response)
}

export async function createProduct(payload) {
  const response = await api.post('/products', payload)
  return unwrapData(response)
}

export async function updateProduct(id, payload) {
  const response = await api.put(`/products/${id}`, payload)
  return unwrapData(response)
}

export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`)
  return response.data
}
