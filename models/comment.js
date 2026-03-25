const { randomUUID } = require('crypto');

function createComment({ issueId, authorId, body, parentCommentId = null }) {
  return {
    id: randomUUID(),
    issueId,
    authorId,
    body,
    parentCommentId,
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createComment };
