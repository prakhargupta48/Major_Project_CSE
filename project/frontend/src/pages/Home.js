import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Route Optimization for Capacitated Vehicles</h1>
          <p>
            Optimize your delivery routes, reduce costs, and improve efficiency with our
            advanced route optimization platform.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-truck"></i>
            <h3>Vehicle Management</h3>
            <p>Add, update, and delete vehicle details, including type and capacity.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-map-marker-alt"></i>
            <h3>Location Management</h3>
            <p>Input delivery locations with addresses, demand capacity, and coordinates.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-route"></i>
            <h3>Route Optimization</h3>
            <p>Implementation of a modified Clarke-Wright savings algorithm.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-map"></i>
            <h3>Interactive Map</h3>
            <p>Visualize optimized routes using interactive maps.</p>
          </div>
        </div>
      </div>

      <div className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>User Authentication</h3>
            <p>Sign up or log in securely to access the platform.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Vehicle Input</h3>
            <p>Add vehicle details, including type, capacity, and fleet size.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Location Input</h3>
            <p>Enter delivery locations with demand capacities and coordinates.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Optimization</h3>
            <p>The system processes inputs and applies an optimization algorithm.</p>
          </div>
          <div className="step">
            <div className="step-number">5</div>
            <h3>Route Visualization</h3>
            <p>Optimized routes are displayed on an interactive map.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;