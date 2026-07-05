// One-time helper to generate the ADMIN_PASSWORD_HASH value for .env.
// Usage: node scripts/hashPassword.js "your-chosen-password"
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hashPassword.js "your-chosen-password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('Add this to backend/.env as ADMIN_PASSWORD_HASH:');
console.log(hash);
