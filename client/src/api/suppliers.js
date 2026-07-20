import api from './axios'
import { unwrapData } from './apiHelpers'

export async function getSuppliers() {
  const response = await api.get('/suppliers')
  return unwrapData(response)
}

export async function createSupplier(payload) {
  const response = await api.post('/suppliers', payload)
  return unwrapData(response)
}

export async function updateSupplier(id, payload) {
  const response = await api.put(`/suppliers/${id}`, payload)
  return unwrapData(response)
}
