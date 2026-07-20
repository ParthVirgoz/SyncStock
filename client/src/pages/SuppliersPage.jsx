import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  createSupplier,
  getSuppliers,
  updateSupplier,
} from '../api/suppliers'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import TextField from '../components/ui/TextField'
import TextAreaField from '../components/ui/TextAreaField'
import { hasErrors, validateSupplierForm } from '../utils/validation'

const emptyForm = {
  name: '',
  contactNumber: '',
  address: '',
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSuppliers()
      setSuppliers(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load suppliers', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  function openCreateModal() {
    setEditingSupplier(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEditModal(supplier) {
    setEditingSupplier(supplier)
    setForm({
      name: supplier.name || '',
      contactNumber: supplier.contactNumber || '',
      address: supplier.address || '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingSupplier(null)
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

    const validationErrors = validateSupplierForm(form)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        contactNumber: form.contactNumber.trim(),
        address: form.address.trim(),
      }

      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, payload)
        toast.success('Supplier updated successfully')
      } else {
        await createSupplier(payload)
        toast.success('Supplier created successfully')
      }

      closeModal()
      fetchSuppliers()
    } catch (error) {
      toast.error('Save failed', { description: error.message })
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Supplier',
      sortable: true,
      render: (value) => <span className="font-medium text-slate-900">{value}</span>,
    },
    {
      key: 'contactNumber',
      label: 'Contact',
      sortable: true,
    },
    {
      key: 'address',
      label: 'Address',
      sortable: false,
      render: (value) => (
        <span className="block max-w-md truncate text-slate-600">{value || '—'}</span>
      ),
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
        title="Suppliers"
        description="Manage supplier contacts for purchase orders."
        action={
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            Add Supplier
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={suppliers}
        loading={loading}
        searchPlaceholder="Search suppliers..."
        searchKeys={['name', 'contactNumber', 'address']}
        emptyTitle="No suppliers found"
        emptyDescription="Add your first supplier to support procurement."
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
        description="Supplier details are used when creating purchase orders."
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Create Supplier'}
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
            placeholder="e.g. Shree Ganesh Textiles"
            required
            error={errors.name}
          />
          <TextField
            label="Contact Number"
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange('contactNumber')}
            placeholder="10 digit mobile number"
            required
            error={errors.contactNumber}
            hint="Must be exactly 10 digits"
          />
          <TextAreaField
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange('address')}
            placeholder="Full supplier address"
            required
            error={errors.address}
          />
        </form>
      </Modal>
    </div>
  )
}
