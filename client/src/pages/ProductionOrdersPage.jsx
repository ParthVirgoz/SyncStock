import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getLocations } from '../api/locations'
import {
  completeProductionOrder,
  createProductionOrder,
  getProductionOrders,
  startProductionOrder,
} from '../api/production'
import { getProducts } from '../api/products'
import { getProductTypes } from '../api/productTypes'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import FilterBar, { FilterItem } from '../components/ui/FilterBar'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import SelectField from '../components/ui/SelectField'
import NumberField from '../components/ui/NumberField'
import MaterialRows from '../components/ui/MaterialRows'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { PRODUCTION_STATUS } from '../constants/enums'
import {
  getProductTypeName,
  matchProductTypeNames,
} from '../utils/productTypeHelpers'
import {
  hasErrors,
  validateProductionCompleteForm,
  validateProductionCreateForm,
} from '../utils/validation'

const emptyCreateForm = {
  productId: '',
  quantityToProduce: '',
  materialsUsed: [],
}

const emptyCompleteForm = {
  locationId: '',
  wastage: 0,
  materialsUsed: [],
}

function formatMaterialsUsed(materials = []) {
  if (!materials.length) return '—'

  return materials
    .map((material) => {
      const name = material.productId?.name || 'Unknown'
      return `${name} (${material.quantity})`
    })
    .join(', ')
}

