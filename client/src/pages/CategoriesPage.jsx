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
import { EnumSelect } from '../components/ui/SelectField'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { CATEGORY_TYPES } from '../constants/enums'
import {
  filterByActiveStatus,
  hasErrors,
  validateCategoryForm,
} from '../utils/validation'

const emptyForm = {
  name: '',
  type: '',
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

  const filteredCategories = useMemo(() => {
    let rows = filterByActiveStatus(categories, statusFilter)

    if (typeFilter) {
      rows = rows.filter((item) => item.type === typeFilter)
    }

    return rows
  }, [categories, statusFilter, typeFilter])

  function openCreateModal() {
    setEditingCategory(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEditModal(category) {
    setEditingCategory(category)
    setForm({
      name: category.name || '',
      type: category.type || '',
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
        type: form.type,
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
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => <StatusBadge status={value} />,
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
        description="Organize products by RAW, SEMI, and FINISHED types."
        action={
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            Add Category
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
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FilterItem>
        <FilterItem label="Type">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">All types</option>
            {CATEGORY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
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
        searchKeys={['name', 'type', 'description']}
        emptyTitle="No categories found"
        emptyDescription="Create your first category to get started."
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        description="Define category name, type, and availability."
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
          <EnumSelect
            label="Type"
            name="type"
            value={form.type}
            onChange={handleChange('type')}
            enumValues={CATEGORY_TYPES}
            placeholder="Select type"
            required
            error={errors.type}
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
