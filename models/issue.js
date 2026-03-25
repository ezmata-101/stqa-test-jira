const { randomUUID } = require('crypto');

function createIssue({ projectId, creatorId, title, description, creatorUsername }) {
  return {
    id: randomUUID(),
    projectId,
    creatorId,
    title,
    description,
    status: 'open',
    resolverId: null,
    resolveHistory: [],
    activityLog: [
      { action: 'opened', userId: creatorId, username: creatorUsername, at: new Date().toISOString() }
    ],
    reopenCount: 0,
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createIssue };

