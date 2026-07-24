import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  createCategory,
  getCategories,
  updateCategory,
} from '../api/categories'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import FilterBar, { FilterItem } from '../components/ui/FilterBar'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import TextField from '../components/ui/TextField'
import TextAreaField from '../components/ui/TextAreaField'
import SelectField from '../components/ui/SelectField'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { getProductTypes } from '../api/productTypes'
import {
  buildProductTypeOptions,
  getProductTypeBadgeStatus,
  getProductTypeName,
  matchProductTypeFilter,
  resolveTypeId,
} from '../utils/productTypeHelpers'
import {
  filterByActiveStatus,
  hasErrors,
  validateCategoryForm,
} from '../utils/validation'

const emptyForm = {
  name: '',
  typeId: '',
  description: '',
  isActive: true,
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toggleTarget, setToggleTarget] = useState(null)
  const [toggleLoading, setToggleLoading] = useState(false)
  const [productTypes, setProductTypes] = useState([])
  const [productTypesLoading, setProductTypesLoading] = useState(true)

  const productTypeOptions = useMemo(
    () => buildProductTypeOptions(productTypes),
    [productTypes],
  )

  const categoriesWithTypeName = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        productTypeName: getProductTypeName(category, productTypes),
      })),
    [categories, productTypes],
  )

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter === 'active' ? { isActive: true } : {}
      const data = await getCategories(params)
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load categories', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const fetchProductTypes = useCallback(async () => {
    setProductTypesLoading(true)
    try {
      const data = await getProductTypes()
      setProductTypes(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load product types', { description: error.message })
    } finally {
      setProductTypesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProductTypes()
  }, [fetchProductTypes])

  const filteredCategories = useMemo(() => {
    let rows = filterByActiveStatus(categoriesWithTypeName, statusFilter)

    if (typeFilter) {
      rows = rows.filter((item) => matchProductTypeFilter(item, typeFilter, productTypes))
    }

    return rows
  }, [categoriesWithTypeName, statusFilter, typeFilter, productTypes])

  function openCreateModal() {
    if (!productTypeOptions.length) {
      toast.error('No product types available', {
        description: 'Create RAW, SEMI, and FINISHED types under Product Types first.',
      })
      return
    }

    setEditingCategory(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEditModal(category) {
    setEditingCategory(category)
    setForm({
      name: category.name || '',
      typeId: resolveTypeId(category),
      description: category.description || '',
      isActive: category.isActive !== false,
    })
    setErrors({})
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingCategory(null)
    setForm(emptyForm)
    setErrors({})
  }

  function handleChange(field) {
    return (event) => {
      const value =
        event.target.type === 'checkbox' ? event.target.checked : event.target.value
      setForm((current) => ({ ...current, [field]: value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateCategoryForm(form)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        typeId: form.typeId,
        description: form.description.trim(),
        isActive: form.isActive,
      }

      if (editingCategory) {
        await updateCategory(editingCategory._id, payload)
        toast.success('Category updated successfully')
      } else {
        await createCategory(payload)
        toast.success('Category created successfully')
      }

      closeModal()
      fetchCategories()
    } catch (error) {
      toast.error('Save failed', { description: error.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus() {
    if (!toggleTarget) return

    setToggleLoading(true)
    try {
      await updateCategory(toggleTarget._id, {
        isActive: !toggleTarget.isActive,
      })
      toast.success(
        toggleTarget.isActive ? 'Category deactivated' : 'Category activated',
      )
      setToggleTarget(null)
      fetchCategories()
    } catch (error) {
      toast.error('Update failed', { description: error.message })
    } finally {
      setToggleLoading(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      key: 'productTypeName',
      label: 'Product Type',
      sortable: true,
      render: (value, row) => (
        <StatusBadge
          status={getProductTypeBadgeStatus(row, productTypes)}
          label={value || '—'}
        />
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (value) => (
        <span className="block max-w-xs truncate text-slate-600">{value || '—'}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <StatusBadge
          status={value !== false ? 'ACTIVE' : 'INACTIVE'}
          label={value !== false ? 'Active' : 'Inactive'}
        />
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
          <Button
            variant={row.isActive !== false ? 'danger' : 'primary'}
            size="sm"
            onClick={() => setToggleTarget(row)}
          >
            {row.isActive !== false ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Group products under categories linked to a product type."
        action={
          <Button
            onClick={openCreateModal}
            className="w-full sm:w-auto"
            disabled={productTypesLoading || productTypeOptions.length === 0}
          >
            Add Category
          </Button>
        }
      />

      {!productTypesLoading && productTypeOptions.length === 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Create product types first under{' '}
          <span className="font-medium">Master Data → Product Types</span> before adding
          categories.
        </div>
      )}

      <FilterBar>
        <FilterItem label="Status">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FilterItem>
        <FilterItem label="Product Type">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            disabled={productTypesLoading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-100"
          >
            <option value="">All types</option>
            {productTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterItem>
      </FilterBar>

      <DataTable
        columns={columns}
        data={filteredCategories}
        loading={loading}
        searchPlaceholder="Search categories..."
        searchKeys={['name', 'description', 'productTypeName']}
        emptyTitle="No categories found"
        emptyDescription="Create your first category to get started."
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        description="Link each category to a product type and set its availability."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
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
            placeholder="e.g. Raw Cotton"
            required
            error={errors.name}
          />
          <SelectField
            label="Product Type"
            name="typeId"
            value={form.typeId}
            onChange={handleChange('typeId')}
            options={productTypeOptions}
            placeholder={productTypesLoading ? 'Loading product types...' : 'Select product type'}
            required
            disabled={productTypesLoading}
            error={errors.typeId}
          />
          <TextAreaField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Optional description"
            error={errors.description}
          />
          <ToggleSwitch
            checked={form.isActive}
            onChange={(value) => setForm((current) => ({ ...current, isActive: value }))}
            label="Active category"
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        title={toggleTarget?.isActive !== false ? 'Deactivate category?' : 'Activate category?'}
        description={
          toggleTarget?.isActive !== false
            ? `"${toggleTarget?.name}" will be hidden from active selections.`
            : `"${toggleTarget?.name}" will become available again.`
        }
        confirmLabel={toggleTarget?.isActive !== false ? 'Deactivate' : 'Activate'}
        variant={toggleTarget?.isActive !== false ? 'danger' : 'primary'}
        loading={toggleLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  )
}
