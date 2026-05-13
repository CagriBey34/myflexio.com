-- Create first admin user
-- Run this after creating the database schema

INSERT INTO users (email, password, role, status) 
VALUES ('admin@myflexio.com', '$2a$10$YourHashedPasswordHere', 'admin', 'active');

-- Note: Replace '$2a$10$YourHashedPasswordHere' with an actual bcrypt hash
-- You can generate one using Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your-admin-password', 10);
-- console.log(hash);
