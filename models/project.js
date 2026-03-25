const { randomUUID } = require('crypto');

function createProject({ name, creatorId, teamId = null }) {
  return {
    id: randomUUID(),
    name,
    creatorId,
    teamId,
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createProject };

