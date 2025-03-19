import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem("token")

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute

