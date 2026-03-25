const express = require('express');
const router = express.Router();
const store = require('../store');
const { authenticate } = require('../middleware/auth');
const {
  canResolveIssue,
  isIssueCreator,
  isCurrentResolver,
} = require('../helpers/permissions');

function logActivity(issue, action, user) {
  issue.activityLog.push({ action, userId: user.id, username: user.username, at: new Date().toISOString() });
}

router.get('/', authenticate, (req, res) => {
  const { status, creatorId, creatorName, resolverId, resolverName, teamId, teamName } = req.query;

  // Resolve teamId from teamName if needed
  let resolvedTeamId = teamId;
  if (teamName && !teamId) {
    const team = store.teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
    if (!team) return res.json([]);
    resolvedTeamId = team.id;
  }

  // Resolve creatorId from creatorName if needed
  let resolvedCreatorId = creatorId;
  if (creatorName && !creatorId) {
    const user = store.users.find(u => u.username.toLowerCase() === creatorName.toLowerCase());
    if (!user) return res.json([]);
    resolvedCreatorId = user.id;
  }

  // Resolve resolverId from resolverName if needed
  let resolvedResolverId = resolverId;
  if (resolverName && !resolverId) {
    const user = store.users.find(u => u.username.toLowerCase() === resolverName.toLowerCase());
    if (!user) return res.json([]);
    resolvedResolverId = user.id;
  }

  let results = store.issues;

  if (status)             results = results.filter(i => i.status === status);
  if (resolvedCreatorId)  results = results.filter(i => i.creatorId === resolvedCreatorId);
  if (resolvedResolverId) results = results.filter(i => i.resolverId === resolvedResolverId);

  if (resolvedTeamId) {
    const teamProjectIds = new Set(
      store.projects.filter(p => p.teamId === resolvedTeamId).map(p => p.id)
    );
    results = results.filter(i => teamProjectIds.has(i.projectId));
  }

  return res.json(results);
});

router.get('/:id', authenticate, (req, res) => {
  const issue = store.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });
  return res.json(issue);
});

router.patch('/:id/start', authenticate, (req, res) => {
  const issue = store.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  if (!canResolveIssue(issue, req.user.id))
    return res.status(403).json({ error: 'You do not have permission to resolve this issue' });

  issue.status = 'in_progress';
  issue.resolverId = req.user.id;
  issue.resolveHistory.push({
    resolverId: req.user.id,
    resolvedBy: null,
    startedAt: new Date().toISOString(),
    endedAt: null,
    outcome: null,
  });
  logActivity(issue, 'started', req.user);
  return res.json(issue);
});

router.patch('/:id/abandon', authenticate, (req, res) => {
  const issue = store.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  if (issue.status !== 'in_progress')
    return res.status(400).json({ error: 'Only in-progress issues can be abandoned' });

  if (!isCurrentResolver(issue, req.user.id))
    return res.status(403).json({ error: 'Only the current resolver can abandon this issue' });

  const entry = issue.resolveHistory[issue.resolveHistory.length - 1];
  entry.endedAt = new Date().toISOString();
  entry.outcome = 'abandoned';

  issue.status = 'open';
  issue.resolverId = null;
  logActivity(issue, 'abandoned', req.user);
  return res.json(issue);
});

router.patch('/:id/submit', authenticate, (req, res) => {
  const issue = store.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  const entry = issue.resolveHistory[issue.resolveHistory.length - 1];
  entry.resolvedBy = req.user.id;
  entry.endedAt = new Date().toISOString();
  entry.outcome = 'submitted';

  issue.status = 'resolved';
  logActivity(issue, 'submitted', req.user);
  return res.json(issue);
});

router.patch('/:id/accept', authenticate, (req, res) => {
  const issue = store.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  if (!isIssueCreator(issue, req.user.id))
    return res.status(403).json({ error: 'Only the issue creator can accept a solution' });

  const entry = issue.resolveHistory[issue.resolveHistory.length - 1];
  entry.outcome = 'accepted';

  issue.status = 'closed';
  logActivity(issue, 'accepted', req.user);
  return res.json(issue);
});

router.patch('/:id/reopen', authenticate, (req, res) => {
  const issue = store.issues.find(i => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: 'Issue not found' });

  if (!['resolved', 'closed'].includes(issue.status))
    return res.status(400).json({ error: 'Only resolved or closed issues can be reopened' });

  if (!isIssueCreator(issue, req.user.id))
    return res.status(403).json({ error: 'Only the issue creator can reopen an issue' });

  const entry = issue.resolveHistory[issue.resolveHistory.length - 1];
  entry.outcome = 'reopened';

  issue.status = 'open';
  issue.resolverId = null;
  issue.reopenCount += 1;
  logActivity(issue, 'reopened', req.user);
  return res.json(issue);
});

const commentsRouter = require('./comments');
router.use('/:issueId/comments', commentsRouter);

module.exports = router;
