import api from './axios'
import { unwrapData } from './apiHelpers'

export function buildProductFormData({
  name,
  unit,
  sku,
  categoryId,
  minStockLevel,
  productImage,
  removeImage = false,
}) {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('unit', unit)
  formData.append('sku', sku)
  formData.append('categoryId', categoryId)
  formData.append('minStockLevel', String(minStockLevel))

  if (productImage) {
    formData.append('productImage', productImage)
  }

  if (removeImage) {
    formData.append('removeImage', 'true')
  }

  return formData
}

export async function getProducts(params = {}) {
  const response = await api.get('/products', { params })
  return unwrapData(response)
}

export async function getProductById(id) {
  const response = await api.get(`/products/${id}`)
  return unwrapData(response)
}

export async function createProduct(formData) {
  const response = await api.post('/products', formData)
  return unwrapData(response)
}

export async function updateProduct(id, formData) {
  const response = await api.put(`/products/${id}`, formData)
  return unwrapData(response)
}

export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`)
  return response.data
}
