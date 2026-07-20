import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { createBom, getBomByProduct, updateBom } from '../api/bom'
import { getProducts } from '../api/products'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import FilterBar, { FilterItem } from '../components/ui/FilterBar'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import SelectField from '../components/ui/SelectField'
import MaterialRows from '../components/ui/MaterialRows'
import StatusBadge from '../components/ui/StatusBadge'
import { hasErrors, validateBomForm } from '../utils/validation'

const emptyForm = {
  productId: '',
  materials: [{ productId: '', quantity: '' }],
}

function formatMaterialsSummary(materials = []) {
  if (!materials.length) return '—'

  return materials
    .map((material) => {
      const name = material.productId?.name || 'Unknown'
      return `${name} (${material.quantity})`
    })
    .join(', ')
}

export default function BomPage() {
  const [products, setProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [boms, setBoms] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBom, setEditingBom] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts({ limit: 100 })
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load products', { description: error.message })
    }
  }, [])

  const fetchBoms = useCallback(async () => {
    if (!selectedProductId) {
      setBoms([])
      return
    }

    setLoading(true)
    try {
      const data = await getBomByProduct(selectedProductId)
      setBoms(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load BOM records', { description: error.message })
      setBoms([])
    } finally {
      setLoading(false)
    }
  }, [selectedProductId])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetchBoms()
  }, [fetchBoms])

  const finishedProducts = useMemo(
    () => products.filter((product) => ['FINISHED', 'SEMI'].includes(product.type)),
    [products],
  )

  const materialProducts = useMemo(
    () => products.filter((product) => ['RAW', 'SEMI'].includes(product.type)),
    [products],
  )

  const finishedProductOptions = finishedProducts.map((product) => ({
    value: product._id,
    label: `${product.name} (${product.type})`,
  }))

  const materialProductOptions = materialProducts.map((product) => ({
    value: product._id,
    label: `${product.name} (${product.sku})`,
  }))

  const selectedProduct = finishedProducts.find(
    (product) => product._id === selectedProductId,
  )

  const tableRows = useMemo(
    () =>
      boms.map((bom) => ({
        ...bom,
        productName: bom.productId?.name || selectedProduct?.name || '—',
        materialsSummary: formatMaterialsSummary(bom.materials),
        materialCount: bom.materials?.length || 0,
      })),
    [boms, selectedProduct],
  )

  function openCreateModal() {
    setEditingBom(null)
    setForm({
      productId: selectedProductId || '',
      materials: [{ productId: '', quantity: '' }],
    })
    setErrors({})
    setModalOpen(true)
  }

  function openEditModal(bom) {
    setEditingBom(bom)
    setForm({
      productId: bom.productId?._id || bom.productId || selectedProductId,
      materials: (bom.materials || []).map((material) => ({
        productId: material.productId?._id || material.productId || '',
        quantity: material.quantity ?? '',
      })),
    })
    setErrors({})
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingBom(null)
    setForm(emptyForm)
    setErrors({})
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateBomForm(form)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        productId: form.productId,
        materials: form.materials.map((material) => ({
          productId: material.productId,
          quantity: Number(material.quantity),
        })),
      }

      if (editingBom) {
        await updateBom(editingBom._id, payload)
        toast.success('BOM updated successfully')
      } else {
        await createBom(payload)
        toast.success('BOM created successfully')
      }

      closeModal()

      if (selectedProductId === form.productId) {
        fetchBoms()
      } else {
        setSelectedProductId(form.productId)
      }
    } catch (error) {
      toast.error('Save failed', { description: error.message })
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      key: 'materialCount',
      label: 'Materials',
      sortable: true,
    },
    {
      key: 'materialsSummary',
      label: 'Recipe',
      sortable: false,
      render: (value) => (
        <span className="block max-w-xl text-slate-600">{value}</span>
      ),
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
        <Button variant="secondary" size="sm" onClick={() => openEditModal(row)}>
          Edit
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Bill of Materials"
        description="Define raw and semi-finished materials required for each finished product."
        action={
          <Button
            onClick={openCreateModal}
            disabled={!selectedProductId && finishedProducts.length === 0}
            className="w-full sm:w-auto"
          >
            Add BOM
          </Button>
        }
      />

      <FilterBar>
        <FilterItem label="Finished Product" className="lg:flex-[2]">
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">Select a finished or semi product</option>
            {finishedProductOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterItem>
        {selectedProduct && (
          <FilterItem label="Selected Product">
            <div className="flex h-[42px] items-center">
              <StatusBadge status={selectedProduct.type} />
            </div>
          </FilterItem>
        )}
      </FilterBar>

      {!selectedProductId ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-700">Select a product to view BOMs</p>
          <p className="mt-2 text-sm text-slate-500">
            Choose a FINISHED or SEMI product to load its bill of materials.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableRows}
          loading={loading}
          searchPlaceholder="Search BOM materials..."
          searchKeys={['materialsSummary', 'productName']}
          emptyTitle="No BOM records found"
          emptyDescription="Create a BOM recipe for this product."
        />
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingBom ? 'Edit BOM' : 'Create BOM'}
        description="Materials must be RAW or SEMI finished products."
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingBom ? 'Update BOM' : 'Create BOM'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <SelectField
            label="Finished Product"
            name="productId"
            value={form.productId}
            onChange={(event) =>
              setForm((current) => ({ ...current, productId: event.target.value }))
            }
            options={finishedProductOptions}
            placeholder="Select finished product"
            required
            error={errors.productId}
          />

          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900">Materials</p>
            <MaterialRows
              rows={form.materials}
              onChange={(materials) => setForm((current) => ({ ...current, materials }))}
              productOptions={materialProductOptions}
              addLabel="Add material row"
              errors={errors}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
