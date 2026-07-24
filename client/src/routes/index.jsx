import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import { GuestRoute, ProtectedRoute } from './ProtectedRoute'
import ProductTypesPage from '../pages/ProductTypesPage'
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
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'product-types', element: <ProductTypesPage /> },
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
