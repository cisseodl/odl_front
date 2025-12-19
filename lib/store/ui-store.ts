import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UiStore {
  theme: "light" | "dark"
  sidebarOpen: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      sidebarOpen: true,

      toggleTheme: () => {
        const newTheme = get().theme === "light" ? "dark" : "light"
        set({ theme: newTheme })

        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", newTheme === "dark")
        }
      },

      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "ui-storage",
    },
  ),
)
