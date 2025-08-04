const axios = require('axios');

// Test CORS configuration
async function testCORS() {
  const testUrls = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5000',
    'http://localhost:5001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ];

  console.log('🧪 Testing CORS configuration...\n');

  for (const origin of testUrls) {
    try {
      const response = await axios.get('http://localhost:5000/api/health', {
        headers: {
          'Origin': origin
        }
      });
      console.log(`✅ ${origin} - CORS allowed (Status: ${response.status})`);
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${origin} - CORS blocked (Status: ${error.response.status})`);
      } else {
        console.log(`❌ ${origin} - Request failed: ${error.message}`);
      }
    }
  }

  console.log('\n🔍 Testing API endpoints...\n');

  // Test API endpoints
  const endpoints = [
    '/api/health',
    '/api/auth/register',
    '/api/auth/login'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`http://localhost:5000${endpoint}`, {
        headers: {
          'Origin': 'http://localhost:3000'
        }
      });
      console.log(`✅ ${endpoint} - Accessible (Status: ${response.status})`);
    } catch (error) {
      if (error.response) {
        console.log(`❌ ${endpoint} - Error (Status: ${error.response.status})`);
      } else {
        console.log(`❌ ${endpoint} - Failed: ${error.message}`);
      }
    }
  }
}

// Run the test
testCORS().catch(console.error); 