export default function ProductionOrdersPage() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [startTarget, setStartTarget] = useState(null)
  const [completingOrder, setCompletingOrder] = useState(null)

  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [completeForm, setCompleteForm] = useState(emptyCompleteForm)
  const [createErrors, setCreateErrors] = useState({})
  const [completeErrors, setCompleteErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [productTypes, setProductTypes] = useState([])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProductionOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load production orders', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchOptions = useCallback(async () => {
    try {
      const [productData, locationData, productTypeData] = await Promise.all([
        getProducts({ limit: 100 }),
        getLocations({ isActive: true }),
        getProductTypes(),
      ])
      setProducts(Array.isArray(productData) ? productData : [])
      setLocations(Array.isArray(locationData) ? locationData : [])
      setProductTypes(Array.isArray(productTypeData) ? productTypeData : [])
    } catch (error) {
      toast.error('Failed to load form options', { description: error.message })
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchOptions()
  }, [fetchOrders, fetchOptions])

  const outputProducts = useMemo(
    () =>
      products.filter((product) =>
        matchProductTypeNames(product, ['FINISHED', 'SEMI'], productTypes),
      ),
    [products, productTypes],
  )

  const materialProducts = useMemo(
    () =>
      products.filter((product) =>
        matchProductTypeNames(product, ['RAW', 'SEMI'], productTypes),
      ),
    [products, productTypes],
  )

  const outputProductOptions = outputProducts.map((product) => ({
    value: product._id,
    label: `${product.name} (${getProductTypeName(product, productTypes)})`,
  }))

  const materialProductOptions = materialProducts.map((product) => ({
    value: product._id,
    label: `${product.name} (${getProductTypeName(product, productTypes)})`,
  }))

  const locationOptions = locations.map((location) => ({
    value: location._id,
    label: `${location.name} (${location.type})`,
  }))

  const tableRows = useMemo(() => {
    let rows = orders.map((order) => ({
      ...order,
      productName: order.productId?.name || '—',
      productSku: order.productId?.sku || '—',
      materialsSummary: formatMaterialsUsed(order.materialsUsed),
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

  function openCompleteModal(order) {
    setCompletingOrder(order)
    setCompleteForm({
      locationId: '',
      wastage: order.wastage ?? 0,
      materialsUsed: [],
    })
    setCompleteErrors({})
    setCompleteOpen(true)
  }

  async function handleCreateSubmit(event) {
    event.preventDefault()

    const validationErrors = validateProductionCreateForm(createForm)
    if (hasErrors(validationErrors)) {
      setCreateErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        productId: createForm.productId,
        quantityToProduce: Number(createForm.quantityToProduce),
      }

      if (createForm.materialsUsed.length > 0) {
        payload.materialsUsed = createForm.materialsUsed.map((material) => ({
          productId: material.productId,
          locationId: material.locationId,
          quantity: Number(material.quantity),
        }))
      }

      await createProductionOrder(payload)
      toast.success('Production order created successfully')
      setCreateOpen(false)
      fetchOrders()
    } catch (error) {
      toast.error('Create failed', { description: error.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleStartProduction() {
    if (!startTarget) return

    setActionLoading(true)
    try {
      await startProductionOrder(startTarget._id)
      toast.success('Production started successfully')
      setStartTarget(null)
      fetchOrders()
    } catch (error) {
      toast.error('Start failed', { description: error.message })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleCompleteSubmit(event) {
    event.preventDefault()

    const validationErrors = validateProductionCompleteForm(completeForm)
    if (hasErrors(validationErrors)) {
      setCompleteErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        locationId: completeForm.locationId,
        wastage: Number(completeForm.wastage || 0),
      }

      if (completeForm.materialsUsed.length > 0) {
        payload.materialsUsed = completeForm.materialsUsed.map((material) => ({
          productId: material.productId,
          locationId: material.locationId,
          quantity: Number(material.quantity),
        }))
      }

      await completeProductionOrder(completingOrder._id, payload)
      toast.success('Production completed successfully')
      setCompleteOpen(false)
      setCompletingOrder(null)
      fetchOrders()
    } catch (error) {
      toast.error('Complete failed', { description: error.message })
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{row.productSku}</p>
        </div>
      ),
    },
    {
      key: 'quantityToProduce',
      label: 'Qty to Produce',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'materialsSummary',
      label: 'Materials Used',
      sortable: false,
      render: (value) => (
        <span className="block max-w-md truncate text-slate-600">{value}</span>
      ),
    },
    {
      key: 'wastage',
      label: 'Wastage',
      sortable: true,
      render: (value) => value ?? 0,
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={row.status !== 'PENDING'}
            onClick={() => setStartTarget(row)}
          >
            Start
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={row.status !== 'IN_PROGRESS'}
            onClick={() => openCompleteModal(row)}
          >
            Complete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Production Orders"
        description="Create, start, and complete manufacturing production orders."
        action={
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            Create Order
          </Button>
        }
      />

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Starting or completing production can deduct materials from inventory and add
        finished goods to the selected location.
      </div>

      <FilterBar>
        <FilterItem label="Status">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All statuses</option>
            {PRODUCTION_STATUS.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </FilterItem>
      </FilterBar>

      <DataTable
        columns={columns}
        data={tableRows}
        loading={loading}
        searchPlaceholder="Search by product name..."
        searchKeys={['productName', 'productSku', 'status']}
        emptyTitle="No production orders found"
        emptyDescription="Create a production order to begin manufacturing."
      />

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Production Order"
        description="Optional materials will be deducted immediately when the order is created."
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} disabled={saving}>
              {saving ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleCreateSubmit}>
          <SelectField
            label="Product to Produce"
            name="productId"
            value={createForm.productId}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, productId: event.target.value }))
            }
            options={outputProductOptions}
            placeholder="Select product"
            required
            error={createErrors.productId}
          />
          <NumberField
            label="Quantity to Produce"
            name="quantityToProduce"
            value={createForm.quantityToProduce}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                quantityToProduce: event.target.value,
              }))
            }
            min={0}
            required
            error={createErrors.quantityToProduce}
          />

          <div>
            <p className="mb-1 text-sm font-semibold text-slate-900">
              Materials Used (optional)
            </p>
            <p className="mb-3 text-xs text-slate-500">
              If added, stock will be deducted from the selected locations immediately.
            </p>
            <MaterialRows
              rows={createForm.materialsUsed}
              onChange={(materialsUsed) =>
                setCreateForm((current) => ({ ...current, materialsUsed }))
              }
              productOptions={materialProductOptions}
              locationOptions={locationOptions}
              showLocation
              addLabel="Add material usage"
              errors={createErrors}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={completeOpen}
        onClose={() => {
          setCompleteOpen(false)
          setCompletingOrder(null)
        }}
        title="Complete Production"
        description="Finished goods will be added to inventory at the selected location."
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setCompleteOpen(false)
                setCompletingOrder(null)
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleCompleteSubmit} disabled={saving}>
              {saving ? 'Completing...' : 'Complete Production'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleCompleteSubmit}>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Completing this order adds finished goods to inventory and may deduct any
            additional materials you specify below.
          </div>

          <SelectField
            label="Output Location"
            name="locationId"
            value={completeForm.locationId}
            onChange={(event) =>
              setCompleteForm((current) => ({ ...current, locationId: event.target.value }))
            }
            options={locationOptions}
            placeholder="Where finished goods are stored"
            required
            error={completeErrors.locationId}
          />

          <NumberField
            label="Wastage"
            name="wastage"
            value={completeForm.wastage}
            onChange={(event) =>
              setCompleteForm((current) => ({ ...current, wastage: event.target.value }))
            }
            min={0}
            error={completeErrors.wastage}
          />

          <div>
            <p className="mb-1 text-sm font-semibold text-slate-900">
              Additional Materials Used (optional)
            </p>
            <p className="mb-3 text-xs text-slate-500">
              Add extra material deductions during completion if needed.
            </p>
            <MaterialRows
              rows={completeForm.materialsUsed}
              onChange={(materialsUsed) =>
                setCompleteForm((current) => ({ ...current, materialsUsed }))
              }
              productOptions={materialProductOptions}
              locationOptions={locationOptions}
              showLocation
              addLabel="Add material usage"
              errors={completeErrors}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(startTarget)}
        title="Start production?"
        description={`This will move "${startTarget?.productId?.name}" to IN_PROGRESS. Make sure required materials are available in inventory.`}
        confirmLabel="Start Production"
        variant="primary"
        loading={actionLoading}
        onConfirm={handleStartProduction}
        onCancel={() => setStartTarget(null)}
      />
    </div>
  )
}
