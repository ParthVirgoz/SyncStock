export default function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  rows = 4,
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`block w-full resize-y rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-colors outline-none focus:ring-2 focus:ring-brand-500/20 ${
          error
            ? 'border-red-300 focus:border-red-500'
            : 'border-slate-300 focus:border-brand-500'
        } ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white'}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
