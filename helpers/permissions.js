const store = require('../store');

function isTeamMember(teamId, userId) {
  const team = store.teams.find(t => t.id === teamId);
  return team ? team.memberIds.includes(userId) : false;
}

function isTeamLeader(teamId, userId) {
  const team = store.teams.find(t => t.id === teamId);
  return team ? team.leaderId === userId : false;
}

function canResolveIssue(issue, userId) {
  const project = store.projects.find(p => p.id === issue.projectId);
  if (!project) return false;
  if (project.teamId) {
    return isTeamMember(project.teamId, userId);
  }
  return true;
}

function isIssueCreator(issue, userId) {
  return issue.creatorId === userId;
}

function isCurrentResolver(issue, userId) {
  return issue.resolverId === userId;
}

module.exports = {
  isTeamMember,
  isTeamLeader,
  canResolveIssue,
  isIssueCreator,
  isCurrentResolver,
};

