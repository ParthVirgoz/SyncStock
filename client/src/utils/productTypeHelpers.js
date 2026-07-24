export function resolveTypeId(item) {
  if (!item?.typeId) return ''

  if (typeof item.typeId === 'string') {
    return item.typeId
  }

  return item.typeId._id || item.typeId.id || ''
}

export function getProductTypeName(item, productTypes = []) {
  if (!item) return ''

  if (typeof item.typeId === 'object' && item.typeId?.name) {
    return item.typeId.name
  }

  if (typeof item.type === 'string' && item.type) {
    return item.type
  }

  const typeId = resolveTypeId(item)
  if (!typeId) return ''

  const match = productTypes.find((productType) => productType._id === typeId)
  return match?.name || ''
}

export function matchProductTypeFilter(item, typeIdFilter, productTypes = []) {
  if (!typeIdFilter) return true

  const itemTypeId = resolveTypeId(item)
  if (itemTypeId) {
    return itemTypeId === typeIdFilter
  }

  const filterType = productTypes.find((productType) => productType._id === typeIdFilter)
  if (!filterType) return false

  return getProductTypeName(item, productTypes).toUpperCase() === filterType.name.toUpperCase()
}

export function buildProductTypeOptions(productTypes = []) {
  return productTypes.map((productType) => ({
    value: productType._id,
    label: productType.name,
  }))
}

export function findProductTypeByName(productTypes = [], name = '') {
  const normalizedName = name.trim().toUpperCase()
  if (!normalizedName) return null

  return (
    productTypes.find(
      (productType) => productType.name?.trim().toUpperCase() === normalizedName,
    ) || null
  )
}

export function matchProductTypeNames(item, names = [], productTypes = []) {
  const typeName = getProductTypeName(item, productTypes).toUpperCase()
  if (!typeName) return false

  return names.map((name) => name.toUpperCase()).includes(typeName)
}

export function getProductTypeBadgeStatus(item, productTypes = []) {
  return getProductTypeName(item, productTypes).toUpperCase()
}
