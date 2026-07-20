import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { getInventory } from '../api/inventory'
import { getProductionOrders } from '../api/production'
import { getPurchaseOrders } from '../api/purchaseOrders'
import { getSaleOrders } from '../api/saleOrders'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import LoadingSkeleton from '../components/ui/LoadingSkeleton'
import {
  buildProductPriceMap,
  calculateInventoryStats,
  getAllProducts,
} from '../utils/dashboardStats'

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

function StatCard({ label, value, hint, tone = 'default' }) {
  const toneClasses = {
    default: 'border-slate-200 bg-white',
    warning: 'border-red-200 bg-red-50',
    success: 'border-emerald-200 bg-emerald-50',
    info: 'border-blue-200 bg-blue-50',
  }

  const valueClasses = {
    default: 'text-slate-900',
    warning: 'text-red-700',
    success: 'text-emerald-700',
    info: 'text-blue-700',
  }

  return (
    <div className={`rounded-xl border p-4 shadow-sm sm:p-5 ${toneClasses[tone]}`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueClasses[tone]}`}>{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [inventory, setInventory] = useState([])
  const [productionOrders, setProductionOrders] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [saleOrders, setSaleOrders] = useState([])

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const [
        productData,
        inventoryData,
        productionData,
        purchaseData,
        saleData,
      ] = await Promise.all([
        getAllProducts(),
        getInventory(),
        getProductionOrders(),
        getPurchaseOrders(),
        getSaleOrders(),
      ])

      setProducts(Array.isArray(productData) ? productData : [])
      setInventory(Array.isArray(inventoryData) ? inventoryData : [])
      setProductionOrders(Array.isArray(productionData) ? productionData : [])
      setPurchaseOrders(Array.isArray(purchaseData) ? purchaseData : [])
      setSaleOrders(Array.isArray(saleData) ? saleData : [])
    } catch (error) {
      toast.error('Failed to load dashboard', { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const priceMap = useMemo(
    () => buildProductPriceMap(purchaseOrders, saleOrders),
    [purchaseOrders, saleOrders],
  )

  const inventoryStats = useMemo(
    () => calculateInventoryStats(inventory, priceMap),
    [inventory, priceMap],
  )

  const pendingProduction = productionOrders.filter((order) => order.status === 'PENDING').length
  const activeProduction = productionOrders.filter(
    (order) => order.status === 'IN_PROGRESS',
  ).length
  const pendingPurchaseOrders = purchaseOrders.filter((order) => order.status === 'PENDING').length

  const recentSales = useMemo(
    () =>
      [...saleOrders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [saleOrders],
  )

  const lowStockPreview = inventoryStats.lowStockItems.slice(0, 5)

  const stockValueHint =
    inventoryStats.pricedUnits > 0
      ? `Estimated from ${inventoryStats.pricedUnits} priced units in PO/sale history`
      : 'Add purchase or sale prices to estimate stock value'

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of inventory, manufacturing, procurement, and sales."
        action={
          <Button variant="secondary" onClick={loadDashboard} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <LoadingSkeleton columns={1} rows={2} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Products" value={products.length} />
            <StatCard
              label="Estimated Stock Value"
              value={formatCurrency(inventoryStats.stockValue)}
              hint={stockValueHint}
            />
            <StatCard
              label="Total Stock Units"
              value={inventoryStats.totalUnits.toLocaleString()}
              hint="Sum of quantities across all locations"
            />
            <StatCard
              label="Low Stock Items"
              value={inventoryStats.lowStockCount}
              tone={inventoryStats.lowStockCount > 0 ? 'warning' : 'default'}
              hint="Below minimum stock level"
            />
            <StatCard
              label="Pending Production"
              value={pendingProduction}
              tone={pendingProduction > 0 ? 'info' : 'default'}
            />
            <StatCard
              label="Active Production"
              value={activeProduction}
              tone={activeProduction > 0 ? 'info' : 'default'}
            />
            <StatCard
              label="Pending Purchase Orders"
              value={pendingPurchaseOrders}
              tone={pendingPurchaseOrders > 0 ? 'warning' : 'default'}
            />
            <StatCard label="Total Sale Orders" value={saleOrders.length} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Low Stock Alerts</h2>
                  <p className="text-sm text-slate-500">Items below minimum stock level</p>
                </div>
                <Link to="/inventory">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                {lowStockPreview.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-500 sm:px-5">
                    No low stock items right now.
                  </p>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 sm:px-5">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">
                          Min
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lowStockPreview.map((item) => (
                        <tr key={item._id} className="bg-red-50/40">
                          <td className="px-4 py-3 sm:px-5">
                            <p className="font-medium text-slate-900">{item.productName}</p>
                            <p className="text-xs text-slate-500">{item.sku}</p>
                          </td>
                          <td className="px-4 py-3">{item.locationName}</td>
                          <td className="px-4 py-3 font-semibold text-red-600">{item.quantity}</td>
                          <td className="px-4 py-3">{item.minStockLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Recent Sales</h2>
                  <p className="text-sm text-slate-500">Latest outbound sale orders</p>
                </div>
                <Link to="/sale-orders">
                  <Button variant="ghost" size="sm">
                    View all
                  </Button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                {recentSales.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-500 sm:px-5">
                    No sale orders recorded yet.
                  </p>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600 sm:px-5">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-600">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentSales.map((order) => (
                        <tr key={order._id}>
                          <td className="px-4 py-3 font-medium text-slate-900 sm:px-5">
                            {order.customerName}
                          </td>
                          <td className="px-4 py-3">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-4 py-3">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString()
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Inventory', path: '/inventory' },
              { label: 'Production', path: '/production-orders' },
              { label: 'Purchase Orders', path: '/purchase-orders' },
              { label: 'Products', path: '/products' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
              >
                Open {link.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
