"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/AuthPages.css"

const LoginPage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // In a real app, you would make an API call here
      // const response = await fetch('http://localhost:5000/api/auth/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });

      // const data = await response.json();

      // if (response.ok) {
      //   localStorage.setItem('token', data.token);
      //   navigate('/dashboard');
      // } else {
      //   setErrors({ general: data.message || 'Login failed' });
      // }

      // Simulate successful login for demo
      setTimeout(() => {
        localStorage.setItem("token", "demo-token")
        setIsLoading(false)
        navigate("/dashboard")
      }, 1500)
    } catch (error) {
      setIsLoading(false)
      setErrors({ general: "An error occurred. Please try again." })
    }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="auth-logo">
        <i className="fas fa-truck"></i>
        <span>RouteOptimizer</span>
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <h1>Login</h1>
          <p>Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && <div className="error-message">{errors.general}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            <div className="password-input">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Please wait
              </>
            ) : (
              "Sign in"
            )}
          </button>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

