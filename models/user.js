const { randomUUID } = require('crypto');

function createUser({ username, email, passwordHash }) {
  return {
    id: randomUUID(),
    username,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createUser };

