"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/AuthPages.css"

const SignUpPage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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

    if (!formData.name) {
      newErrors.name = "Name is required"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
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
      // const response = await fetch('http://localhost:5000/api/auth/register', {
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
      //   setErrors({ general: data.message || 'Registration failed' });
      // }

      // Simulate successful registration for demo
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
          <h1>Create an account</h1>
          <p>Enter your information to create an account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && <div className="error-message">{errors.general}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

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
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? "error" : ""}
            />
            {errors.phone && <div className="error-message">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
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
                <i className="fas fa-spinner fa-spin"></i> Creating account
              </>
            ) : (
              "Create account"
            )}
          </button>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUpPage

