import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  createLocation,
  getLocations,
  updateLocation,
} from '../api/locations'
import PageHeader from '../components/ui/PageHeader'
import DataTable from '../components/ui/DataTable'
import FilterBar, { FilterItem } from '../components/ui/FilterBar'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import TextField from '../components/ui/TextField'
import { EnumSelect } from '../components/ui/SelectField'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { LOCATION_TYPES } from '../constants/enums'
import {
  filterByActiveStatus,
  hasErrors,
  validateLocationForm,
} from '../utils/validation'

const emptyForm = {
  name: '',
  type: '',
  isActive: true,
  address: {
    line1: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  },
}

export default function LocationsPage() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toggleTarget, setToggleTarget] = useState(null)
  const [toggleLoading, setToggleLoading] = useState(false)

  const fetchLocations = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter === 'active' ? { isActive: true } : {}
      const data = await getLocations(params)
      setLocations(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to load locations', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  const filteredLocations = useMemo(() => {
    let rows = filterByActiveStatus(locations, statusFilter)

    if (typeFilter) {
      rows = rows.filter((item) => item.type === typeFilter)
    }

    return rows
  }, [locations, statusFilter, typeFilter])

  function openCreateModal() {
    setEditingLocation(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEditModal(location) {
    setEditingLocation(location)
    setForm({
      name: location.name || '',
      type: location.type || '',
      isActive: location.isActive !== false,
      address: {
        line1: location.address?.line1 || '',
        city: location.address?.city || '',
        state: location.address?.state || '',
        country: location.address?.country || '',
        pincode: location.address?.pincode || '',
      },
    })
    setErrors({})
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingLocation(null)
    setForm(emptyForm)
    setErrors({})
  }

  function handleChange(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  function handleAddressChange(field) {
    return (event) => {
      setForm((current) => ({
        ...current,
        address: { ...current.address, [field]: event.target.value },
      }))
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateLocationForm(form)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        isActive: form.isActive,
        address: {
          line1: form.address.line1.trim(),
          city: form.address.city.trim(),
          state: form.address.state.trim(),
          country: form.address.country.trim(),
          pincode: form.address.pincode.trim(),
        },
      }

      if (editingLocation) {
        await updateLocation(editingLocation._id, payload)
        toast.success('Location updated successfully')
      } else {
        await createLocation(payload)
        toast.success('Location created successfully')
      }

      closeModal()
      fetchLocations()
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
      await updateLocation(toggleTarget._id, {
        isActive: !toggleTarget.isActive,
      })
      toast.success(
        toggleTarget.isActive ? 'Location deactivated' : 'Location activated',
      )
      setToggleTarget(null)
      fetchLocations()
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
      key: 'address',
      label: 'Address',
      sortable: false,
      render: (value) => (
        <span className="block max-w-sm truncate text-slate-600">
          {value ? `${value.line1}, ${value.city}` : '—'}
        </span>
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
        title="Locations"
        description="Manage warehouses, factories, and stores."
        action={
          <Button onClick={openCreateModal} className="w-full sm:w-auto">
            Add Location
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
            {LOCATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FilterItem>
      </FilterBar>

      <DataTable
        columns={columns}
        data={filteredLocations}
        loading={loading}
        searchPlaceholder="Search locations..."
        searchKeys={['name', 'type']}
        emptyTitle="No locations found"
        emptyDescription="Add a warehouse, factory, or store to begin."
      />

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingLocation ? 'Edit Location' : 'Add Location'}
        description="Provide location details and full address."
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : editingLocation ? 'Update Location' : 'Create Location'}
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
              placeholder="e.g. Central Warehouse"
              required
              error={errors.name}
            />
            <EnumSelect
              label="Type"
              name="type"
              value={form.type}
              onChange={handleChange('type')}
              enumValues={LOCATION_TYPES}
              placeholder="Select type"
              required
              error={errors.type}
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <p className="mb-4 text-sm font-semibold text-slate-900">Address</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  label="Line 1"
                  name="line1"
                  value={form.address.line1}
                  onChange={handleAddressChange('line1')}
                  required
                  error={errors.line1}
                />
              </div>
              <TextField
                label="City"
                name="city"
                value={form.address.city}
                onChange={handleAddressChange('city')}
                required
                error={errors.city}
              />
              <TextField
                label="State"
                name="state"
                value={form.address.state}
                onChange={handleAddressChange('state')}
                required
                error={errors.state}
              />
              <TextField
                label="Country"
                name="country"
                value={form.address.country}
                onChange={handleAddressChange('country')}
                required
                error={errors.country}
              />
              <TextField
                label="Pincode"
                name="pincode"
                value={form.address.pincode}
                onChange={handleAddressChange('pincode')}
                required
                error={errors.pincode}
              />
            </div>
          </div>

          <ToggleSwitch
            checked={form.isActive}
            onChange={(value) => setForm((current) => ({ ...current, isActive: value }))}
            label="Active location"
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        title={toggleTarget?.isActive !== false ? 'Deactivate location?' : 'Activate location?'}
        description={
          toggleTarget?.isActive !== false
            ? `"${toggleTarget?.name}" will no longer be available for new operations.`
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
