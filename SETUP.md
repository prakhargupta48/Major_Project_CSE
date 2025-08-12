# Route Optimization Application Setup Guide

This guide will help you set up and run the Route Optimization application for capacitated vehicles.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Quick Setup

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   npm run setup
   ```
   This will create a `.env` file with default values. Edit the `.env` file to match your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/route-optimization
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   PORT=5000
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm run server
   ```
   The server will start on `http://localhost:5000`

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```
   The application will open in your browser at `http://localhost:3000`

## Database Setup

### MongoDB Local Installation

1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Create a database named `route-optimization`

### MongoDB Atlas (Cloud)

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and update the `MONGO_URI` in your `.env` file

## Application Features

### Authentication
- User registration and login
- JWT-based authentication
- Protected routes

### Vehicle Management
- Add, edit, and delete vehicles
- Set vehicle capacity and count
- Configure maximum distance

### Location Management
- Add locations with coordinates
- Mark locations as depot or destination
- Set demand for each location

### Route Optimization
- Create optimizations using selected vehicles and locations
- View optimized routes on an interactive map
- Track total distance and duration

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth` - Get current user (protected)

### Vehicles
- `GET /api/vehicles` - Get all vehicles (protected)
- `GET /api/vehicles/:id` - Get vehicle by ID (protected)
- `POST /api/vehicles` - Create vehicle (protected)
- `PUT /api/vehicles/:id` - Update vehicle (protected)
- `DELETE /api/vehicles/:id` - Delete vehicle (protected)

### Locations
- `GET /api/locations` - Get all locations (protected)
- `GET /api/locations/:id` - Get location by ID (protected)
- `POST /api/locations` - Create location (protected)
- `PUT /api/locations/:id` - Update location (protected)
- `DELETE /api/locations/:id` - Delete location (protected)

### Optimizations
- `GET /api/optimization` - Get all optimizations (protected)
- `GET /api/optimization/:id` - Get optimization by ID (protected)
- `POST /api/optimization` - Create optimization (protected)
- `DELETE /api/optimization/:id` - Delete optimization (protected)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check your connection string in `.env`
   - Verify network connectivity

2. **JWT Token Issues**
   - Ensure `JWT_SECRET` is set in `.env`
   - Check token expiration (default: 5 days)

3. **CORS Errors**
   - Backend is configured to allow all origins in development
   - Check that frontend is running on the correct port

4. **Map Not Loading**
   - Ensure internet connection for OpenStreetMap tiles
   - Check browser console for errors

### Development Tips

1. **Backend Development**
   - Use `npm run server` for auto-restart on file changes
   - Check server logs for detailed error messages

2. **Frontend Development**
   - Use browser developer tools to debug API calls
   - Check Network tab for failed requests

3. **Database**
   - Use MongoDB Compass for database visualization
   - Monitor database connections and queries

## Production Deployment

### Environment Variables
Update your `.env` file for production:
```env
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-secure-production-jwt-secret
PORT=5000
NODE_ENV=production
```

### Security Considerations
- Use a strong JWT secret
- Enable HTTPS in production
- Set up proper CORS configuration
- Use environment-specific MongoDB connections
- Implement rate limiting
- Add input validation and sanitization

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review server and browser console logs
3. Verify all dependencies are installed correctly
4. Ensure MongoDB is running and accessible
