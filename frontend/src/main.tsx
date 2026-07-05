import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { DashboardProvider } from './context/DashboardContext'
import ErrorBoundary from './components/ErrorBoundary'
import AppRoutes from './Routes'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <DashboardProvider>
          <AppRoutes />
          <Toaster
            position="bottom-left"
            toastOptions={{
              style: {
                background: '#070B14',
                color: '#F8FAFC',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                backdropFilter: 'blur(12px)',
                fontSize: '11px',
                fontWeight: 500,
              },
              success: {
                iconTheme: { primary: '#10B981', secondary: '#F8FAFC' },
                style: { background: 'rgba(16,185,129,0.9)', color: 'white' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' },
                style: { background: 'rgba(239,68,68,0.9)', color: 'white' },
              },
            }}
          />
        </DashboardProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
