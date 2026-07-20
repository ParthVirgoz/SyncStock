import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import DashboardPage from '../pages/DashboardPage'
import CategoriesPage from '../pages/CategoriesPage'
import ProductsPage from '../pages/ProductsPage'
import LocationsPage from '../pages/LocationsPage'
import SuppliersPage from '../pages/SuppliersPage'
import InventoryPage from '../pages/InventoryPage'
import BomPage from '../pages/BomPage'
import ProductionOrdersPage from '../pages/ProductionOrdersPage'
import PurchaseOrdersPage from '../pages/PurchaseOrdersPage'
import SaleOrdersPage from '../pages/SaleOrdersPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'locations', element: <LocationsPage /> },
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'bom', element: <BomPage /> },
      { path: 'production-orders', element: <ProductionOrdersPage /> },
      { path: 'purchase-orders', element: <PurchaseOrdersPage /> },
      { path: 'sale-orders', element: <SaleOrdersPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
