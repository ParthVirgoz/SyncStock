export default function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  error,
  disabled = false,
  hint,
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm transition-colors outline-none focus:ring-2 focus:ring-brand-500/20 ${
          error
            ? 'border-red-300 focus:border-red-500'
            : 'border-slate-300 focus:border-brand-500'
        } ${disabled ? 'cursor-not-allowed bg-slate-100 text-slate-500' : 'bg-white'}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
