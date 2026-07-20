export default function FilterBar({ children, className = '' }) {
  return (
    <div
      className={`mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:flex-wrap lg:items-end ${className}`}
    >
      {children}
    </div>
  )
}

export function FilterItem({ label, children, className = '' }) {
  return (
    <div className={`min-w-[140px] flex-1 ${className}`}>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {label}
        </label>
      )}
      {children}
    </div>
  )
}
