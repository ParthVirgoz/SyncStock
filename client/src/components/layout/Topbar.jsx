import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { useAuthStore } from '../../store/useAuthStore'
import Button from '../ui/Button'

export default function Topbar({ title }) {
  const navigate = useNavigate()
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const apiConnected = useAppStore((s) => s.apiConnected)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Open navigation menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:inline-flex"
          aria-label="Toggle sidebar width"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">
            SyncStock
          </p>
          <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user?.email && (
          <p className="hidden max-w-[180px] truncate text-sm text-slate-600 sm:block">
            {user.email}
          </p>
        )}

        <Button variant="secondary" size="sm" onClick={handleLogout}>
          Logout
        </Button>

        <span
          title={
            apiConnected === true
              ? 'System online'
              : apiConnected === false
                ? 'System offline'
                : 'Checking connection'
          }
          className={`h-2.5 w-2.5 rounded-full ${
            apiConnected === true
              ? 'bg-emerald-500'
              : apiConnected === false
                ? 'bg-red-500'
                : 'bg-amber-400'
          }`}
        />
      </div>
    </header>
  )
}
