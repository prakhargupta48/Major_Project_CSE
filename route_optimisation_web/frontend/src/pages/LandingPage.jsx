import { Link } from "react-router-dom"
import "../styles/LandingPage.css"

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <header className="navbar">
        <div className="container">
          <div className="logo">
            <i className="fas fa-truck"></i>
            <span>RouteOptimizer</span>
          </div>
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <a href="#features">Features</a>
            <a href="#about">About</a>
          </nav>
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-ghost">
              Log in
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1>Optimize Your Fleet Routes with Precision</h1>
                <p>
                  Maximize efficiency, reduce costs, and improve delivery times with our advanced route optimization
                  platform.
                </p>
                <div className="hero-buttons">
                  <Link to="/signup" className="btn btn-primary">
                    Get Started
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                  <a href="#features" className="btn btn-outline">
                    Learn More
                  </a>
                </div>
              </div>
              <div className="hero-image">
                <div className="image-container">
                  <img src="/images/route-map.png" alt="Route Optimization Map" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <div className="container">
            <div className="section-header">
              <div className="badge">Key Features</div>
              <h2>Powerful Route Optimization</h2>
              <p>
                Our platform offers comprehensive tools to optimize your fleet operations and reduce logistics costs.
              </p>
            </div>
            <div className="features-grid">
              <div className="features-column">
                <div className="feature-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <h3>Multi-Destination Planning</h3>
                    <p>
                      Efficiently plan routes with multiple stops while considering vehicle capacity and demand
                      constraints.
                    </p>
                  </div>
                </div>
                <div className="feature-item">
                  <i className="fas fa-truck"></i>
                  <div>
                    <h3>Vehicle Management</h3>
                    <p>Manage your entire fleet with detailed vehicle specifications and capacity planning.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <i className="fas fa-chart-bar"></i>
                  <div>
                    <h3>Performance Analytics</h3>
                    <p>Track and analyze route performance with comprehensive metrics and visualizations.</p>
                  </div>
                </div>
              </div>
              <div className="features-column">
                <div className="feature-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <h3>Time-Based Optimization</h3>
                    <p>Consider time windows and delivery schedules in your route planning for maximum efficiency.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <i className="fas fa-layer-group"></i>
                  <div>
                    <h3>Clarke-Wright Algorithm</h3>
                    <p>Leverage advanced algorithms to find the most efficient routes for your delivery operations.</p>
                  </div>
                </div>
                <div className="feature-item">
                  <i className="fas fa-file-export"></i>
                  <div>
                    <h3>Export & Reporting</h3>
                    <p>Export optimized routes and generate detailed reports for your logistics operations.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="about-section">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <div className="badge">About Us</div>
                <h2>Transforming Logistics with Smart Route Planning</h2>
                <p>
                  RouteOptimizer was built to solve the complex challenges faced by logistics companies. Our platform
                  combines advanced algorithms with an intuitive interface to make route optimization accessible to
                  businesses of all sizes.
                </p>
                <div className="about-buttons">
                  <Link to="/signup" className="btn btn-primary">
                    Get Started
                  </Link>
                  <a href="#contact" className="btn btn-outline">
                    Contact Us
                  </a>
                </div>
              </div>
              <div className="about-details">
                <div className="detail-item">
                  <h3>Our Mission</h3>
                  <p>
                    To empower logistics companies with technology that reduces costs, improves efficiency, and
                    minimizes environmental impact through optimized routing.
                  </p>
                </div>
                <div className="detail-item">
                  <h3>Why Choose Us</h3>
                  <p>
                    Our platform is built by logistics experts who understand the real-world challenges of fleet
                    management and route planning.
                  </p>
                </div>
                <div className="detail-item">
                  <h3>Results</h3>
                  <p>
                    Clients using our platform report an average of 20% reduction in fuel costs and 30% improvement in
                    delivery times.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to optimize your fleet operations?</h2>
              <p>Join thousands of logistics companies already saving time and money with RouteOptimizer.</p>
              <form className="cta-form">
                <input type="email" placeholder="Enter your email" />
                <button type="submit" className="btn btn-primary">
                  Subscribe
                </button>
              </form>
              <p className="terms-text">
                Sign up to get notified about new features. <Link to="/terms">Terms & Conditions</Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <i className="fas fa-truck"></i>
              <span>RouteOptimizer</span>
            </div>
            <p className="copyright">© 2023 RouteOptimizer. All rights reserved.</p>
            <div className="footer-links">
              <Link to="/terms">Terms</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

