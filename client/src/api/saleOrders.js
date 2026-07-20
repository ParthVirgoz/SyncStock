import api from './axios'
import { unwrapData } from './apiHelpers'

export async function getSaleOrders() {
  const response = await api.get('/sale-orders')
  return unwrapData(response)
}

export async function createSaleOrder(payload) {
  const response = await api.post('/sale-orders', payload)
  return unwrapData(response)
}
