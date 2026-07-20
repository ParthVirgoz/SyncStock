import api from './axios'
import { unwrapData } from './apiHelpers'

export async function getPurchaseOrders() {
  const response = await api.get('/purchase-orders')
  return unwrapData(response)
}

export async function createPurchaseOrder(payload) {
  const response = await api.post('/purchase-orders', payload)
  return unwrapData(response)
}

export async function receivePurchaseOrder(id, payload) {
  const response = await api.post(`/purchase-orders/${id}/receive`, payload)
  return unwrapData(response)
}
