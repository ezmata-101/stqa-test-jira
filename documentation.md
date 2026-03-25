# Jira-Lite — Full API Documentation

## This project has some intentional(!) issues or incomplete features.  

## What It Is

Jira-Lite is a lightweight issue-tracking REST API built with Node.js and Express to be used as a project for Software Testing and Quality Assurance course(s). It models the core workflow of a project management tool: users form teams, teams own projects, projects contain issues, and issues are worked through a defined lifecycle: 
```
open → in progress → resolved → closed → reopened
```
Comments can be left on issues at any stage except closed.

All data is stored in-memory — there is no database. Restarting the server wipes all data.

---

## Tech Stack

| Piece | Detail |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Auth | JWT (jsonwebtoken), 24h expiry |
| Passwords | bcryptjs (10 salt rounds) |
| IDs | `crypto.randomUUID()` |
| Port | `3000` (override with `PORT` env var) |
| JWT Secret | `dev_secret` (override with `JWT_SECRET` env var) |

---

## How to Run

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

```bash
# Production
npm start

# Development (auto-restarts on file changes — requires nodemon)
npm run dev
```

The server will print:
```
Server running on port 3000
```

---

## Authentication

Every endpoint except `POST /auth/register` and `POST /auth/login` requires a Bearer token.

```
Authorization: Bearer <token>
```

Tokens are valid for **24 hours**. A missing, invalid, or expired token returns `401`.
** You may update it in the project to test token expiration.

---

## Data Models

### User
```json
{
  "id": "uuid",
  "username": "alice",
  "email": "alice@example.com",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```
> `passwordHash` exists on the internal object but is **never returned** by any endpoint.

