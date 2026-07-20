import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getCategories } from '../api/categories'
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../api/products'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import FilterBar, { FilterItem } from '../components/ui/FilterBar'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import TextField from '../components/ui/TextField'
import NumberField from '../components/ui/NumberField'
import SelectField, { EnumSelect } from '../components/ui/SelectField'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { PRODUCT_TYPES, PRODUCT_UNITS } from '../constants/enums'
import { hasErrors, validateProductForm } from '../utils/validation'

const PAGE_SIZE = 10

const emptyForm = {
  name: '',
  type: '',
  unit: '',
  sku: '',
  categoryId: '',
  minStockLevel: 0,
}

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [detailProduct, setDetailProduct] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [typeFilter, debouncedSearch])

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories({ isActive: true })
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load categories', { description: error.message })
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
      }

      if (typeFilter) params.type = typeFilter
      if (debouncedSearch) params.search = debouncedSearch

      const data = await getProducts(params)
      const rows = Array.isArray(data) ? data : []
      setProducts(rows)
      setHasNextPage(rows.length === PAGE_SIZE)
    } catch (error) {
      toast.error('Failed to load products', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter, debouncedSearch])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const categoryOptions = categories.map((category) => ({
    value: category._id,
    label: `${category.name} (${category.type})`,
  }))

  function openCreateModal() {
    setEditingProduct(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEditModal(product) {
    setEditingProduct(product)
    setForm({
      name: product.name || '',
      type: product.type || '',
      unit: product.unit || '',
      sku: product.sku || '',
      categoryId: product.categoryId?._id || product.categoryId || '',
      minStockLevel: product.minStockLevel ?? 0,
    })
    setErrors({})
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingProduct(null)
    setForm(emptyForm)
    setErrors({})
  }

  async function openDetailModal(product) {
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailProduct(null)

    try {
      const data = await getProductById(product._id)
      setDetailProduct(data)
    } catch (error) {
      toast.error('Failed to load product details', { description: error.message })
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  function handleChange(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateProductForm(form)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        unit: form.unit,
        sku: form.sku.trim(),
        categoryId: form.categoryId,
        minStockLevel: Number(form.minStockLevel),
      }

      if (editingProduct) {
        await updateProduct(editingProduct._id, payload)
        toast.success('Product updated successfully')
      } else {
        await createProduct(payload)
        toast.success('Product created successfully')
      }

      closeModal()
      fetchProducts()
    } catch (error) {
      toast.error('Save failed', { description: error.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return

    setDeleteLoading(true)
    try {
      await deleteProduct(deleteTarget._id)
      toast.success('Product deleted successfully')
      setDeleteTarget(null)
      setDetailOpen(false)
      setDetailProduct(null)

      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1)
      } else {
        fetchProducts()
      }
    } catch (error) {
      toast.error('Delete failed', { description: error.message })
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'unit',
      label: 'Unit',
      sortable: true,
    },
    {
      key: 'categoryId',
      label: 'Category',
      sortable: false,
      render: (value) => value?.name || '—',
    },
    {
      key: 'minStockLevel',
      label: 'Min Stock',
      sortable: true,
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
          <Button variant="secondary" size="sm" onClick={() => openEditModal(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog with SKU, units, and stock thresholds."
        action={
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            Add Product
          </Button>
        }
      />

      <FilterBar>
        <FilterItem label="Search" className="sm:min-w-[220px] lg:flex-[2]">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by product name..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </FilterItem>
        <FilterItem label="Type">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All types</option>
            {PRODUCT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FilterItem>
      </FilterBar>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchable={false}
        pageSize={PAGE_SIZE}
        paginationMode="server"
        page={page}
        onPageChange={setPage}
        hasNextPage={hasNextPage}
        emptyTitle="No products found"
        emptyDescription="Adjust filters or add a new product."
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        description="Define product details and minimum stock level."
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange('name')}
              required
              error={errors.name}
            />
            <TextField
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={handleChange('sku')}
              required
              error={errors.sku}
            />
            <EnumSelect
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange('type')}
              enumValues={PRODUCT_TYPES}
              required
              error={errors.type}
            />
            <EnumSelect
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange('unit')}
              enumValues={PRODUCT_UNITS}
              required
              error={errors.unit}
            />
            <SelectField
              label="Category"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange('categoryId')}
              options={categoryOptions}
              placeholder="Select category"
              required
              error={errors.categoryId}
            />
            <NumberField
              label="Minimum Stock Level"
              name="minStockLevel"
              value={form.minStockLevel}
              onChange={handleChange('minStockLevel')}
              min={0}
              required
              error={errors.minStockLevel}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setDetailProduct(null)
        }}
        title="Product Details"
        description="Full product information from the system."
        size="lg"
        footer={
          detailProduct && (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setDetailOpen(false)
                  openEditModal(detailProduct)
                }}
              >
                Edit Product
              </Button>
              <Button variant="danger" onClick={() => setDeleteTarget(detailProduct)}>
                Delete Product
              </Button>
            </div>
          )
        }
      >
        {detailLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-4 animate-pulse rounded bg-slate-200" />
            ))}
          </div>
        ) : detailProduct ? (
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Name" value={detailProduct.name} />
            <DetailItem label="SKU" value={detailProduct.sku} />
            <DetailItem label="Type" value={<StatusBadge status={detailProduct.type} />} />
            <DetailItem label="Unit" value={detailProduct.unit} />
            <DetailItem
              label="Category"
              value={detailProduct.categoryId?.name || '—'}
            />
            <DetailItem label="Min Stock Level" value={detailProduct.minStockLevel} />
            <DetailItem
              label="Created"
              value={new Date(detailProduct.createdAt).toLocaleString()}
              className="sm:col-span-2"
            />
          </dl>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        description={`"${deleteTarget?.name}" will be permanently removed from the catalog.`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
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
