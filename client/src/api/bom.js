import api from './axios'
import { unwrapData } from './apiHelpers'

export async function getBomByProduct(productId) {
  const response = await api.get(`/bom/${productId}`)
  return unwrapData(response)
}

export async function createBom(payload) {
  const response = await api.post('/bom', payload)
  return unwrapData(response)
}

export async function updateBom(id, payload) {
  const response = await api.put(`/bom/${id}`, payload)
  return unwrapData(response)
}