### Team
```json
{
  "id": "uuid",
  "name": "Team Alpha",
  "leaderId": "uuid",
  "memberIds": ["uuid", "uuid"],
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

### Project
```json
{
  "id": "uuid",
  "name": "My Project",
  "creatorId": "uuid",
  "teamId": "uuid | null",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```
> `teamId` is `null` for open projects (anyone can work on issues), or a team ID for team-restricted projects.

### Issue
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "creatorId": "uuid",
  "title": "Something is broken",
  "description": "Full details here",
  "status": "open",
  "resolverId": "uuid | null",
  "resolveHistory": [],
  "activityLog": [],
  "reopenCount": 0,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Issue statuses:** `open` → `in_progress` → `resolved` → `closed`

### Comment
```json
{
  "id": "uuid",
  "issueId": "uuid",
  "authorId": "uuid",
  "body": "Looks like a null pointer",
  "parentCommentId": "uuid | null",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

---

## Issue Lifecycle

```
open ──[start]──► in_progress ──[submit]──► resolved ──[accept]──► closed
  ▲                    │                       │
  └──────[abandon]─────┘                       └──[reopen]──► open
```

| Action | Endpoint | Who can do it |
|---|---|---|
| Create | `POST /projects/:id/issues` | Anyone authenticated |
| Start | `PATCH /issues/:id/start` | Any user (open project) or team member (team project) |
| Abandon | `PATCH /issues/:id/abandon` | Current resolver only |
| Submit | `PATCH /issues/:id/submit` | Current resolver only |
| Accept | `PATCH /issues/:id/accept` | Issue creator only |
| Reopen | `PATCH /issues/:id/reopen` | Issue creator only |

---

## Endpoints

---

### Auth

#### `POST /auth/register`

Register a new user.

**Body:**
```json
{ "username": "alice", "email": "alice@example.com", "password": "pass123" }
```

**Success — 201:**
```json
{
  "id": "a1b2c3d4-...",
  "username": "alice",
  "email": "alice@example.com"
}
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| Missing any field | 400 | `{ "error": "username, email and password are required" }` |
| Email already used | 409 | `{ "error": "Email already in use" }` |
| Username already taken | 409 | `{ "error": "Username already taken" }` |
| Password must be at least 6 characters long | 400 | `{ "error": "Password must be at least 6 characters long" }` |

---

#### `POST /auth/login`

Log in and receive a JWT.

**Body:**
```json
{ "email": "alice@example.com", "password": "pass123" }
```

**Success — 200:**
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| Missing email or password | 400 | `{ "error": "email and password are required" }` |
| Email not found | 401 | `{ "error": "Invalid credentials" }` |
| Wrong password | 401 | `{ "error": "Invalid credentials" }` |

---

### Users

#### `GET /users/:id`

Get a user's public profile.

**Success — 200:**
```json
{
  "id": "a1b2c3d4-...",
  "username": "alice",
  "email": "alice@example.com",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| User not found | 404 | `{ "error": "User not found" }` |

---

#### `PATCH /users/profile`

Update the authenticated user's own profile. All fields are optional.

**Body (any combination):**
```json
{ "username": "alice_new", "email": "new@example.com", "password": "newpass" }
```

**Success — 200:** Returns the updated user object (without `passwordHash`).

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Username taken by another user | 409 | `{ "error": "Username already taken" }` |
| Email taken by another user | 409 | `{ "error": "Email already in use" }` |

---

### Teams

#### `POST /teams`

Create a new team. The authenticated user becomes the leader and first member.

**Body:**
```json
{ "name": "Team Alpha" }
```

**Success — 201:**
```json
{
  "id": "t1t2t3-...",
  "name": "Team Alpha",
  "leaderId": "a1b2c3-...",
  "memberIds": ["a1b2c3-..."],
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Missing name | 400 | `{ "error": "name is required" }` |

---

#### `GET /teams/:id`

Get a team by ID.

**Success — 200:** Returns the team object.

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Team not found | 404 | `{ "error": "Team not found" }` |

---

#### `POST /teams/:id/members`

Add a user to a team. Only the team leader can do this.

**Body:**
```json
{ "userId": "b2c3d4-..." }
```

**Success — 200:** Returns the updated team object with the new member in `memberIds`.

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Team not found | 404 | `{ "error": "Team not found" }` |
| Requester is not the leader | 403 | `{ "error": "Only the team leader can add members" }` |
| Missing userId | 400 | `{ "error": "userId is required" }` |
| Target user not found | 404 | `{ "error": "User not found" }` |
| User already a member | 409 | `{ "error": "User is already a member" }` |

---

#### `DELETE /teams/:id/members/:userId`

Remove a member from a team. Only the team leader can do this.

**Success — 200:** Returns the updated team object.

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Team not found | 404 | `{ "error": "Team not found" }` |
| Requester is not the leader | 403 | `{ "error": "Only the team leader can remove members" }` |
| Trying to remove the leader | 400 | `{ "error": "Cannot remove the team leader" }` |
| User is not a member | 404 | `{ "error": "User is not a member of this team" }` |

---

### Projects

#### `POST /projects`

Create a project. Optionally attach it to a team.

**Body:**
```json
{ "name": "My Project", "teamId": "t1t2t3-..." }
```
> `teamId` is optional. Omit it (or pass `null`) for an open project.

**Success — 201:**
```json
{
  "id": "p1p2p3-...",
  "name": "My Project",
  "creatorId": "a1b2c3-...",
  "teamId": "t1t2t3-...",
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Missing name | 400 | `{ "error": "name is required" }` |
| teamId provided but team not found | 404 | `{ "error": "Team not found" }` |
| teamId provided but requester is not a team member | 403 | `{ "error": "You must be a member of the team to create a project for it" }` |

---

#### `GET /projects`

List all projects, optionally filtered by team.

**Query params (all optional):**

| Param | Description |
|---|---|
| `teamId` | Return only projects belonging to this team |

**Success — 200:** Returns an array of project objects.

---

#### `GET /projects/:id`

Get a single project by ID.

**Success — 200:** Returns the project object.

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Project not found | 404 | `{ "error": "Project not found" }` |

---

#### `POST /projects/:projectId/issues`

Create an issue under a project. Anyone authenticated can do this regardless of team membership.

**Body:**
```json
{ "title": "Login button broken", "description": "Clicking login does nothing on Firefox" }
```

**Success — 201:**
```json
{
  "id": "i1i2i3-...",
  "projectId": "p1p2p3-...",
  "creatorId": "a1b2c3-...",
  "title": "Login button broken",
  "description": "Clicking login does nothing on Firefox",
  "status": "open",
  "resolverId": null,
  "resolveHistory": [],
  "activityLog": [
    { "action": "opened", "userId": "a1b2c3-...", "username": "alice", "at": "2026-01-01T00:00:00.000Z" }
  ],
  "reopenCount": 0,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Project not found | 404 | `{ "error": "Project not found" }` |
| Missing title or description | 400 | `{ "error": "title and description are required" }` |

---

#### `GET /projects/:projectId/issues`

List all issues under a specific project.

**Success — 200:** Returns an array of issue objects.

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Project not found | 404 | `{ "error": "Project not found" }` |

---

### Issues

#### `GET /issues`

List and filter issues across all projects. All query params are optional and can be combined.

**Query params:**

| Param | Description |
|---|---|
| `status` | `open`, `in_progress`, `resolved`, or `closed` |
| `creatorId` | Filter by creator's user ID |
| `creatorName` | Filter by creator's username (case-insensitive) |
| `resolverId` | Filter by current resolver's user ID |
| `resolverName` | Filter by current resolver's username (case-insensitive) |
| `teamId` | Filter by team ID (matches issues whose project belongs to this team) |
| `teamName` | Filter by team name (case-insensitive) |

> If both an ID and a name are provided for the same field (e.g. `creatorId` + `creatorName`), the ID takes precedence.

> `teamId`/`teamName` filtering works by joining through projects — issues do not store a `teamId` directly.

**Success — 200:**
```
GET /issues?status=open&teamName=Team Alpha
```
```json
[
  {
    "id": "i1i2i3-...",
    "projectId": "p1p2p3-...",
    "status": "open",
    ...
  }
]
```

Returns `[]` if no matches or if a name-based filter resolves to an unknown user/team.

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |

---

#### `GET /issues/:id`

Get a single issue by ID.

**Success — 200:** Returns the full issue object including `resolveHistory` and `activityLog`.

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Issue not found | 404 | `{ "error": "Issue not found" }` |

---

#### `PATCH /issues/:id/start`

Start working on an issue. Moves status from `open` → `in_progress`.

- **Open project:** any authenticated user can start.
- **Team project:** only team members can start.

**Success — 200:**
```json
{
  "status": "in_progress",
  "resolverId": "b2c3d4-...",
  "resolveHistory": [
    {
      "resolverId": "b2c3d4-...",
      "resolvedBy": null,
      "startedAt": "2026-01-01T00:00:00.000Z",
      "endedAt": null,
      "outcome": null
    }
  ],
  ...
}
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Issue not found | 404 | `{ "error": "Issue not found" }` |
| Issue is not `open` | 400 | `{ "error": "Only open issues can be started" }` |
| Team project and user is not a member | 403 | `{ "error": "You do not have permission to resolve this issue" }` |

---

#### `PATCH /issues/:id/abandon`

Abandon an in-progress issue. Moves status back to `open`. Only the current resolver can do this.

**Success — 200:**
```json
{
  "status": "open",
  "resolverId": null,
  "resolveHistory": [
    { "outcome": "abandoned", "endedAt": "2026-01-01T00:00:00.000Z", ... }
  ],
  ...
}
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Issue not found | 404 | `{ "error": "Issue not found" }` |
| Issue is not `in_progress` | 400 | `{ "error": "Only in-progress issues can be abandoned" }` |
| Requester is not the current resolver | 403 | `{ "error": "Only the current resolver can abandon this issue" }` |

---

#### `PATCH /issues/:id/submit`

Submit a solution. Moves status from `in_progress` → `resolved`. Only the current resolver can do this.

**Success — 200:**
```json
{
  "status": "resolved",
  "resolveHistory": [
    { "outcome": "submitted", "resolvedBy": "b2c3d4-...", "endedAt": "2026-01-01T00:00:00.000Z", ... }
  ],
  ...
}
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Issue not found | 404 | `{ "error": "Issue not found" }` |
| Issue is not `in_progress` | 400 | `{ "error": "Only in-progress issues can be submitted" }` |
| Requester is not the current resolver | 403 | `{ "error": "Only the current resolver can submit this issue" }` |

---

#### `PATCH /issues/:id/accept`

Accept the submitted solution. Moves status from `resolved` → `closed`. Only the issue creator can do this.

**Success — 200:**
```json
{
  "status": "closed",
  "resolveHistory": [
    { "outcome": "accepted", ... }
  ],
  ...
}
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Issue not found | 404 | `{ "error": "Issue not found" }` |
| Issue is not `resolved` | 400 | `{ "error": "Only resolved issues can be accepted" }` |
| Requester is not the issue creator | 403 | `{ "error": "Only the issue creator can accept a solution" }` |

---

#### `PATCH /issues/:id/reopen`

Reopen a resolved or closed issue. Moves status back to `open`. Only the issue creator can do this.

**Success — 200:**
```json
{
  "status": "open",
  "resolverId": null,
  "reopenCount": 1,
  "resolveHistory": [
    { "outcome": "reopened", ... }
  ],
  ...
}
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Issue not found | 404 | `{ "error": "Issue not found" }` |
| Issue is not `resolved` or `closed` | 400 | `{ "error": "Only resolved or closed issues can be reopened" }` |
| Requester is not the issue creator | 403 | `{ "error": "Only the issue creator can reopen an issue" }` |

---

### Comments

Comments support unlimited nesting. Responses are returned as a tree structure where each comment has a `replies` array containing its children recursively.

#### `POST /issues/:issueId/comments`

Post a comment on an issue. Allowed on `open`, `in_progress`, and `resolved` issues. **Blocked on `closed` issues.**

**Body:**
```json
{
  "body": "I can reproduce this on Chrome too",
  "parentCommentId": "c1c2c3-..."
}
```
> `parentCommentId` is optional. Omit it for a top-level comment.

**Success — 201:**
```json
{
  "id": "c1c2c3-...",
  "issueId": "i1i2i3-...",
  "authorId": "a1b2c3-...",
  "body": "I can reproduce this on Chrome too",
  "parentCommentId": null,
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Issue not found | 404 | `{ "error": "Issue not found" }` |
| Issue is `closed` | 400 | `{ "error": "Cannot comment on closed issues" }` |
| Missing body | 400 | `{ "error": "body is required" }` |
| `parentCommentId` not found | 404 | `{ "error": "Parent comment not found" }` |
| `parentCommentId` belongs to a different issue | 400 | `{ "error": "Parent comment does not belong to this issue" }` |

---

#### `GET /issues/:issueId/comments`

Get all comments for an issue as a nested tree.

**Success — 200:**
```json
[
  {
    "id": "c1c2c3-...",
    "issueId": "i1i2i3-...",
    "authorId": "a1b2c3-...",
    "body": "First comment",
    "parentCommentId": null,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "replies": [
      {
        "id": "c4c5c6-...",
        "body": "Reply to first",
        "parentCommentId": "c1c2c3-...",
        "replies": [
          {
            "id": "c7c8c9-...",
            "body": "Nested reply",
            "replies": []
          }
        ]
      }
    ]
  }
]
```

**Failures:**

| Condition | Status | Response |
|---|---|---|
| No token | 401 | `{ "error": "Missing token" }` |
| Issue not found | 404 | `{ "error": "Issue not found" }` |

---

## Permission Summary

| Action | Requirement |
|---|---|
| Start issue (open project) | Any authenticated user |
| Start issue (team project) | Must be a team member |
| Abandon / Submit issue | Must be the current resolver |
| Accept / Reopen issue | Must be the issue creator |
| Add team member | Must be the team leader |
| Remove team member | Must be the team leader (cannot remove self) |
| Create team project | Must be a member of that team |
| Comment on issue | Any authenticated user (issue must not be closed) |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `JWT_SECRET` | `dev_secret` | Secret used to sign JWTs. **Change this in production.** |

---