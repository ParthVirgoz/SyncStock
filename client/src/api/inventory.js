import api from './axios'
import { unwrapData } from './apiHelpers'

export async function getInventory() {
  const response = await api.get('/inventory')
  return unwrapData(response)
}

export async function adjustInventory(payload) {
  const response = await api.post('/inventory', payload)
  return unwrapData(response)
}
