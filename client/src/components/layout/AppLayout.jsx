import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { checkHealth } from '../../api/health'
import { useAppStore } from '../../store/useAppStore'
import { getRouteMeta } from '../../routes/routeConfig'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Breadcrumb from './Breadcrumb'

let healthCheckStarted = false

export default function AppLayout() {
  const location = useLocation()
  const setApiStatus = useAppStore((s) => s.setApiStatus)
  const closeMobileSidebar = useAppStore((s) => s.closeMobileSidebar)
  const { title, breadcrumbs } = getRouteMeta(location.pathname)

  useEffect(() => {
    closeMobileSidebar()
  }, [location.pathname, closeMobileSidebar])

  useEffect(() => {
    if (healthCheckStarted) return
    healthCheckStarted = true

    let cancelled = false

    async function verifyApiConnection() {
      try {
        const health = await checkHealth()
        if (cancelled) return

        setApiStatus(true, health.uptime)
        toast.success('Connected to SyncStock', {
          description: 'System is ready.',
        })
      } catch (error) {
        if (cancelled) return

        setApiStatus(false)
        toast.error('Connection failed', {
          description: error.message,
        })
      }
    }

    verifyApiConnection()

    return () => {
      cancelled = true
    }
  }, [setApiStatus])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <Breadcrumb items={breadcrumbs} />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
