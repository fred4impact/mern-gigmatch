const jwt = require('jsonwebtoken');
require('dotenv').config();

// Replace these with real values from your DB for testing
const userId = process.argv[2] || 'YOUR_USER_ID';
const email = process.argv[3] || 'admin@email.com';
const role = process.argv[4] || 'admin';

const secret = process.env.JWT_SECRET || 'your-very-strong-random-secret-key';

const token = jwt.sign(
  {
    id: userId,
    email: email,
    role: role
  },
  secret,
  { expiresIn: '7d' }
);

console.log('Generated JWT token:');
console.log(token); 