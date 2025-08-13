import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaMapMarkedAlt, FaRoute, FaChartLine } from 'react-icons/fa';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-400 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar spacer */}
      <div className="pt-6" />

      {/* Hero */}
      <section className="relative">
        <div className="container mx-auto px-6 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-white font-extrabold text-4xl md:text-6xl leading-tight drop-shadow-sm">
                Optimize Your Delivery Routes
              </h1>
              <p className="mt-5 text-white/90 text-lg md:text-xl max-w-xl">
                Save time and fuel by finding the most efficient routes for your fleet. Deliver more with less.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-white text-primary font-semibold px-5 py-3 shadow hover:shadow-lg hover:-translate-y-0.5 transition">
                  Get Started
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center rounded-lg border border-white/70 text-white font-semibold px-5 py-3 hover:bg-white/10 transition">
                  Log In
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] w-full rounded-2xl bg-white/20 backdrop-blur-md shadow-xl border border-white/30 flex items-center justify-center">
                <img src="/images/hero-map.svg" alt="Route Map" className="w-11/12 h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">Why Choose Our Platform?</h2>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow hover:shadow-md transition">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <FaTruck />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fleet Management</h3>
              <p className="text-gray-600 dark:text-gray-300">Easily manage your entire vehicle fleet. Add, edit, and track details.</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow hover:shadow-md transition">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <FaMapMarkedAlt />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Location Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">Add and manage delivery points with an interactive map.</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow hover:shadow-md transition">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <FaRoute />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Route Optimization</h3>
              <p className="text-gray-600 dark:text-gray-300">Advanced algorithms calculate efficient routes that save costs.</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow hover:shadow-md transition">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <FaChartLine />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Performance Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">Track and analyze delivery performance with clear insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">How It Works</h2>
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            {[{
              num: 1, title: 'Add Vehicles', text: 'Enter your vehicle details including capacity and type.'
            }, { num: 2, title: 'Add Locations', text: 'Add delivery locations using our interactive map.' }, { num: 3, title: 'Optimize Routes', text: 'Generate optimized routes with a single click.' }, { num: 4, title: 'Start Delivering', text: 'Follow the optimized routes and save time and fuel.' }].map((s) => (
              <div key={s.num} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">{s.num}</div>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">What Our Customers Say</h2>
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {[
              {
                quote: 'This platform reduced our delivery times by 30% and saved us thousands in fuel costs.',
                author: 'Logistics Manager', company: 'Mid-sized Courier'
              },
              {
                quote: 'The optimization is accurate — we handle more deliveries without adding vehicles.',
                author: 'Operations Director', company: 'Regional Distributor'
              }
            ].map((t, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow">
                <p className="text-gray-700 dark:text-gray-200 italic">“{t.quote}”</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">{t.author.split(' ').map(w => w[0]).slice(0,2).join('')}</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{t.author}</div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Ready to Optimize Your Routes?</h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Join businesses saving time and money with our route optimization platform.
          </p>
          <div className="mt-8">
            <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-primary text-white font-semibold px-6 py-3 shadow hover:bg-primary-600 transition">
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Metrics */}
      <section className="bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{ label: 'Avg. Distance Saved', value: '25%' }, { label: 'On-Time Deliveries', value: '98%' }, { label: 'Users Worldwide', value: '10k+' }, { label: 'Vehicles Optimized', value: '50k+' }].map((m) => (
              <div key={m.label} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center shadow-sm">
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white">{m.value}</div>
                <div className="mt-2 text-gray-600 dark:text-gray-300">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">Built For Your Use Case</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[{ title: 'E-commerce Delivery', text: 'Optimize last-mile deliveries to shorten routes and reduce fuel costs.' }, { title: 'Field Services', text: 'Plan technician routes to cover more appointments with less travel.' }, { title: 'B2B Logistics', text: 'Consolidate pickups and drop-offs with capacity-aware routing.' }].map((u) => (
              <div key={u.title} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white">{u.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{u.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">Integrations</h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300 text-center max-w-2xl mx-auto">Connect with mapping and routing providers to get real-world routes and travel times.</p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 items-center">
            {['OpenStreetMap', 'OSRM', 'Google Maps', 'CSV Import'].map((name) => (
              <div key={name} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center shadow-sm">
                <div className="text-gray-900 dark:text-white font-semibold">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">Simple, Transparent Pricing</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[{ name: 'Starter', price: 'Free', features: ['Up to 50 locations', '1 optimization/day', 'Community support'] }, { name: 'Pro', price: '$29/mo', features: ['Up to 2,000 locations', 'Unlimited optimizations', 'Email support'] }, { name: 'Enterprise', price: 'Contact Us', features: ['Custom limits', 'SLA & SSO', 'Dedicated support'] }].map((p) => (
              <div key={p.name} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow hover:shadow-md transition">
                <div className="text-xl font-bold text-gray-900 dark:text-white">{p.name}</div>
                <div className="mt-2 text-3xl font-extrabold text-primary">{p.price}</div>
                <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                  {p.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-primary text-white font-semibold px-5 py-2.5 shadow hover:bg-primary-600 transition">Choose Plan</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">Frequently Asked Questions</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {[{ q: 'Can I use real road routes?', a: 'Yes. Enable road network to use OSRM. For production, you can host OSRM or use Google Directions.' }, { q: 'Do you support vehicle capacity?', a: 'Yes. Our algorithms are capacity-aware and can handle multiple vehicles.' }, { q: 'Can I export the results?', a: 'Yes. Export JSON and we can add CSV/GPX if needed.' }, { q: 'Is there a free plan?', a: 'Yes. Start with the Starter tier to explore the platform.' }].map((f) => (
              <div key={f.q} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <div className="font-semibold text-gray-900 dark:text-white">{f.q}</div>
                <div className="mt-2 text-gray-600 dark:text-gray-300 text-sm">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-700 dark:text-gray-300">© {new Date().getFullYear()} RouteOptimizer. All rights reserved.</div>
            <div className="flex gap-4 text-sm">
              <Link to="/login" className="text-primary hover:text-primary-600">Login</Link>
              <Link to="/register" className="text-primary hover:text-primary-600">Register</Link>
              <Link to="/settings" className="text-primary hover:text-primary-600">Settings</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;