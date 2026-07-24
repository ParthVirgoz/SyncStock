// Product/category types are loaded from GET /productTypes.
// Use client/src/api/productTypes.js and client/src/utils/productTypeHelpers.js.

export const PRODUCT_UNITS = ['kg', 'pcs', 'liters']

export const LOCATION_TYPES = ['WAREHOUSE', 'FACTORY', 'STORE']

export const PRODUCTION_STATUS = ['PENDING', 'IN_PROGRESS', 'COMPLETED']

export const PURCHASE_ORDER_STATUS = ['PENDING', 'RECEIVED']

export const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-800 ring-amber-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 ring-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  RECEIVED: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  RAW: 'bg-orange-100 text-orange-800 ring-orange-200',
  SEMI: 'bg-violet-100 text-violet-800 ring-violet-200',
  FINISHED: 'bg-teal-100 text-teal-800 ring-teal-200',
  WAREHOUSE: 'bg-slate-100 text-slate-800 ring-slate-200',
  FACTORY: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
  STORE: 'bg-pink-100 text-pink-800 ring-pink-200',
  ACTIVE: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  INACTIVE: 'bg-slate-100 text-slate-500 ring-slate-200',
}
