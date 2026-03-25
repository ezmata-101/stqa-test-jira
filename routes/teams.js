const express = require('express');
const router = express.Router();
const store = require('../store');
const { authenticate } = require('../middleware/auth');
const { createTeam } = require('../models/team');
const { isTeamLeader, isTeamMember } = require('../helpers/permissions');

router.post('/', authenticate, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const team = createTeam({ name, leaderId: req.user.id });
  store.teams.push(team);
  return res.status(201).json(team);
});

router.get('/:id', (req, res) => {
  const team = store.teams.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  return res.json(team);
});

router.post('/:id/members', authenticate, (req, res) => {
  const team = store.teams.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  if (!isTeamLeader(team.id, req.user.id))
    return res.status(403).json({ error: 'Only the team leader can add members' });

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  if (isTeamMember(team.id, userId))
    return res.status(409).json({ error: 'User is already a member' });

  team.memberIds.push(userId);
  return res.json(team);
});

router.delete('/:id/members/:userId', authenticate, (req, res) => {
  const team = store.teams.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: 'Team not found' });

  if (!isTeamLeader(team.id, req.user.id))
    return res.status(403).json({ error: 'Only the team leader can remove members' });

  const { userId } = req.params;

  if (userId === team.leaderId)
    return res.status(400).json({ error: 'Cannot remove the team leader' });

  team.memberIds = team.memberIds.filter(id => id !== userId);
  return res.json(team);
});

module.exports = router;
