const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../middleware/auth');
const defineModels = require('../models');

const ALLOWED_ADMINS = [
  { email: 'ppatel_be24@thapar.edu', username: 'ppatel_be24', name: 'Pujan Patel' },
  { email: 'yprakash_be24@thapar.edu', username: 'yprakash_be24', name: 'Yash Prakash' },
  { email: 'tkhandelwal_be24@thapar.edu', username: 'tkhandelwal_be24', name: 'Tanishk Khandelwal' },
  { email: 'ryadav3_be24@thapar.edu', username: 'ryadav3_be24', name: 'Rudraksh Yadav' }
];

function getAdminEmails() {
  const envEmails = process.env.ADMIN_EMAILS;
  if (envEmails) {
    return envEmails.split(',').map(e => e.trim().toLowerCase());
  }
  return ALLOWED_ADMINS.map(a => a.email);
}

function getAdminDefaultPasswordHash() {
  const rawPass = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
  return bcrypt.hashSync(rawPass, 10);
}

function getAdminUsers() {
  const defaultHash = getAdminDefaultPasswordHash();
  return ALLOWED_ADMINS.map((admin, idx) => {
    return {
      id: idx + 1,
      name: admin.name,
      email: admin.email.toLowerCase(),
      username: admin.username.toLowerCase(),
      passwordHash: defaultHash,
      role: 'admin'
    };
  });
}

// Initialize default admin users in database with bcrypt hashes
async function seedAdminUsers() {
  try {
    const { User } = defineModels();
    const adminUsers = getAdminUsers();
    for (const admin of adminUsers) {
      const existing = await User.findOne({ where: { email: admin.email } });
      if (!existing) {
        const { id, ...adminData } = admin;
        await User.create(adminData);
      } else {
        await existing.update({ name: admin.name, passwordHash: admin.passwordHash, role: 'admin' });
      }
    }
  } catch (err) {
    console.error('Error seeding admin users:', err);
  }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { identity, password } = req.body;

  if (!identity || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email/username and password.' });
  }

  try {
    const { User } = defineModels();
    const cleanIdentity = identity.trim().toLowerCase();
    const adminUsers = getAdminUsers();
    const defaultHash = getAdminDefaultPasswordHash();

    // Check if the identity matches any allowed email or username
    const matchedAllowedAdmin = adminUsers.find(
      u => u.email === cleanIdentity || u.username === cleanIdentity
    );

    // If identity is not in the allowed list of 4 email IDs / usernames, reject immediately
    if (!matchedAllowedAdmin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Only authorized email IDs can log in.' });
    }

    // Check existing user in DB
    let user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: cleanIdentity },
          { username: cleanIdentity }
        ]
      }
    });

    if (!user) {
      user = matchedAllowedAdmin;
    }

    const targetHash = user?.passwordHash || defaultHash;
    const isValidPassword = password === (process.env.ADMIN_DEFAULT_PASSWORD || 'admin123') || bcrypt.compareSync(password, targetHash);

    if (isValidPassword) {
      const displayName = user ? user.name : matchedAllowedAdmin.name;
      const email = user ? user.email : matchedAllowedAdmin.email;
      const userId = user ? user.id : matchedAllowedAdmin.id;

      const token = jwt.sign(
        { id: userId, name: displayName, email: email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: userId,
          name: displayName,
          email: email,
          role: 'admin'
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ success: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
});

module.exports = { router, seedAdminUsers };
