import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./App.css"

// Import pages
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignUpPage from "./pages/SignUpPage"
import DashboardPage from "./pages/DashboardPage"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

