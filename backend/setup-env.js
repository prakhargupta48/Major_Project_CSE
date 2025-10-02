const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

// Check if .env file already exists
if (fs.existsSync(envPath)) {
  console.log('.env file already exists. Skipping creation.');
  process.exit(0);
}

// Default environment variables
const envContent = `# MongoDB Connection String
MONGO_URI=mongodb://localhost:27017/route-optimization

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Environment
NODE_ENV=development
`;

// Write .env file
fs.writeFileSync(envPath, envContent);

console.log('.env file created successfully!');
console.log('Please update the values according to your setup:');
console.log('- MONGO_URI: Your MongoDB connection string');
console.log('- JWT_SECRET: A secure random string for JWT signing');
console.log('- PORT: The port your server should run on');
