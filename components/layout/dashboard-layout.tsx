"use client"

import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { useDataStore } from "../../store/data-store"
import Sidebar from "./sidebar"
import Header from "./header"

export default function DashboardLayout() {
  // Determine if viewport is desktop (lg: 1024px) and keep sidebar open
  const isClient = typeof window !== "undefined"
  const getIsDesktop = () => (isClient ? window.innerWidth >= 1024 : false)

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(getIsDesktop())
  const { fetchData } = useDataStore()

    // Close/open sidebar depending on viewport width changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>

          {/* Footer */}
          <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border">
            Made by Bereket Kinfe
          </footer>
      </div>
    </div>
  )
}
