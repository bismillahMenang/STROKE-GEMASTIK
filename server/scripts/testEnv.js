const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Never print secret values; only report whether required variables exist.
const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  console.log(`${key}: ${process.env[key] ? 'set' : 'MISSING'}`);
}
