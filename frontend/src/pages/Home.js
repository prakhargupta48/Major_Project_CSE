import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaMapMarkedAlt, FaRoute, FaChartLine } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/Home.css';

const Home = () => {
  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
    });
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 data-aos="fade-up">Optimize Your Delivery Routes</h1>
          <p data-aos="fade-up" data-aos-delay="200">
            Save time and fuel by finding the most efficient routes for your fleet.
            Our advanced algorithm helps you deliver more with less.
          </p>
          <div className="hero-buttons" data-aos="fade-up" data-aos-delay="400">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline">
              Log In
            </Link>
          </div>
          <div className="hero-image" data-aos="zoom-in" data-aos-delay="600">
            <img src="/images/hero-map.svg" alt="Route Map" className="floating" />
          </div>
        </div>
        <div className="wave-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f8f9fa" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 data-aos="fade-up">Why Choose Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card" data-aos="fade-up">
            <div className="feature-icon">
              <FaTruck />
            </div>
            <h3>Fleet Management</h3>
            <p>
              Easily manage your entire vehicle fleet in one place. Add, edit, and track vehicle details.
            </p>
          </div>

          <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
            <div className="feature-icon">
              <FaMapMarkedAlt />
            </div>
            <h3>Location Tracking</h3>
            <p>
              Add and manage delivery locations with our interactive map interface.
            </p>
          </div>

          <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
            <div className="feature-icon">
              <FaRoute />
            </div>
            <h3>Route Optimization</h3>
            <p>
              Our advanced algorithm finds the most efficient routes for your deliveries.
            </p>
          </div>

          <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
            <div className="feature-icon">
              <FaChartLine />
            </div>
            <h3>Performance Analytics</h3>
            <p>
              Track and analyze your delivery performance with detailed reports.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f8f9fa" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,202.7C384,203,480,181,576,165.3C672,149,768,139,864,154.7C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>
        <h2 data-aos="fade-up">How It Works</h2>
        <div className="steps-container">
          <div className="steps">
            <div className="step" data-aos="fade-right">
              <div className="step-number">1</div>
              <h3>Add Your Vehicles</h3>
              <p>Enter your vehicle details including capacity and type.</p>
            </div>
            <div className="step-connector" data-aos="fade-right" data-aos-delay="100"></div>
            <div className="step" data-aos="fade-right" data-aos-delay="200">
              <div className="step-number">2</div>
              <h3>Add Locations</h3>
              <p>Add delivery locations using our interactive map.</p>
            </div>
            <div className="step-connector" data-aos="fade-right" data-aos-delay="300"></div>
            <div className="step" data-aos="fade-right" data-aos-delay="400">
              <div className="step-number">3</div>
              <h3>Optimize Routes</h3>
              <p>Generate optimized routes with a single click.</p>
            </div>
            <div className="step-connector" data-aos="fade-right" data-aos-delay="500"></div>
            <div className="step" data-aos="fade-right" data-aos-delay="600">
              <div className="step-number">4</div>
              <h3>Start Delivering</h3>
              <p>Follow the optimized routes and save time and fuel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" data-aos="fade-up">
        <div className="cta-content">
          <h2>Ready to Optimize Your Routes?</h2>
          <p>Join thousands of businesses that are saving time and money with our route optimization platform.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 data-aos="fade-up">What Our Customers Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card" data-aos="fade-up">
            <div className="testimonial-content">
              <p>"This platform has reduced our delivery times by 30% and saved us thousands in fuel costs."</p>
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar">JD</div>
              <div className="testimonial-info">
                <h4>Er. Devraj Parmar</h4>
                <p>Logistics Manager, Dev_Logisticis Deliveries</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card" data-aos="fade-up" data-aos-delay="100">
            <div className="testimonial-content">
              <p>"The route optimization is incredibly accurate. We've been able to add more deliveries without adding vehicles."</p>
            </div>
            <div className="testimonial-author">
              <div className="testimonial-avatar">JS</div>
              <div className="testimonial-info">
                <h4>Mr. Neerav Modii</h4>
                <p>Operations Director, Adani Logistics</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;