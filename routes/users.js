const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const store = require('../store');
const { authenticate } = require('../middleware/auth');

router.get('/:id', authenticate, (req, res) => {
  const user = store.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { passwordHash, ...safeUser } = user;
  return res.json(safeUser);
});

router.patch('/profile', authenticate, async (req, res) => {
  const user = store.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { username, email, password } = req.body;

  if (username) {
    const taken = store.users.find(u => u.username === username && u.id !== user.id);
    user.username = username;
  }

  if (email) {
    const taken = store.users.find(u => u.email === email && u.id !== user.id);
    if (taken) return res.status(409).json({ error: 'Email already in use' });
    user.email = email;
  }

  if (password) {
    user.passwordHash = await bcrypt.hash(password, 10);
  }

  const { passwordHash, ...safeUser } = user;
  return res.json(safeUser);
});

module.exports = router;

