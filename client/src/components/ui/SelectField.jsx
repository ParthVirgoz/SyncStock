export default function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error,
  disabled = false,
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-colors outline-none focus:ring-2 focus:ring-brand-500/20 ${
          error
            ? 'border-red-300 focus:border-red-500'
            : 'border-slate-300 focus:border-brand-500'
        } ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white'}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function EnumSelect(props) {
  const options = (props.enumValues || []).map((value) => ({
    value,
    label: String(value).replace(/_/g, ' '),
  }))

  return <SelectField {...props} options={options} />
}
