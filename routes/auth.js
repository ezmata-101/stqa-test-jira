const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const store = require('../store');
const { createUser } = require('../models/user');
const { JWT_SECRET } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'username, email and password are required' });

  if (store.users.find(u => u.email === email))
    return res.status(409).json({ error: 'Email already in use' });

  if (store.users.find(u => u.username === username))
    return res.status(409).json({ error: 'Username already taken' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });


  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser({ username, email, passwordHash });
  store.users.push(user);

  return res.status(201).json({ id: user.id, username: user.username, email: user.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email and password are required' });

  const user = store.users.find(u => u.email === email);
  if (!user)
    return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid)
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({ token });
});

module.exports = router;

