import { create } from 'zustand'

export const useAppStore = create((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  apiConnected: null,
  serverUptime: null,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),

  setApiStatus: (connected, uptime = null) =>
    set({ apiConnected: connected, serverUptime: uptime }),
}))
