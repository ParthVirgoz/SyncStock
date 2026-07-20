import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getLocations } from '../api/locations'
import {
  createPurchaseOrder,
  getPurchaseOrders,
  receivePurchaseOrder,
} from '../api/purchaseOrders'
import { getProducts } from '../api/products'
import { getSuppliers } from '../api/suppliers'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import FilterBar, { FilterItem } from '../components/ui/FilterBar'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import SelectField from '../components/ui/SelectField'
import OrderLineRows, { calculateLineItemsTotal } from '../components/ui/OrderLineRows'
import StatusBadge from '../components/ui/StatusBadge'
import {
  hasErrors,
  validatePurchaseOrderForm,
  validateReceivePurchaseOrderForm,
} from '../utils/validation'
import { PURCHASE_ORDER_STATUS } from '../constants/enums'

const emptyCreateForm = {
  supplierId: '',
  items: [{ productId: '', quantity: '', price: '' }],
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

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [receiveOpen, setReceiveOpen] = useState(false)

  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [receiveForm, setReceiveForm] = useState({ locationId: '' })
  const [selectedOrder, setSelectedOrder] = useState(null)

  const [createErrors, setCreateErrors] = useState({})
  const [receiveErrors, setReceiveErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPurchaseOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load purchase orders', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchOptions = useCallback(async () => {
    try {
      const [supplierData, productData, locationData] = await Promise.all([
        getSuppliers(),
        getProducts({ limit: 100 }),
        getLocations({ isActive: true }),
      ])
      setSuppliers(Array.isArray(supplierData) ? supplierData : [])
      setProducts(Array.isArray(productData) ? productData : [])
      setLocations(Array.isArray(locationData) ? locationData : [])
    } catch (error) {
      toast.error('Failed to load form options', { description: error.message })
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchOptions()
  }, [fetchOrders, fetchOptions])

  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier._id,
    label: supplier.name,
  }))

  const productOptions = products.map((product) => ({
    value: product._id,
    label: `${product.name} (${product.sku})`,
  }))

  const locationOptions = locations.map((location) => ({
    value: location._id,
    label: `${location.name} (${location.type})`,
  }))

  const estimatedTotal = useMemo(
    () => calculateLineItemsTotal(createForm.items),
    [createForm.items],
  )

  const tableRows = useMemo(() => {
    let rows = orders.map((order) => ({
      ...order,
      supplierName: order.supplierId?.name || '—',
      itemsSummary: formatItemsSummary(order.items),
    }))

    if (statusFilter) {
      rows = rows.filter((row) => row.status === statusFilter)
    }

    return rows
  }, [orders, statusFilter])

  function openCreateModal() {
    setCreateForm(emptyCreateForm)
    setCreateErrors({})
    setCreateOpen(true)
  }

  function openDetailModal(order) {
    setSelectedOrder(order)
    setDetailOpen(true)
  }

  function openReceiveModal(order) {
    setSelectedOrder(order)
    setReceiveForm({ locationId: '' })
    setReceiveErrors({})
    setReceiveOpen(true)
  }

  async function handleCreateSubmit(event) {
    event.preventDefault()

    const validationErrors = validatePurchaseOrderForm(createForm)
    if (hasErrors(validationErrors)) {
      setCreateErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      await createPurchaseOrder({
        supplierId: createForm.supplierId,
        items: createForm.items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      })

      toast.success('Purchase order created successfully')
      setCreateOpen(false)
      fetchOrders()
    } catch (error) {
      toast.error('Create failed', { description: error.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleReceiveSubmit(event) {
    event.preventDefault()

    const validationErrors = validateReceivePurchaseOrderForm(receiveForm)
    if (hasErrors(validationErrors)) {
      setReceiveErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      await receivePurchaseOrder(selectedOrder._id, {
        locationId: receiveForm.locationId,
      })

      toast.success('Purchase order received successfully')
      setReceiveOpen(false)
      setSelectedOrder(null)
      fetchOrders()
    } catch (error) {
      toast.error('Receive failed', { description: error.message })
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'supplierName',
      label: 'Supplier',
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
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleDateString() : '—'),
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
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => openDetailModal(row)}>
            View
          </Button>
          {row.status === 'PENDING' && (
            <Button variant="primary" size="sm" onClick={() => openReceiveModal(row)}>
              Receive
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Create purchase orders and receive inbound stock from suppliers."
        action={
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            Create Purchase Order
          </Button>
        }
      />

      <FilterBar>
        <FilterItem label="Status">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All statuses</option>
            {PURCHASE_ORDER_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </FilterItem>
      </FilterBar>

      <DataTable
        columns={columns}
        data={tableRows}
        loading={loading}
        searchPlaceholder="Search by supplier or items..."
        searchKeys={['supplierName', 'itemsSummary', 'status']}
        emptyTitle="No purchase orders found"
        emptyDescription="Create a purchase order to procure stock from suppliers."
      />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Purchase Order"
        description="Add supplier details and line items for inbound procurement."
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
          <SelectField
            label="Supplier"
            name="supplierId"
            value={createForm.supplierId}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, supplierId: event.target.value }))
            }
            options={supplierOptions}
            placeholder="Select supplier"
            required
            error={createErrors.supplierId}
          />

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900">Line Items</p>
            <OrderLineRows
              rows={createForm.items}
              onChange={(items) => setCreateForm((current) => ({ ...current, items }))}
              productOptions={productOptions}
              quantityMin={1}
              errors={createErrors}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={receiveOpen}
        onClose={() => {
          setReceiveOpen(false)
          setSelectedOrder(null)
        }}
        title="Receive Purchase Order"
        description={`Receive items from ${selectedOrder?.supplierId?.name || 'supplier'} into inventory.`}
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setReceiveOpen(false)
                setSelectedOrder(null)
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleReceiveSubmit} disabled={saving}>
              {saving ? 'Receiving...' : 'Confirm Receive'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleReceiveSubmit}>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            All items in this purchase order will be added to the selected location.
          </div>
          <SelectField
            label="Receiving Location"
            name="locationId"
            value={receiveForm.locationId}
            onChange={(event) =>
              setReceiveForm({ locationId: event.target.value })
            }
            options={locationOptions}
            placeholder="Select warehouse or store"
            required
            error={receiveErrors.locationId}
          />
        </form>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setSelectedOrder(null)
        }}
        title="Purchase Order Details"
        description={
          selectedOrder?.status === 'RECEIVED'
            ? 'Read-only view of a received purchase order.'
            : 'Purchase order summary and line items.'
        }
        size="lg"
        footer={
          selectedOrder?.status === 'PENDING' ? (
            <div className="flex justify-end">
              <Button onClick={() => {
                setDetailOpen(false)
                openReceiveModal(selectedOrder)
              }}>
                Receive Order
              </Button>
            </div>
          ) : null
        }
      >
        {selectedOrder && (
          <div className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Supplier" value={selectedOrder.supplierId?.name || '—'} />
              <DetailItem label="Status" value={<StatusBadge status={selectedOrder.status} />} />
              <DetailItem label="Total" value={formatCurrency(selectedOrder.totalAmount)} />
              <DetailItem
                label="Date"
                value={
                  selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString()
                    : '—'
                }
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

function DetailItem({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  )
}
