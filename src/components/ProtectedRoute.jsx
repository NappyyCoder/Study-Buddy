import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute() {
  const { user } = useAuth()

  // If there's no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If there is a user, render the child routes
  return <Outlet />
}

export default ProtectedRoute