import { useEffect, useMemo, useState } from 'react'
import EmptyState from './EmptyState'
import LoadingSkeleton from './LoadingSkeleton'

function getSortValue(row, key) {
  const value = row[key]
  if (value == null) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return value
}

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  pageSize = 10,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  actions,
  paginationMode = 'client',
  page: controlledPage = 1,
  onPageChange,
  hasNextPage = false,
  getRowClassName,
}) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [internalPage, setInternalPage] = useState(1)

  const isServerPagination = paginationMode === 'server'
  const page = isServerPagination ? controlledPage : internalPage
  const setPage = isServerPagination ? onPageChange : setInternalPage

  const filteredData = useMemo(() => {
    let rows = [...data]

    if (search.trim()) {
      const query = search.trim().toLowerCase()
      rows = rows.filter((row) => {
        const keys = searchKeys.length
          ? searchKeys
          : columns.map((column) => column.key)

        return keys.some((key) =>
          String(getSortValue(row, key)).toLowerCase().includes(query),
        )
      })
    }

    if (sortKey) {
      rows.sort((a, b) => {
        const left = String(getSortValue(a, sortKey)).toLowerCase()
        const right = String(getSortValue(b, sortKey)).toLowerCase()
        if (left < right) return sortDir === 'asc' ? -1 : 1
        if (left > right) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }

    return rows
  }, [columns, data, search, searchKeys, sortDir, sortKey])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const paginatedData = isServerPagination
    ? filteredData
    : filteredData.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    if (!isServerPagination) {
      setInternalPage(1)
    }
  }, [search, sortKey, sortDir, data.length, isServerPagination])

  useEffect(() => {
    if (!isServerPagination && page > totalPages) {
      setInternalPage(totalPages)
    }
  }, [page, totalPages, isServerPagination])

  function handleSort(key) {
    if (!key) return
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('asc')
  }

  const showPagination = isServerPagination
    ? !loading && (filteredData.length > 0 || page > 1)
    : !loading && filteredData.length > 0

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {(searchable || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative max-w-md flex-1">
              <svg
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(column.key)}
                      className="inline-flex items-center gap-1 hover:text-slate-700"
                    >
                      {column.label}
                      {sortKey === column.key && (
                        <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <LoadingSkeleton columns={columns.length} rows={pageSize > 5 ? 5 : pageSize} />
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row._id || row.id || rowIndex}
                  className={`hover:bg-slate-50/80 ${getRowClassName ? getRowClassName(row) : ''}`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm text-slate-700 ${
                        column.key === 'actions'
                          ? 'whitespace-nowrap'
                          : 'whitespace-nowrap sm:whitespace-normal'
                      }`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {isServerPagination ? (
              <>
                Page {page}
                {filteredData.length > 0 &&
                  ` · Showing ${filteredData.length} item${filteredData.length > 1 ? 's' : ''}`}
              </>
            ) : (
              <>
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, filteredData.length)} of {filteredData.length}
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {!isServerPagination && (
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
            )}
            <button
              type="button"
              disabled={isServerPagination ? !hasNextPage : page === totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
