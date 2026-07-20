import Button from './Button'
import NumberField from './NumberField'
import SelectField from './SelectField'

const emptyRow = {
  productId: '',
  locationId: '',
  quantity: '',
  price: '',
}

export default function OrderLineRows({
  rows = [],
  onChange,
  productOptions = [],
  locationOptions = [],
  showLocation = false,
  showPrice = true,
  quantityMin = 0,
  addLabel = 'Add line item',
  errors = {},
  getStockHint,
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

  const gridClass = showLocation
    ? showPrice
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : 'sm:grid-cols-3'
    : showPrice
      ? 'sm:grid-cols-3'
      : 'sm:grid-cols-2'

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500">
          No line items added yet.
        </p>
      ) : (
        rows.map((row, index) => {
          const stockHint = getStockHint ? getStockHint(row) : null

          return (
            <div
              key={index}
              className="rounded-xl border border-slate-200 p-3 sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Item {index + 1}</p>
                <Button variant="ghost" size="sm" type="button" onClick={() => removeRow(index)}>
                  Remove
                </Button>
              </div>
              <div className={`grid gap-3 ${gridClass}`}>
                <SelectField
                  label="Product"
                  name={`line-product-${index}`}
                  value={row.productId}
                  onChange={(event) => updateRow(index, 'productId', event.target.value)}
                  options={productOptions}
                  placeholder="Select product"
                  error={errors[`items.${index}.productId`]}
                />
                {showLocation && (
                  <SelectField
                    label="Location"
                    name={`line-location-${index}`}
                    value={row.locationId}
                    onChange={(event) => updateRow(index, 'locationId', event.target.value)}
                    options={locationOptions}
                    placeholder="Select location"
                    error={errors[`items.${index}.locationId`]}
                  />
                )}
                <NumberField
                  label="Quantity"
                  name={`line-quantity-${index}`}
                  value={row.quantity}
                  onChange={(event) => updateRow(index, 'quantity', event.target.value)}
                  min={quantityMin}
                  step="any"
                  error={errors[`items.${index}.quantity`]}
                  hint={stockHint}
                />
                {showPrice && (
                  <NumberField
                    label="Price"
                    name={`line-price-${index}`}
                    value={row.price}
                    onChange={(event) => updateRow(index, 'price', event.target.value)}
                    min={0}
                    step="any"
                    error={errors[`items.${index}.price`]}
                  />
                )}
              </div>
            </div>
          )
        })
      )}

      {errors.items && <p className="text-xs text-red-600">{errors.items}</p>}

      <Button variant="secondary" size="sm" type="button" onClick={addRow}>
        {addLabel}
      </Button>
    </div>
  )
}

export function calculateLineItemsTotal(items = []) {
  return items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0
    const price = Number(item.price) || 0
    return total + quantity * price
  }, 0)
}
