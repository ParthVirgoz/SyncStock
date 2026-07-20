import api from './axios'
import { unwrapData } from './apiHelpers'

export async function getProductionOrders() {
  const response = await api.get('/production-orders')
  return unwrapData(response)
}

export async function createProductionOrder(payload) {
  const response = await api.post('/production-orders', payload)
  return unwrapData(response)
}

export async function startProductionOrder(id) {
  const response = await api.post(`/production-orders/${id}/start`)
  return unwrapData(response)
}

export async function completeProductionOrder(id, payload) {
  const response = await api.post(`/production-orders/${id}/complete`, payload)
  return unwrapData(response)
}
