import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthContextProvider } from './store/AuthContext'
import { NotificationContextProvider } from './store/NotificationContext'
import ToastContainer from './components/ui/ToastContainer'
import ErrorBoundary from './components/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthContextProvider>
        <NotificationContextProvider>
          <App />
          <ToastContainer />
        </NotificationContextProvider>
      </AuthContextProvider>
    </ErrorBoundary>
  </StrictMode>,
)
