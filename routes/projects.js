const express = require('express');
const router = express.Router();
const store = require('../store');
const { authenticate } = require('../middleware/auth');
const { createProject } = require('../models/project');
const { createIssue } = require('../models/issue');
const { isTeamMember } = require('../helpers/permissions');

function logActivity(issue, action, user) {
  issue.activityLog.push({ action, userId: user.id, username: user.username, at: new Date().toISOString() });
}

router.post('/', authenticate, (req, res) => {
  const { name, teamId = null } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  if (teamId) {
    const team = store.teams.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (!isTeamMember(teamId, req.user.id))
      return res.status(403).json({ error: 'You must be a member of the team to create a project for it' });
  }

  const project = createProject({ name, creatorId: req.user.id, teamId });
  store.projects.push(project);
  return res.status(201).json(project);
});

router.get('/', authenticate, (req, res) => {
  const { teamId } = req.query;
  const projects = teamId
    ? store.projects.filter(p => p.teamId === teamId)
    : store.projects;
  return res.json(projects);
});

router.get('/:id', authenticate, (req, res) => {
  const project = store.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  return res.json(project);
});

router.post('/:projectId/issues', authenticate, (req, res) => {
  const project = store.projects.find(p => p.id === req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { title, description } = req.body;
  if (!title || !description)
    return res.status(400).json({ error: 'title and description are required' });

  const issue = createIssue({
    projectId: project.id,
    creatorId: req.user.id,
    creatorUsername: req.user.username,
    title,
    description,
  });
  store.issues.push(issue);
  logActivity(issue, 'opened', req.user);
  return res.status(201).json(issue);
});

router.get('/:projectId/issues', authenticate, (req, res) => {
  const project = store.projects.find(p => p.id === req.params.projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const issues = store.issues.filter(i => i.projectId === project.id);
  return res.json(issues);
});

module.exports = router;
