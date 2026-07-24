export default function ImagePreview({
  src,
  alt = '',
  className = 'h-10 w-10',
  emptyLabel = '—',
  rounded = 'lg',
}) {
  const roundedClass = rounded === 'full' ? 'rounded-full' : 'rounded-lg'

  if (!src) {
    return (
      <span
        className={`inline-flex ${className} items-center justify-center ${roundedClass} bg-slate-100 text-xs text-slate-400`}
      >
        {emptyLabel}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${roundedClass} border border-slate-200 object-cover`}
    />
  )
}
