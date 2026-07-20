import api from './axios'
import { unwrapData } from './apiHelpers'

export async function getLocations(params = {}) {
  const response = await api.get('/locations', { params })
  return unwrapData(response)
}

export async function createLocation(payload) {
  const response = await api.post('/locations', payload)
  return unwrapData(response)
}

export async function updateLocation(id, payload) {
  const response = await api.put(`/locations/${id}`, payload)
  return unwrapData(response)
}
