# Route Optimization Platform  

## 1. Problem Statement and Goals
- Build a full-stack platform to create, visualize, and manage optimized vehicle routes given vehicles, locations, and constraints.
- Goals: minimize total distance/time, respect vehicle capacity, present interactive maps and actionable summaries.

## 2. High-Level Architecture
- Frontend: React (CRA) + React Router + Context API + Tailwind CSS + React Leaflet + Toastify
- Backend: Node.js/Express + MongoDB/Mongoose + JWT Auth
- Data store: MongoDB Atlas/local Mongo
- Mapping: Leaflet (OpenStreetMap tiles). Optional road routing via OSRM (free) or Google Directions (paid).

```
[React UI] --axios--> [Express API] --Mongoose--> [MongoDB]
     |                                        ^
     +--Leaflet/OSM map                        |
     +--Toastify feedback                      |
     +--Tailwind UI                            |
```

## 3. Key Features
- Auth (JWT): register/login/logout, persisted token.
- CRUD: Vehicles, Locations with map support.
- Optimization:
  - Algorithms: Clarke–Wright (enhanced), Nearest Neighbor.
  - Local search refinement: 2-opt and limited 3-opt per route.
  - Capacity-aware, multi-vehicle support; route summaries.
- Visualization:
  - Leaflet map with colored polylines, vehicle start markers, location markers (depot/non-depot).
  - Legend/toggles per route; optional road network (OSRM beta).
- Preferences:
  - Theme (light/dark), default algorithm, preferRoadNetwork.
- Export: JSON export of optimization result.

## 4. Data Model
- User: name, email, password (hashed), preferences (theme, defaultAlgorithm, preferRoadNetwork).
- Vehicle: user, name, capacity, count, maxDistance.
- Location: user, name, address, latitude, longitude, demand, isDepot.
- Optimization:
  - user, name, vehicles [ObjectId], locations [ObjectId]
  - routes: [{ vehicle, vehicleName, stops: [{ locationId, name, lat, lng, demand, order }], distance, duration, totalCapacity }]
  - totalDistance, totalDuration, createdAt/date.

## 5. Backend APIs (selected)
- Auth: POST /api/auth/register, POST /api/auth/login, GET /api/auth, GET/PUT /api/auth/preferences
- Vehicles: CRUD /api/vehicles
- Locations: CRUD /api/locations
- Optimization:
  - GET /api/optimization, GET /api/optimization/:id, POST /api/optimization, DELETE /api/optimization/:id
  - GET /api/optimization/:id/route/:routeIndex/polyline (OSRM)

## 6. Optimization Flow
1) User selects vehicles and locations; submit name and algorithm.
2) Backend fetches vehicles/locations for authenticated user.
3) Depot detection (location with isDepot=true or fallback to first location).
4) Construct initial routes:
   - Clarke–Wright: savings-based merging with endpoint constraints, capacity checks.
   - Nearest Neighbor: greedy fill per vehicle capacity.
5) Local search: 2-opt to remove crossings; limited 3-opt rearrangements; recalc distance/time.
6) Greedy vehicle assignment (largest demand first) and finalize.
7) Persist optimization and return populated result.

## 7. Routing: Straight vs Real Roads
- Straight-line (Haversine) used for distance unless road network is enabled.
- Road network (OSRM beta): For each route, fetch polyline via OSRM; UI draws curved route and displays OSRM total distance/time if available.
- For production, run your own OSRM or use Google Directions API with caching.

## 8. Frontend Design System
- Tailwind CSS for modern responsive UI.
- Toastify for feedback.
- Pages: Home (hero, features, steps, testimonials, metrics, use cases, integrations, pricing, FAQ, footer), Dashboard, Vehicles/VehicleForm, Locations/LocationForm, Optimizations/List/Detail, NewOptimization, Settings.

## 9. State and Data Flow
- Contexts: AuthContext (user, token, preferences), ThemeContext (theme persistence), ToastProvider (toasts).
- Services layer (axios): api.js sets base URL and token header; services encapsulate endpoints.
- Pages fetch data on mount and update state; errors surface via toasts.

## 10. Security
- JWT via x-auth-token header; middleware verifies token and loads req.user.
- All user content is scoped by user id and validated before operations.
- Passwords hashed with bcrypt.

## 11. Testing Strategy (suggested)
- Unit tests: algorithm functions (savings, merges, 2-opt/3-opt), services.
- Integration tests: API endpoints with in-memory Mongo (mongodb-memory-server) or a test DB.
- E2E: Cypress to simulate user flows (login, CRUD, optimize, visualize)

## 12. Performance Considerations
- For large instances, switch heavy computation to a worker process/queue.
- Cache distances between frequent location pairs.
- OSRM segment caching to avoid repeated calls.
- Pagination for lists and virtualized tables for large datasets.

## 13. Scalability and Future Enhancements
- Constraints: time windows, service times, multiple depots, driver shifts.
- Optimization: metaheuristics (Tabu, Simulated Annealing, GA), multi-objective.
- Maps: clustering for dense markers; route editing; export to CSV/GPX.
- Auth: roles, orgs, SSO; rate limiting; CSRF for non-API pages.

## 14. DevOps and Deployment
- Environment via .env: MONGO_URI, JWT_SECRET, PORT.
- Deploy backend on Node host (Heroku/Vercel/Render), Mongo Atlas.
- Frontend as static build served by CDN.
- CI/CD: lint, test, build, deploy.

Prepared by: Devraj Parmar 
Version: Latest