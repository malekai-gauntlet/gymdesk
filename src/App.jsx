import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './components/auth/AuthContext'
import { useAuth } from './components/auth/AuthContext'
import { supabase } from './lib/supabaseClient'
import Login from './components/auth/Login'
import DashboardLayout from './components/dashboard/DashboardLayout'
import LandingPage from './components/LandingPage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<Login />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          />
          {/* Member routes will be added later */}
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
