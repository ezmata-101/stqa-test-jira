const express = require('express');
const router = express.Router({ mergeParams: true });
const store = require('../store');
const { authenticate } = require('../middleware/auth');
const { createComment } = require('../models/comment');

function buildTree(comments, parentId = null) {
  return comments
    .filter(c => c.parentCommentId === parentId)
    .map(c => ({ ...c, replies: buildTree(comments, c.id) }));
}

router.post('/', authenticate, (req, res) => {
  const issue = store.issues.find(i => i.id === req.params.issueId);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const { body, parentCommentId = null } = req.body;
  if (!body) return res.status(400).json({ error: 'body is required' });

  const comment = createComment({ issueId: issue.id, authorId: req.user.id, body, parentCommentId });
  store.comments.push(comment);
  return res.status(201).json(comment);
});

router.get('/', authenticate, (req, res) => {
  const issue = store.issues.find(i => i.id === req.params.issueId);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const comments = store.comments.filter(c => c.issueId === issue.id);
  return res.json(buildTree(comments));
});

module.exports = router;

