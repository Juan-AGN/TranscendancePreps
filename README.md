*This project has been created as part of the 42 curriculum by juan-ant, <login2>, <login3>, <login4>.*

# ft_transcendence

## Description

**Goal:** Build a full-stack web application that combines user authentication, realtime game sessions, and social chat in a multi-service architecture.

**Overview:** This repository contains a multi-service project with:
- a React + TypeScript frontend using Vite, Tailwind CSS, Zustand and Babylon.js for a hybrid UI + 3D experience.
- a Users/Auth backend using Fastify, Prisma/PostgreSQL, JWT and OAuth 42 for registration, login, profiles, avatars and friendships.
- a Social Chat backend using Express, Prisma/PostgreSQL, and WebSocket-ready logic for conversations, messages, groups and pagination.
- a Game backend service with lobby management, game sessions, rules, and realtime WebSocket communication.
- an Nginx reverse proxy that exposes the app over HTTPS.

**Key Features:**
- Local registration/login and OAuth 42 authentication.
- Profile editing, avatar upload, online status, and friends management.
- Chat service with DMs, group chats, messages, and cursor pagination.
- Game lobby management and realtime game logic.
- Docker Compose stack for local development and service orchestration.

## Team Information

### <Name / login1>
- **Role(s):** PO / PM / Tech Lead / Developer
- **Responsibilities:** ...

### <Name / login2>
- **Role(s):**
- **Responsibilities:** ...

### <Name / login3>
- **Role(s):**
- **Responsibilities:** ...

### <Name / login4>
- **Role(s):**
- **Responsibilities:** ...

> Note: with a 4-person team, some members will hold multiple roles (e.g., PM + Developer, PO + Developer). Make sure all of PO, PM/Scrum Master, Tech Lead, and Developer are covered.

## Project Management

- **Work organization / task distribution:** ...
- **Meetings (frequency, format):** ...
- **Project management tools used (GitHub Issues, Trello, etc.):** ...
- **Communication channels (Discord, Slack, etc.):** ...

## Technical Stack

| Layer | Technology | Why we chose it |
|---|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Babylon.js, Zustand | Fast, modern UI with responsive styling and integrated 3D/game view.
| Auth Backend | Fastify, TypeScript, Prisma, PostgreSQL, JWT, bcrypt | Secure user management with typed database access.
| Social Chat | Express, TypeScript, Prisma, PostgreSQL, WebSockets | Independent chat service with REST APIs and realtime support.
| Game Backend | Express, TypeScript, WebSocket | Realtime lobby and game session engine.
| Proxy | Nginx | Secure HTTPS routing and reverse proxy for services.

**Justification for major technical choices:**
- React + Vite provides a fast and flexible frontend development experience.
- Tailwind CSS simplifies responsive styling.
- Babylon.js separates 3D rendering from UI logic.
- Prisma enables schema-driven database development.
- Docker Compose ensures consistent local environments.

## Database Schema

### Users/Auth database
- `User`
  - `id` (primary key, autoincrement)
  - `name` (unique, 3-20 characters)
  - `email` (unique)
  - `password` (hashed with bcrypt)
  - `avatar` (image path, optional)
  - `onlineStatus` (boolean, default: false)
  - `lastConnection` (timestamp, updated on logout)
  - `createdAt` (registration timestamp)
  - `fortyTwoId` (OAuth ID, optional)

- `Friendship`
  - `id` (primary key, autoincrement)
  - `requesterId` (FK → User: sender of friend request)
  - `receiverId` (FK → User: receiver of friend request)
  - `status` (`pending` or `accepted`)
  - `createdAt` (request timestamp)

**User relationships:**
- User can send multiple friend requests (`sentRequests`)
- User can receive multiple friend requests (`receivedRequests`)

### Social Chat database
- `Conversation`
  - `id`
  - `type` (`DM`, `GROUP`)
  - `title`
  - `updatedAt`
  - `createdAt`
- `ConversationMember`
  - `id`
  - `conversationId` (FK → Conversation)
  - `userId`
  - `createdAt`
- `Message`
  - `id`
  - `conversationId` (FK → Conversation)
  - `senderId`
  - `content`
  - `createdAt`

**Relationships:**
- Users can connect through friendships.
- Conversations contain members and messages.
- Groups are represented as conversations with a title and multiple members.

## Instructions

### Prerequisites
- Docker Engine and Docker Compose installed.
- `.env` file created from `.env.example`.
- Optional: Node.js to run individual services locally.

### Setup & Run
```bash
git clone <repo-url>
cd <repo folder>
cp .env.example .env
# fill in required values in .env
docker compose up --build
```

### Environment variables
Required values in `.env`:

