import { getProducts } from '../api/products'

export async function getAllProducts() {
  const allProducts = []
  let page = 1
  const limit = 100

  while (true) {
    const batch = await getProducts({ page, limit })
    const rows = Array.isArray(batch) ? batch : []

    allProducts.push(...rows)

    if (rows.length < limit) break
    page += 1
  }

  return allProducts
}

export function buildProductPriceMap(purchaseOrders = [], saleOrders = []) {
  const priceMap = new Map()

  const applyPrices = (orders, getItems) => {
    orders.forEach((order) => {
      getItems(order).forEach((item) => {
        const productId = item.productId?._id || item.productId
        if (productId && item.price != null) {
          priceMap.set(String(productId), Number(item.price))
        }
      })
    })
  }

  applyPrices(purchaseOrders, (order) => order.items || [])
  applyPrices(saleOrders, (order) => order.items || [])

  return priceMap
}

export function calculateInventoryStats(inventory = [], priceMap = new Map()) {
  let totalUnits = 0
  let pricedUnits = 0
  let stockValue = 0
  let lowStockCount = 0
  const lowStockItems = []

  inventory.forEach((item) => {
    const quantity = Number(item.quantity) || 0
    const minStockLevel = Number(item.productId?.minStockLevel) || 0
    const productId = String(item.productId?._id || item.productId || '')
    const price = priceMap.get(productId)

    totalUnits += quantity

    if (price != null) {
      stockValue += quantity * price
      pricedUnits += quantity
    }

    if (quantity < minStockLevel) {
      lowStockCount += 1
      lowStockItems.push({
        _id: item._id,
        productId: item.productId,
        productName: item.productId?.name || 'Unknown',
        sku: item.productId?.sku || '—',
        locationName: item.locationId?.name || '—',
        quantity,
        minStockLevel,
      })
    }
  })

  lowStockItems.sort((a, b) => a.quantity - b.quantity)

  return {
    totalUnits,
    stockValue,
    pricedUnits,
    lowStockCount,
    lowStockItems,
  }
}
