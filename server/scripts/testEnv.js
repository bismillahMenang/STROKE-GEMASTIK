const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('MONGO_URI:', process.env.MONGO_URI);