**Users/Auth Backend:**
- `POSTGRES_USER` - PostgreSQL username
- `POSTGRES_PASSWORD` - PostgreSQL password
- `POSTGRES_DB` - PostgreSQL database name
- `DATABASE_URL` - Prisma connection string for users DB
- `JWT_SECRET` - Secret key for signing JWT tokens
- `PORT` - Backend port (default 3000)
- `FORTY_TWO_CLIENT_ID` - OAuth 42 application client ID
- `FORTY_TWO_CLIENT_SECRET` - OAuth 42 application secret
- `FORTY_TWO_REDIRECT_URI` - OAuth 42 callback redirect URL
- `FRONTEND_URL` - Base frontend URL

**Social Chat Backend:**
- `CHAT_POSTGRES_USER` - PostgreSQL username for chat database
- `CHAT_POSTGRES_PASSWORD` - PostgreSQL password for chat database
- `CHAT_POSTGRES_DB` - PostgreSQL database name for chat
- `CHAT_DATABASE_URL` - Prisma connection string for chat DB

**General:**
- `NODE_ENV` - Node environment (development/production)

### Access
- Application frontend: `https://localhost:8889`
- Auth backend (internal): `http://backend:3000`
- Social chat backend (internal): `http://social-chat-back:8890`

> Note: Nginx exposes the application on port `8889` and routes traffic to internal services.

## Users/Auth Backend API

**Base path:** `/api/auth/` (routed through Nginx)

### Authentication
- `GET /auth/42` - Initiate 42 OAuth flow (no auth required)
- `GET /auth/42/callback` - 42 OAuth callback handler (no auth required)
- `GET /auth/me` - Validate JWT token (requires auth)
- `POST /users/register` - Register new user (no auth required)
- `POST /users/login` - Login and receive JWT token (no auth required)

### User Profile
- `GET /users/:userId` - Get user profile (requires auth)
- `GET /users/search?query=xxx` - Search users by name or email (no auth required)
- `GET /users/filter/online` - Get all online users (requires auth)
- `PUT /users/:userId` - Update name, email, or password (requires auth, own user only)
- `PUT /users/:userId/status` - Toggle online/offline status (requires auth, own user only)

### Avatar Management
- `POST /users/:userId/avatar` - Upload avatar image (requires auth, own user only)
  - Validation: min 1KB, max 5MB, JPEG/PNG/GIF/WEBP only
- `DELETE /users/:userId/avatar` - Restore default avatar (requires auth, own user only)

### Friends System
- `GET /users/:userId/my_friends` - List all accepted friends (requires auth)
- `GET /users/:userId/pending_requests` - List pending friend requests (requires auth)
- `POST /users/:userId/send_request/:friendId` - Send friend request (requires auth)
- `POST /users/:userId/accept_request/:friendId` - Accept friend request (requires auth)
- `DELETE /users/:userId/reject_request/:friendId` - Reject friend request (requires auth)
- `DELETE /users/:userId/remove_friend/:friendId` - Remove friend (requires auth)

**Input validation:**
- Username: 3-20 characters
- Email: valid format
- Password: 8-64 characters (requires uppercase + number or special character)

## Features List

| Feature | Description | Contributor(s) |
|---|---|---|
| Local and OAuth 42 authentication | Register/login with email/password and 42 OAuth. | druiz-ca |
| Profile and avatar management | Edit profile, upload avatar, update online status. | druiz-ca, cagarci2 |
| Friendship system | Send, accept, reject and remove friends. | druiz-ca |
| Social chat | DM chat. | cagarci2 |
| Game backend | Lobby creation, game session management and realtime gameplay. | juan-ant |
| Dront with reusable assets, consistant styles, translations and 3d graphics | One-command orchestration for all services. | albelope |
| Docker Compose stack | One-command orchestration for all services. | druiz-ca, cagarci2, juan-ant, albelope |

## Modules

| Module | Type (Major/Minor) | Points | Category | Implemented by |
|---|---|---|---|---|
| Framework on frontend and backend | Major | 2 | Web | druiz-ca, cagarci2, juan-ant, albelope |
| Realtime WebSocket communication | Major | 2 | Web | druiz-ca, cagarci2 |
| Social interaction | Minor | 1 | Web | druiz-ca, cagarci2 |
| ORM/database access | Minor | 1 | Web | druiz-ca, cagarci2 |
| Reusable components | Minor | 1 | Web | albelope |
| Multiple languages | Minor | 1 | Accessibility and Internationalization | albelope |
| Aditional browsers | Minor | 1 | Accessibility and Internationalization | albelope |
| Standard user management and authentication | Major | 2 | User Management | druiz-ca |
| OAuth 2.0 | Minor | 1 | User Management | druiz-ca |
| Complete web-based game | Major | 2 | Gaming | juan-ant, albelope |
| Remote players | Major | 2 | Gaming | juan-ant |
| Multiplayer (2+) | Major | 2 | Gaming | juan-ant |
| 3D graphics | Minor | 1 | Gaming | albelope |
| Customization options | Minor | 1 | Gaming | juan-ant |
| Spectator mode | Minor | 1 | Gaming | juan-ant |
| Backend as microservices | Major | 2 | DevOps | druiz-ca, cagarci2, juan-ant, albelope |

