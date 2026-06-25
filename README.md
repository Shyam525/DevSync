<div align="center">

```
██████╗ ███████╗██╗   ██╗███████╗██╗   ██╗███╗   ██╗ ██████╗
██╔══██╗██╔════╝██║   ██║██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝
██║  ██║█████╗  ██║   ██║███████╗ ╚████╔╝ ██╔██╗ ██║██║
██║  ██║██╔══╝  ╚██╗ ██╔╝╚════██║  ╚██╔╝  ██║╚██╗██║██║
██████╔╝███████╗ ╚████╔╝ ███████║   ██║   ██║ ╚████║╚██████╗
╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝
```

### Real-time developer collaboration. Built for engineers who ship.

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.6-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

<br/>

[**Live Demo**](https://devsync.dev) · [**API Docs**](docs/api.md) · [**Architecture**](docs/architecture.md) · [**Report Bug**](issues/new)

<br/>

</div>

---

## What is devSync?

devSync is a **full-stack real-time developer collaboration platform** — the tool your team actually needs when working on code together.

It is not another project management tool. It is built specifically for engineering teams: a Monaco-powered collaborative code editor, a live Kanban board with presence awareness, team chat with file attachments, GitHub integration that streams commits and PRs directly into your workspace, and a static analysis engine that generates live call graphs from your codebase.

Everything is real-time. Every team member's cursor is visible. Every task move is instant. Every GitHub push appears without refreshing.

```
What devSync solves                     What devSync replaces
─────────────────────────────────────   ────────────────────────────────────
"Can you look at this code with me?"    Screen sharing a code editor
"Which PR caused this bug?"             Switching between GitHub and Jira
"Who is working on what right now?"     Daily standups for status updates
"Where did we discuss that decision?"   Searching Slack history for context
```

---

## Features

### 🖊️ Collaborative Code Editor
Monaco Editor (the engine powering VS Code) with multi-cursor support. See your teammates' cursors in real-time as they type. Full syntax highlighting for 30+ languages. Last-writer-wins conflict resolution with Redis pub/sub broadcasting changes across horizontally scaled server instances.

### 📋 Live Kanban Board
Drag-and-drop task management with optimistic UI updates — cards move instantly in your browser while the server confirms in the background. If the server rejects, the card snaps back. All connected team members see every move within 50ms.

### 💬 Team Chat with File Sharing
Persistent chat per project with file attachments stored via GridFS. Typing indicators, read receipts, and paginated history that loads seamlessly as you scroll. Messages are indexed by project and timestamp for sub-millisecond query performance.

### 👥 Real-Time Presence
Know exactly who is in the workspace and which file they are viewing. Presence is powered by Redis with a 30-second TTL heartbeat — if a teammate's browser closes or connection drops, they go offline automatically without relying on disconnect events.

### 🐙 GitHub Integration
Connect your repository and watch commits, pull requests, and issues stream directly into your project's activity feed via webhooks. GitHub events are processed asynchronously through a BullMQ job queue — your API never blocks on webhook processing.

### 🔍 AST Call Graph
Upload a JavaScript or TypeScript file and devSync parses it with Babel into an Abstract Syntax Tree, extracts every function call relationship, and renders it as an interactive D3 force-directed graph. Understand any codebase visually in seconds.

### 🔐 Role-Based Access Control
Four permission tiers: `OWNER` → `ADMIN` → `MEMBER` → `VIEWER`. Enforced at both the HTTP middleware layer and the WebSocket handshake layer. Every API endpoint and every socket event is role-guarded.

---

## Tech Stack

| Layer | Technology | Why this choice |
|-------|-----------|-----------------|
| **Frontend** | React 18 + TypeScript | Concurrent rendering, strict type safety end-to-end |
| **Build** | Vite | 100× faster HMR than CRA, native ESM, optimal bundle splitting |
| **Editor** | Monaco Editor | The same engine as VS Code — full IntelliSense, multi-cursor, 30+ languages |
| **State** | Zustand | 1KB vs Redux's 40KB. No boilerplate. Optimal re-render control |
| **Visualization** | D3.js | Force-directed graphs for call graph rendering |
| **Backend** | Node.js + Express | Non-blocking I/O handles thousands of concurrent WebSocket connections |
| **Language** | TypeScript (full stack) | Single type definition in `shared/` enforces client-server contract at compile time |
| **Real-time** | Socket.IO | Automatic WebSocket → long-polling fallback, built-in rooms and namespaces |
| **Database** | MongoDB 7 + Mongoose | Document model fits naturally for nested project structures and flexible activity payloads |
| **Cache + Pub/Sub** | Redis 7 | Presence TTLs, cross-instance message broadcasting, BullMQ job storage |
| **Queue** | BullMQ | Reliable async processing for emails and webhooks with automatic retries and dead-letter handling |
| **Auth** | JWT (access + refresh) + GitHub OAuth 2.0 | Stateless auth scales horizontally. Refresh token rotation enables multi-device sessions with revocation |
| **Validation** | Zod | Runtime schema validation with automatic TypeScript type inference — single source of truth |
| **Logging** | Pino | 5× faster than Winston. Structured JSON logs in production feed directly into monitoring stacks |
| **Monorepo** | npm Workspaces | Shared TypeScript types between client and server without publishing to npm |
| **Dev Infra** | Docker Compose | One command local environment — MongoDB + Redis + Mailpit, identical versions for every developer |
| **CI/CD** | GitHub Actions | Tests run on every PR. Zero broken code merges to main |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (React + Vite)                      │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Monaco Editor│  │ Kanban Board │  │  Chat + Presence + Feed  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
│         │                 │                         │                │
│  ┌──────▼─────────────────▼─────────────────────────▼─────────────┐ │
│  │              Zustand Stores + Custom Hooks                      │ │
│  └──────────────────────────┬────────────────────────────────────┘ │
│                              │                                       │
│  ┌──────────────────────────▼────────────────────────────────────┐ │
│  │   axiosInstance (REST)           socketClient (WebSocket)      │ │
│  │   ↳ Auth header injection        ↳ JWT auth on handshake       │ │
│  │   ↳ Refresh token interceptor    ↳ Project room isolation      │ │
│  └──────────────────────────┬───────────────┬──────────────────┘  │
└─────────────────────────────┼───────────────┼────────────────────────┘
                               │ HTTPS         │ WSS
┌──────────────────────────────┼───────────────┼────────────────────────┐
│                    SERVER (Node.js + Express + Socket.IO)              │
│                               │               │                       │
│  ┌─────────────────────────── ▼──────────┐   │                       │
│  │  Middleware Chain (HTTP)               │   │                       │
│  │  rateLimiter → requestId → logger      │   │                       │
│  │  → auth → rbac → validate → handler   │   │                       │
│  └────────────────┬───────────────────────┘   │                       │
│                   │                           │                       │
│  ┌────────────────▼──────────┐  ┌────────────▼──────────────────┐   │
│  │    REST Routes (v1)        │  │  Socket.IO Handlers            │   │
│  │  /auth /project /kanban    │  │  ↳ socketAuth (handshake JWT)  │   │
│  │  /chat /file /webhook      │  │  editorHandler kanbanHandler   │   │
│  └────────────────┬───────────┘  │  chatHandler presenceHandler   │   │
│                   │              └────────────┬──────────────────┘   │
│  ┌────────────────▼──────────────────────────▼──────────────────┐   │
│  │                     Service Layer                              │   │
│  │  auth · project · kanban · chat · presence · file · activity  │   │
│  │  webhook · notification · email · collaboration               │   │
│  └──────┬───────────────────────────────────────┬────────────────┘   │
│         │                                       │                     │
│  ┌──────▼───────────┐  ┌────────────────┐  ┌───▼───────────────┐   │
│  │   MongoDB        │  │     Redis       │  │  BullMQ Queues    │   │
│  │  User Project    │  │  Presence TTL   │  │  email.queue      │   │
│  │  Kanban Chat     │  │  Pub/Sub        │  │  webhook.queue    │   │
│  │  Activity File   │  │  Session Cache  │  │  → email.worker   │   │
│  └──────────────────┘  └────────────────┘  │  → webhook.worker │   │
│                                             └───────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Why This Architecture?

**Monorepo with shared types.** A single `packages/shared` package defines every TypeScript interface used by both client and server. When a server response shape changes, TypeScript immediately surfaces the break in the frontend at compile time. Not at runtime. Not discovered by a user.

**Service layer separation.** HTTP routes are thin adapters. They validate input, call a service function, and format a response. All business logic lives in services — testable in complete isolation without Express, without HTTP, without a running server.

**Redis for horizontal scaling.** When a user moves a Kanban card, the Socket.IO handler publishes the event to a Redis pub/sub channel. Every other server instance subscribed to that channel broadcasts the update to its connected clients. The architecture scales to N server instances with zero coordination logic.

**Fail-fast configuration.** Zod validates every environment variable at startup. Missing `MONGO_URI`? The process exits immediately with a clear message before accepting a single connection. Broken config is caught in CI, not discovered by users.

**Async by default.** Webhook processing and email delivery never block request handlers. They are enqueued as BullMQ jobs and processed by separate worker processes with exponential backoff on failure.

---

## Quick Start

**Prerequisites:** Node.js 18+, Docker Desktop

```bash
# 1. Clone and install
git clone https://github.com/yourusername/devsync.git
cd devsync
npm install

# 2. Configure environment
cp packages/server/.env.example packages/server/.env
# Edit packages/server/.env and fill in your JWT secrets
# Generate a secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Start infrastructure
docker-compose up -d

# 4. Start the server
cd packages/server && npm run dev

# 5. Start the client (new terminal)
cd packages/client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — that is it.

> **Health check:** [http://localhost:4000/health](http://localhost:4000/health)
> Should return `{ "status": "ok", "services": { "database": "connected", "redis": "connected" } }`

---

## Project Structure

```
devsync/
├── packages/
│   ├── client/                  # React 18 + TypeScript + Vite
│   │   └── src/
│   │       ├── components/      # Feature components (Editor, Kanban, Chat, Presence...)
│   │       ├── pages/           # Route-level pages (Dashboard, ProjectView, Login...)
│   │       ├── hooks/           # Custom hooks (useSocket, useAuth, usePresence...)
│   │       ├── store/           # Zustand stores (auth, project, kanban, chat, ui)
│   │       ├── lib/             # Singletons (axiosInstance, socketClient)
│   │       └── services/        # API call functions
│   │
│   ├── server/                  # Node.js + Express + Socket.IO + TypeScript
│   │   └── src/
│   │       ├── api/v1/          # HTTP route definitions (thin — no logic)
│   │       ├── services/        # All business logic lives here
│   │       ├── models/          # Mongoose schemas with indexes
│   │       ├── middleware/       # auth, rbac, validate, rateLimiter, requestId, errorHandler
│   │       ├── socket/          # Socket.IO handlers + socketAuth
│   │       ├── errors/          # Custom error hierarchy (AppError → AuthError, etc.)
│   │       ├── validations/     # Zod schemas per domain
│   │       ├── queues/          # BullMQ queue definitions
│   │       ├── workers/         # BullMQ worker processors
│   │       ├── config/          # env.ts (Zod-validated), db.ts, redis.ts, oauth.ts
│   │       └── logger/          # Pino structured logger
│   │
│   └── shared/                  # TypeScript types + constants (used by both client + server)
│       └── src/
│           ├── types/           # User, Project, Kanban, Chat, Activity, SocketEvents...
│           └── constants/       # Roles, socket event names, HTTP status codes
│
├── scripts/                     # seed.ts, setupDev.ts
├── docs/                        # api.md, socket-events.md, architecture.md
├── docker-compose.yml           # MongoDB + Redis + Mailpit
└── .github/workflows/           # CI on PR, deploy on merge to main
```

---

## API Reference

All endpoints are prefixed with `/api/v1`. Authentication uses Bearer token in the `Authorization` header.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ | Register with email + password |
| `POST` | `/auth/login` | ❌ | Login, receive access + refresh tokens |
| `POST` | `/auth/refresh` | ❌ | Exchange refresh token for new access token |
| `POST` | `/auth/logout` | ✅ | Revoke refresh token for this device |
| `GET`  | `/auth/github` | ❌ | Initiate GitHub OAuth flow |
| `GET`  | `/auth/github/callback` | ❌ | GitHub OAuth callback |
| `GET`  | `/auth/me` | ✅ | Get authenticated user profile |

### Projects

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET`    | `/projects` | MEMBER+ | List all projects for current user |
| `POST`   | `/projects` | ANY | Create a new project |
| `GET`    | `/projects/:id` | VIEWER+ | Get project details |
| `PATCH`  | `/projects/:id` | ADMIN+ | Update project name/description |
| `DELETE` | `/projects/:id` | OWNER | Delete project |
| `POST`   | `/projects/:id/members` | ADMIN+ | Invite member by email |
| `DELETE` | `/projects/:id/members/:userId` | ADMIN+ | Remove member |

### Kanban

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET`    | `/projects/:id/kanban` | VIEWER+ | Get full board with columns and cards |
| `POST`   | `/projects/:id/kanban/cards` | MEMBER+ | Create new card |
| `PATCH`  | `/projects/:id/kanban/cards/:cardId` | MEMBER+ | Update card title/description |
| `POST`   | `/projects/:id/kanban/cards/:cardId/move` | MEMBER+ | Move card to different column |
| `DELETE` | `/projects/:id/kanban/cards/:cardId` | ADMIN+ | Delete card |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | ❌ | Service health — DB + Redis status + uptime |

---

## Real-Time Socket Events

Connect via `socket.io-client` with JWT in the auth handshake:
```javascript
const socket = io('http://localhost:4000', {
  auth: { token: 'your_access_token' }
});
```

### Client → Server (emit)

| Event | Payload | Description |
|-------|---------|-------------|
| `room:join` | `{ projectId }` | Join a project room |
| `room:leave` | `{ projectId }` | Leave a project room |
| `code:change` | `{ projectId, content, language }` | Broadcast editor content change |
| `code:cursor` | `{ projectId, line, column }` | Broadcast cursor position |
| `kanban:card:move` | `{ projectId, cardId, fromColumnId, toColumnId, newOrder }` | Move a card |
| `chat:message` | `{ projectId, content }` | Send a chat message |
| `chat:typing` | `{ projectId, isTyping }` | Broadcast typing indicator |
| `presence:ping` | `{ projectId }` | Heartbeat to maintain online status (every 20s) |

### Server → Client (on)

| Event | Payload | Description |
|-------|---------|-------------|
| `code:change` | `{ userId, content, timestamp }` | Another user changed the editor |
| `code:cursor` | `{ userId, username, avatar, line, column }` | Another user moved their cursor |
| `kanban:card:moved` | `{ cardId, fromColumnId, toColumnId, movedBy }` | Card was moved by someone |
| `chat:message` | `{ message, user }` | New chat message received |
| `chat:typing` | `{ userId, username, isTyping }` | Someone is typing |
| `presence:update` | `{ onlineUsers: User[] }` | Online users list changed |
| `activity:new` | `{ activity }` | New activity in the project feed |

---

## Key Engineering Decisions

### 1. Why two separate JWT secrets?
Access tokens and refresh tokens use different secrets. If an access token secret leaks, an attacker can forge access tokens — but they expire in 15 minutes. If a refresh token secret leaks, tokens can be individually revoked from the `refreshTokens` array in the database. Two secrets limit the blast radius of any single credential compromise.

### 2. Why asyncHandler on every route?
Express 4 does not catch errors thrown from async route handlers. Without `asyncHandler`, an unhandled promise rejection either crashes the process or silently hangs the request. `asyncHandler` wraps every route in a `Promise.resolve().catch(next)` so all async errors flow cleanly to the global error handler.

### 3. Why Zod for environment variable validation?
`process.env` returns `string | undefined` for everything. Without validation, a missing `MONGO_URI` causes a cryptic runtime error the first time a user triggers a database operation — potentially hours after deployment. Zod validates all variables at process startup and throws immediately with the exact missing variable name if any are absent.

### 4. Why embedded documents for Kanban instead of a separate collection?
The most common Kanban operation is "load the full board." With embedded columns and cards, that is one MongoDB query. With a separate `KanbanCard` collection, it requires joining across two collections. Kanban boards rarely exceed 200 cards — well within MongoDB's 16MB document limit — making the read performance of embedding worth the tradeoff.

### 5. Why Redis TTL for presence instead of socket disconnect events?
WebSocket disconnect events are unreliable. A browser tab crash, a network drop, or a mobile app backgrounding does not guarantee a disconnect event fires. Storing presence in Redis keys with a 30-second TTL means a client must actively ping every 20 seconds to stay online. If the ping stops for any reason — clean disconnect, crash, or network failure — the TTL expires and the user appears offline automatically.

---

## Running Tests

```bash
# Unit tests (services in isolation with in-memory MongoDB)
cd packages/server && npm run test:unit

# Integration tests (real Express app with Supertest)
cd packages/server && npm run test:integration

# Socket tests (real Socket.IO client/server)
cd packages/server && npm run test:socket

# All tests
cd packages/server && npm test

# Client component tests
cd packages/client && npm test
```

---

## Seed the Database

```bash
# Creates test users, projects, kanban boards, and chat messages
# Useful for demos and local development
cd packages/server && npx ts-node scripts/seed.ts
```

Default seed credentials:
```
Email:    dev@devsync.com
Password: password123
```

---

## Environment Variables

Full reference at `packages/server/.env.example`.

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `REDIS_URL` | ✅ | Redis connection URL |
| `JWT_ACCESS_SECRET` | ✅ | Min 32 chars. Signs access tokens (15m expiry) |
| `JWT_REFRESH_SECRET` | ✅ | Min 32 chars. Signs refresh tokens (7d expiry) |
| `GITHUB_CLIENT_ID` | GitHub OAuth | From github.com/settings/developers |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth | From github.com/settings/developers |
| `PORT` | ❌ | Default: 4000 |
| `NODE_ENV` | ❌ | development / production. Default: development |

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you want to change.

```bash
# Fork, then clone your fork
git clone https://github.com/yourusername/devsync.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes, write tests
# Run the full test suite
npm test

# Open a PR — CI must pass
```

**Commit format:** `type(scope): description` — e.g. `feat(kanban): add card priority filter`

Types: `feat` `fix` `refactor` `test` `docs` `chore`

---

## Roadmap

- [ ] CRDT-based conflict resolution for simultaneous editor edits
- [ ] Video call integration (WebRTC)
- [ ] Slack notifications via webhook
- [ ] VS Code extension for native editor integration
- [ ] Self-hosted deployment guide (Railway, Render, AWS)
- [ ] Mobile app (React Native)

---

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

Built with obsessive attention to engineering craft.

**[⭐ Star this repo](https://github.com/yourusername/devsync)** if devSync made you think about how to build things better.

</div>
