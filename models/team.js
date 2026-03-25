const { randomUUID } = require('crypto');

function createTeam({ name, leaderId }) {
  return {
    id: randomUUID(),
    name,
    leaderId,
    memberIds: [leaderId],
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createTeam };

