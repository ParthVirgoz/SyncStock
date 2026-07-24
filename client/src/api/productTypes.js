import api from './axios'
import { unwrapData } from './apiHelpers'

export async function getProductTypes(params = {}) {
  const response = await api.get('/productTypes', { params })
  return unwrapData(response)
}

export async function getProductTypeById(id) {
  const response = await api.get(`/productTypes/${id}`)
  return unwrapData(response)
}

export async function createProductType(payload) {
  const response = await api.post('/productTypes', payload)
  return unwrapData(response)
}

export async function updateProductType(id, payload) {
  const response = await api.put(`/productTypes/${id}`, payload)
  return unwrapData(response)
}

export async function deleteProductType(id) {
  const response = await api.delete(`/productTypes/${id}`)
  return response.data
}
