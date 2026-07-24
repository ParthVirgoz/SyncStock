import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { adjustInventory, getInventory } from '../api/inventory'
import { getLocations } from '../api/locations'
import { getProducts } from '../api/products'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import FilterBar, { FilterItem } from '../components/ui/FilterBar'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import NumberField from '../components/ui/NumberField'
import SelectField from '../components/ui/SelectField'
import StatusBadge from '../components/ui/StatusBadge'
import { hasErrors, validateInventoryAdjustForm } from '../utils/validation'

const emptyAdjustForm = {
  productId: '',
  locationId: '',
  quantity: '',
}

function normalizeInventoryRow(item) {
  return {
    ...item,
    productName: item.productId?.name || '—',
    sku: item.productId?.sku || '—',
    locationName: item.locationId?.name || '—',
    locationType: item.locationId?.type || '',
    minStockLevel: item.productId?.minStockLevel ?? 0,
    isLowStock: item.quantity < (item.productId?.minStockLevel ?? 0),
  }
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [products, setProducts] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationFilter, setLocationFilter] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyAdjustForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getInventory()
      setInventory(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load inventory', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFormOptions = useCallback(async () => {
    try {
      const [productData, locationData] = await Promise.all([
        getProducts({ limit: 100 }),
        getLocations({ isActive: true }),
      ])
      setProducts(Array.isArray(productData) ? productData : [])
      setLocations(Array.isArray(locationData) ? locationData : [])
    } catch (error) {
      toast.error('Failed to load form options', { description: error.message })
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  useEffect(() => {
    fetchFormOptions()
  }, [fetchFormOptions])

  const tableRows = useMemo(() => {
    let rows = inventory.map(normalizeInventoryRow)

    if (locationFilter) {
      rows = rows.filter((row) => row.locationId?._id === locationFilter)
    }

    if (lowStockOnly) {
      rows = rows.filter((row) => row.isLowStock)
    }

    return rows
  }, [inventory, locationFilter, lowStockOnly])

  const lowStockCount = useMemo(
    () => inventory.filter((item) => item.quantity < (item.productId?.minStockLevel ?? 0)).length,
    [inventory],
  )

  const locationOptions = useMemo(() => {
    const unique = new Map()
    inventory.forEach((item) => {
      if (item.locationId?._id) {
        unique.set(item.locationId._id, item.locationId.name)
      }
    })
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }))
  }, [inventory])

  const productOptions = products.map((product) => ({
    value: product._id,
    label: `${product.name} (${product.sku})`,
  }))

  const locationFormOptions = locations.map((location) => ({
    value: location._id,
    label: `${location.name} (${location.type})`,
  }))

  function openAdjustModal() {
    setForm(emptyAdjustForm)
    setErrors({})
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setForm(emptyAdjustForm)
    setErrors({})
  }

  function handleChange(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function handleAdjustSubmit(event) {
    event.preventDefault()

    const validationErrors = validateInventoryAdjustForm(form)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      await adjustInventory({
        productId: form.productId,
        locationId: form.locationId,
        quantity: Number(form.quantity),
      })

      toast.success('Inventory adjusted successfully')
      closeModal()
      fetchInventory()
    } catch (error) {
      toast.error('Adjustment failed', { description: error.message })
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
          {row.isLowStock && (
            <span className="mt-1 inline-flex text-xs font-medium text-red-600">
              Below minimum stock
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
    },
    {
      key: 'locationName',
      label: 'Location',
      sortable: true,
      render: (value, row) => (
        <div>
          <p>{value}</p>
          {row.locationType && (
            <div className="mt-1">
              <StatusBadge status={row.locationType} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (value, row) => (
        <span className={row.isLowStock ? 'font-semibold text-red-600' : 'font-medium'}>
          {value}
        </span>
      ),
    },
    {
      key: 'reservedQuantity',
      label: 'Reserved',
      sortable: true,
      render: (value) => value ?? 0,
    },
    {
      key: 'minStockLevel',
      label: 'Min Stock',
      sortable: true,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Track stock by product and location, and apply manual adjustments."
        action={
          <Button onClick={openAdjustModal} className="w-full sm:w-auto">
            Adjust Stock
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total Stock Records</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{inventory.length}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm text-red-600">Low Stock Items</p>
          <p className="mt-1 text-2xl font-semibold text-red-700">{lowStockCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 xl:col-span-1">
          <p className="text-sm text-slate-500">Filtered Results</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{tableRows.length}</p>
        </div>
      </div>

      <FilterBar>
        <FilterItem label="Location" className="lg:flex-[1.2]">
          <select
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All locations</option>
            {locationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterItem>
        <FilterItem label="Stock Status">
          <label className="flex h-[42px] items-center gap-2 rounded-lg border border-slate-300 px-3">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(event) => setLowStockOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700">Low stock only</span>
          </label>
        </FilterItem>
      </FilterBar>

      <DataTable
        columns={columns}
        data={tableRows}
        loading={loading}
        searchPlaceholder="Search by product name or SKU..."
        searchKeys={['productName', 'sku', 'locationName']}
        getRowClassName={(row) =>
          row.isLowStock ? 'bg-red-50/70 hover:bg-red-50' : ''
        }
        emptyTitle="No inventory records found"
        emptyDescription="Adjust filters or add stock using the adjustment form."
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Adjust Stock"
        description="Use positive values to add stock and negative values to reduce stock."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleAdjustSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Apply Adjustment'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleAdjustSubmit}>
          <SelectField
            label="Product"
            name="productId"
            value={form.productId}
            onChange={handleChange('productId')}
            options={productOptions}
            placeholder="Select product"
            required
            error={errors.productId}
          />
          <SelectField
            label="Location"
            name="locationId"
            value={form.locationId}
            onChange={handleChange('locationId')}
            options={locationFormOptions}
            placeholder="Select location"
            required
            error={errors.locationId}
          />
          <NumberField
            label="Quantity Change"
            name="quantity"
            value={form.quantity}
            onChange={handleChange('quantity')}
            placeholder="e.g. 10 or -5"
            required
            error={errors.quantity}
          />
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            If the product already exists at the selected location, the quantity will be
            added to the current stock. Use a negative number to deduct stock.
          </p>
        </form>
      </Modal>
    </div>
  )
}
