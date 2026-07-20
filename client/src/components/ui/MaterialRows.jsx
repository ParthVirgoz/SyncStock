import Button from './Button'
import NumberField from './NumberField'
import SelectField from './SelectField'

const emptyRow = { productId: '', quantity: '', locationId: '' }

export default function MaterialRows({
  rows = [],
  onChange,
  productOptions = [],
  locationOptions = [],
  showLocation = false,
  addLabel = 'Add material',
  errors = {},
}) {
  function addRow() {
    onChange([...rows, { ...emptyRow }])
  }

  function removeRow(index) {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index))
  }

  function updateRow(index, field, value) {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    )
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
          No materials added yet.
        </p>
      ) : (
        rows.map((row, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 p-3 sm:p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Material {index + 1}</p>
              <Button variant="ghost" size="sm" type="button" onClick={() => removeRow(index)}>
                Remove
              </Button>
            </div>
            <div className={`grid gap-3 ${showLocation ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
              <SelectField
                label="Product"
                name={`material-product-${index}`}
                value={row.productId}
                onChange={(event) => updateRow(index, 'productId', event.target.value)}
                options={productOptions}
                placeholder="Select material"
                error={errors[`materials.${index}.productId`] || errors[`materialsUsed.${index}.productId`]}
              />
              {showLocation && (
                <SelectField
                  label="Location"
                  name={`material-location-${index}`}
                  value={row.locationId}
                  onChange={(event) => updateRow(index, 'locationId', event.target.value)}
                  options={locationOptions}
                  placeholder="Select location"
                  error={errors[`materialsUsed.${index}.locationId`]}
                />
              )}
              <NumberField
                label="Quantity"
                name={`material-quantity-${index}`}
                value={row.quantity}
                onChange={(event) => updateRow(index, 'quantity', event.target.value)}
                min={0}
                step="any"
                error={errors[`materials.${index}.quantity`] || errors[`materialsUsed.${index}.quantity`]}
              />
            </div>
          </div>
        ))
      )}

      {errors.materials && <p className="text-xs text-red-600">{errors.materials}</p>}

      <Button variant="secondary" size="sm" type="button" onClick={addRow}>
        {addLabel}
      </Button>
    </div>
  )
}