**Total points:** 23 / 14 minimum

### Justifications

**Framework on frontend and backend**
- Why we chose it: a modern SPA frontend and distinct backend services allow clean separation of UI, auth, chat, and game logic.
- How it was implemented: React + Vite for the frontend, Fastify for the users service, Express for the social chat and game services, with all services orchestrated via `docker-compose.yml`.

**Realtime WebSocket communication**
- Why we chose it: both game input and chat updates need low-latency transport for a responsive multiplayer experience.
- How it was implemented: `game/back/content/src/index.ts` provides authenticated WebSocket connections for gameplay, and `social-chat/back/content/src/wsHub.ts` provides a WS hub for message notifications.

**Social interaction**
- Why we chose it: social features are central to a game platform and improve player engagement.
- How it was implemented: `social-chat/back/content/src/routes/chat.routes.ts` supports DMs, group conversations, message pagination, and member management.

**ORM/database access**
- Why we chose it: Prisma enforces a shared data model and makes database access safer in TypeScript.
- How it was implemented: Prisma schemas and generated clients in `users` and `social-chat` manage Users, Friendships, Conversations, ConversationMembers, and Messages.

**Reusable components**
- Why we chose it: shared UI components reduce duplication and improve consistency across pages.
- How it was implemented: frontend `shared/components` and `ui2d/components` provide reusable layouts, buttons, and page building blocks used across the app.

**Multiple languages**
- Why we chose it: multilingual support improves accessibility for Spanish, English, and French users.
- How it was implemented: `frontend/src/core/i18n/i18n.ts` loads translations from `locals/en.json`, `locals/es.json`, and `locals/fr.json`.

**Additional browsers**
- Why we chose it: building with standard React, Vite, and web platform APIs increases compatibility across major browsers.
- How it was implemented: the frontend uses standard HTML/CSS and modern JavaScript that is compiled by Vite, supporting modern desktop browser environments.

**Standard user management and authentication**
- Why we chose it: secure account management is required for profile, avatar, and friend features.
- How it was implemented: `users/src/routes/users.ts` provides signup/login, JWT authentication, and protected profile endpoints with bcrypt password hashing.

**OAuth 2.0**
- Why we chose it: 42 OAuth is required by the project and provides a second login method.
- How it was implemented: `users/src/routes/auth.ts` implements the `/auth/42` redirect and `/auth/42/callback` exchange, creating or updating users and issuing JWTs.

**Complete web-based game**
- Why we chose it: a full web game demonstrates the project’s interactive and technical scope.
- How it was implemented: frontend game pages plus backend lobby endpoints allow starting and managing game sessions within the browser.

**Remote players**
- Why we chose it: remote multiplayer is a key part of the game experience.
- How it was implemented: the game backend accepts authenticated remote clients and routes their movement input through a shared lobby manager.

**Multiplayer (2+)**
- Why we chose it: the game must support more than one player to fulfill the multiplayer requirement.
- How it was implemented: lobby endpoints allow players to create/join/leave matches and manage multiple players in a game session.

**3D graphics**
- Why we chose it: 3D presentation adds depth to the game experience and meets the project’s visual requirements.
- How it was implemented: Babylon.js is used in the frontend for the 3D hub and homepage globe.

**Customization options**
- Why we chose it: players should be able to adjust settings for more variety in their games.
- How it was implemented: settings pages are available in the frontend, including `Settings2DPage`, `GameSettings2DPage`, and display settings in the frontend local game and `game/back/content/src/rulesmanager.ts` adds an rulesmanager for a whole world of customization for the remote game.

**Spectator mode**
- Why we chose it: spectator functionality enhances the game experience and supports non-playing observers.
- How it was implemented: the lobbyes of `game/back/content/src/lobbymanager.ts` lensures an working spectators experience via an spectators field in the lobby.

**Backend as microservices**
- Why we chose it: microservices make the app easier to scale and maintain by isolating auth, chat, game, and frontend concerns.
- How it was implemented: `docker-compose.yml` defines separate containers for `frontend`, `backend`, `social-chat-back`, `game-back`, plus dedicated DB services and an Nginx proxy.

## Individual Contributions

### <Name / login1>
- Features/modules implemented: ...
- Challenges faced and how they were overcome: ...

### <Name / login2>
- Features/modules implemented: ...
- Challenges faced and how they were overcome: ...

### <Name / login3>
- Features/modules implemented: ...
- Challenges faced and how they were overcome: ...

### <Name / login4>
- Features/modules implemented: ...
- Challenges faced and how they were overcome: ...

## Resources

- Documentation, articles, tutorials referenced: ...
- **AI usage:** describe which AI tools were used, for which specific tasks/parts of the project, and how.

## Privacy Policy & Terms of Service

- Privacy Policy: link / location (e.g., footer)
- Terms of Service: link / location (e.g., footer)

## Known Limitations

- ...

## License / Credits

- ...
