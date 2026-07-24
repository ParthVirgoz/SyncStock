export const routeMeta = {
  '/': {
    title: 'Dashboard',
    breadcrumbs: [{ label: 'Home', path: '/' }],
  },
  '/product-types': {
    title: 'Product Types',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Master Data' },
      { label: 'Product Types' },
    ],
  },
  '/categories': {
    title: 'Categories',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Master Data' },
      { label: 'Categories' },
    ],
  },
  '/products': {
    title: 'Products',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Master Data' },
      { label: 'Products' },
    ],
  },
  '/locations': {
    title: 'Locations',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Master Data' },
      { label: 'Locations' },
    ],
  },
  '/suppliers': {
    title: 'Suppliers',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Master Data' },
      { label: 'Suppliers' },
    ],
  },
  '/inventory': {
    title: 'Inventory',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Inventory' },
    ],
  },
  '/bom': {
    title: 'Bill of Materials',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Manufacturing' },
      { label: 'Bill of Materials' },
    ],
  },
  '/production-orders': {
    title: 'Production Orders',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Manufacturing' },
      { label: 'Production Orders' },
    ],
  },
  '/purchase-orders': {
    title: 'Purchase Orders',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Procurement' },
      { label: 'Purchase Orders' },
    ],
  },
  '/sale-orders': {
    title: 'Sale Orders',
    breadcrumbs: [
      { label: 'Home', path: '/' },
      { label: 'Sales' },
      { label: 'Sale Orders' },
    ],
  },
}

export const navGroups = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/' }],
  },
  {
    label: 'Master Data',
    items: [
      { label: 'Product Types', path: '/product-types' },
      { label: 'Categories', path: '/categories' },
      { label: 'Products', path: '/products' },
      { label: 'Locations', path: '/locations' },
      { label: 'Suppliers', path: '/suppliers' },
    ],
  },
  {
    label: 'Operations',
    items: [{ label: 'Inventory', path: '/inventory' }],
  },
  {
    label: 'Manufacturing',
    items: [
      { label: 'Bill of Materials', path: '/bom' },
      { label: 'Production Orders', path: '/production-orders' },
    ],
  },
  {
    label: 'Procurement',
    items: [{ label: 'Purchase Orders', path: '/purchase-orders' }],
  },
  {
    label: 'Sales',
    items: [{ label: 'Sale Orders', path: '/sale-orders' }],
  },
]

export function getRouteMeta(pathname) {
  return (
    routeMeta[pathname] || {
      title: 'SyncStock',
      breadcrumbs: [{ label: 'Home', path: '/' }],
    }
  )
}
