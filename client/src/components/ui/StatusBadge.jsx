import { STATUS_COLORS } from '../../constants/enums'

export default function StatusBadge({ status, label }) {
  const text = label || status
  const colorClass =
    STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 ring-slate-200'

  if (!text) return null

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${colorClass}`}
    >
      {String(text).replace(/_/g, ' ')}
    </span>
  )
}
