import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import PortfolioPage from './pages/PortfolioPage'
import WatchlistPage from './pages/WatchlistPage'
import SettingsPage from './pages/SettingsPage'
import BillingPage from './pages/BillingPage'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './ProtectedRoute'

export default function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="billing" element={<BillingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}