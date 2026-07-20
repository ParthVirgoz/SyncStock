import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getInventory } from '../api/inventory'
import { getLocations } from '../api/locations'
import { getProducts } from '../api/products'
import { createSaleOrder, getSaleOrders } from '../api/saleOrders'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import TextField from '../components/ui/TextField'
import OrderLineRows, { calculateLineItemsTotal } from '../components/ui/OrderLineRows'
import { hasErrors, validateSaleOrderForm } from '../utils/validation'

const emptyCreateForm = {
  customerName: '',
  items: [{ productId: '', locationId: '', quantity: '', price: '' }],
}

function formatItemsSummary(items = []) {
  if (!items.length) return '—'

  return items
    .map((item) => {
      const name = item.productId?.name || 'Unknown'
      return `${name} x${item.quantity}`
    })
    .join(', ')
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

export default function SaleOrdersPage() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [createErrors, setCreateErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSaleOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load sale orders', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchOptions = useCallback(async () => {
    try {
      const [productData, locationData, inventoryData] = await Promise.all([
        getProducts({ limit: 100 }),
        getLocations({ isActive: true }),
        getInventory(),
      ])
      setProducts(Array.isArray(productData) ? productData : [])
      setLocations(Array.isArray(locationData) ? locationData : [])
      setInventory(Array.isArray(inventoryData) ? inventoryData : [])
    } catch (error) {
      toast.error('Failed to load form options', { description: error.message })
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchOptions()
  }, [fetchOrders, fetchOptions])

  const productOptions = products.map((product) => ({
    value: product._id,
    label: `${product.name} (${product.sku})`,
  }))

  const locationOptions = locations.map((location) => ({
    value: location._id,
    label: `${location.name} (${location.type})`,
  }))

  const stockMap = useMemo(() => {
    const map = new Map()
    inventory.forEach((item) => {
      const productId = item.productId?._id
      const locationId = item.locationId?._id
      if (productId && locationId) {
        map.set(`${productId}-${locationId}`, item.quantity)
      }
    })
    return map
  }, [inventory])

  const estimatedTotal = useMemo(
    () => calculateLineItemsTotal(createForm.items),
    [createForm.items],
  )

  const tableRows = useMemo(
    () =>
      orders.map((order) => ({
        ...order,
        itemsSummary: formatItemsSummary(order.items),
      })),
    [orders],
  )

  function getStockHint(row) {
    if (!row.productId || !row.locationId) return null

    const available = stockMap.get(`${row.productId}-${row.locationId}`)
    if (available == null) return 'No stock at this location'

    const requested = Number(row.quantity)
    if (!Number.isNaN(requested) && requested > available) {
      return `Only ${available} available (insufficient stock)`
    }

    return `${available} available at selected location`
  }

  function hasInsufficientStock(items = []) {
    return items.some((item) => {
      if (!item.productId || !item.locationId || item.quantity === '') return false
      const available = stockMap.get(`${item.productId}-${item.locationId}`) ?? 0
      return Number(item.quantity) > available
    })
  }

  function openCreateModal() {
    setCreateForm(emptyCreateForm)
    setCreateErrors({})
    setCreateOpen(true)
  }

  function openDetailModal(order) {
    setSelectedOrder(order)
    setDetailOpen(true)
  }

  async function handleCreateSubmit(event) {
    event.preventDefault()

    const validationErrors = validateSaleOrderForm(createForm)
    if (hasErrors(validationErrors)) {
      setCreateErrors(validationErrors)
      return
    }

    if (hasInsufficientStock(createForm.items)) {
      toast.error('Insufficient stock', {
        description: 'One or more line items exceed available inventory at the selected location.',
      })
      return
    }

    setSaving(true)
    try {
      await createSaleOrder({
        customerName: createForm.customerName.trim(),
        items: createForm.items.map((item) => ({
          productId: item.productId,
          locationId: item.locationId,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      })

      toast.success('Sale order created successfully')
      setCreateOpen(false)
      fetchOrders()
      fetchOptions()
    } catch (error) {
      toast.error('Create failed', { description: error.message })
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      key: 'totalAmount',
      label: 'Total',
      sortable: true,
      render: (value) => formatCurrency(value),
    },
    {
      key: 'itemsSummary',
      label: 'Items',
      sortable: false,
      render: (value) => (
        <span className="block max-w-md truncate text-slate-600">{value}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <Button variant="ghost" size="sm" onClick={() => openDetailModal(row)}>
          View
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Sale Orders"
        description="Create sale orders and track outbound inventory movements."
        action={
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            Create Sale Order
          </Button>
        }
      />

      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Stock is deducted from the selected location when a sale order is created. Fulfillment
        location is not stored in order history after creation.
      </div>

      <DataTable
        columns={columns}
        data={tableRows}
        loading={loading}
        searchPlaceholder="Search by customer or items..."
        searchKeys={['customerName', 'itemsSummary']}
        emptyTitle="No sale orders found"
        emptyDescription="Create a sale order to record outbound stock."
      />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Sale Order"
        description="Select products, locations, and quantities to deduct from inventory."
        size="lg"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-900">
              Estimated total: {formatCurrency(estimatedTotal)}
            </p>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button variant="secondary" onClick={() => setCreateOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleCreateSubmit} disabled={saving}>
                {saving ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleCreateSubmit}>
          <TextField
            label="Customer Name"
            name="customerName"
            value={createForm.customerName}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                customerName: event.target.value,
              }))
            }
            placeholder="e.g. ABC Retail Store"
            required
            error={createErrors.customerName}
          />

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900">Line Items</p>
            <OrderLineRows
              rows={createForm.items}
              onChange={(items) => setCreateForm((current) => ({ ...current, items }))}
              productOptions={productOptions}
              locationOptions={locationOptions}
              showLocation
              quantityMin={0}
              errors={createErrors}
              getStockHint={getStockHint}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setSelectedOrder(null)
        }}
        title="Sale Order Details"
        description="Read-only sale order summary. Fulfillment location is not stored in order history."
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Customer" value={selectedOrder.customerName} />
              <DetailItem label="Total" value={formatCurrency(selectedOrder.totalAmount)} />
              <DetailItem
                label="Date"
                value={
                  selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString()
                    : '—'
                }
                className="sm:col-span-2"
              />
            </dl>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Product</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Qty</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedOrder.items || []).map((item) => (
                    <tr key={item._id}>
                      <td className="px-4 py-3">{item.productId?.name || '—'}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3">
                        {formatCurrency(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function DetailItem({ label, value, className = '' }) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}
