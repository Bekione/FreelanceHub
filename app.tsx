"use client"

import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthStore } from "./store/auth-store"
import { useThemeStore } from "./store/theme-store"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/toaster"
import LoginPage from "./pages/login"
import DashboardLayout from "./components/layout/dashboard-layout"
import Dashboard from "./pages/dashboard"
import Projects from "./pages/projects"
import Invoices from "./pages/invoices"
import Clients from "./pages/clients"
import Profile from "./pages/profile"

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Page Transition Wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
)

function App() {
  const { theme } = useThemeStore()

  return (
    <ThemeProvider defaultTheme={theme} storageKey="freelancer-theme">
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/login"
                element={
                  <PageTransition>
                    <LoginPage />
                  </PageTransition>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  }
                />
                <Route
                  path="projects"
                  element={
                    <PageTransition>
                      <Projects />
                    </PageTransition>
                  }
                />
                <Route
                  path="invoices"
                  element={
                    <PageTransition>
                      <Invoices />
                    </PageTransition>
                  }
                />
                <Route
                  path="clients"
                  element={
                    <PageTransition>
                      <Clients />
                    </PageTransition>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <PageTransition>
                      <Profile />
                    </PageTransition>
                  }
                />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
