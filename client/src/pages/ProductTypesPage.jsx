import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  createProductType,
  deleteProductType,
  getProductTypes,
  updateProductType,
} from '../api/productTypes'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import TextField from '../components/ui/TextField'
import TextAreaField from '../components/ui/TextAreaField'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { hasErrors, validateProductTypeForm } from '../utils/validation'

const emptyForm = {
  name: '',
  description: '',
}

export default function ProductTypesPage() {
  const [productTypes, setProductTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProductType, setEditingProductType] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchProductTypes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getProductTypes()
      setProductTypes(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load product types', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductTypes()
  }, [fetchProductTypes])

  function openCreateModal() {
    setEditingProductType(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEditModal(productType) {
    setEditingProductType(productType)
    setForm({
      name: productType.name || '',
      description: productType.description || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingProductType(null)
    setForm(emptyForm)
    setErrors({})
  }

  function handleChange(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateProductTypeForm(form)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      }

      if (editingProductType) {
        await updateProductType(editingProductType._id, payload)
        toast.success('Product type updated successfully')
      } else {
        await createProductType(payload)
        toast.success('Product type created successfully')
      }

      closeModal()
      fetchProductTypes()
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
      await deleteProductType(deleteTarget._id)
      toast.success('Product type deleted successfully')
      setDeleteTarget(null)
      fetchProductTypes()
    } catch (error) {
      toast.error('Delete failed', { description: error.message })
    } finally {
      setDeleteLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value) => (
        <StatusBadge status={value?.toUpperCase()} label={value} />
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (value) => (
        <span className="block max-w-xl truncate text-slate-600">{value || '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex flex-wrap gap-2">
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
        title="Product Types"
        description="Define RAW, SEMI, and FINISHED types used by categories and products."
        action={
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            Add Product Type
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={productTypes}
        loading={loading}
        searchPlaceholder="Search product types..."
        searchKeys={['name', 'description']}
        emptyTitle="No product types found"
        emptyDescription="Create RAW, SEMI, and FINISHED types to get started."
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingProductType ? 'Edit Product Type' : 'Add Product Type'}
        description="Product types classify categories and drive manufacturing filters."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving
                ? 'Saving...'
                : editingProductType
                  ? 'Update Product Type'
                  : 'Create Product Type'}
            </Button>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange('name')}
            placeholder="e.g. RAW"
            required
            error={errors.name}
          />
          <TextAreaField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Optional description"
            error={errors.description}
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product type?"
        description={`"${deleteTarget?.name}" will be permanently removed. Categories or products using this type may break.`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
