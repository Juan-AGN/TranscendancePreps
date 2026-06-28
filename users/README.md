# USER MANAGEMENT MODULE - FT_TRANSCENDENCE

Technologies: Node.js, Fastify, TypeScript, PostgreSQL, Prisma, JWT, bcrypt, Docker

---

## Description

This module manages everything related to the ft_transcendence project users:
- Registration and login (local and OAuth with the 42 intranet)
- Profile management (name, email, password, avatar, status (online/offline))
- Friend management (send, accept, reject, and remove requests)
- User search

---

## Environment Variables

Copy .env.example to .env and fill in the values:

DATABASE:
- **POSTGRES_USER** - PostgreSQL username
- **POSTGRES_PASSWORD** — PostgreSQL password
- **POSTGRES_DB** — database name
- **DATABASE_URL** — full connection string to PostgreSQL (a URL combining the previous 3 for Prisma)

SECURITY:
- **JWT_SECRET** — secret key for signing JWT tokens

SERVER:
- **PORT** — backend port (default 3000)

OAUTH 42:
- **FORTY_TWO_CLIENT_ID** — client ID of the 42 OAuth application
- **FORTY_TWO_CLIENT_SECRET** — client secret of the 42 OAuth application
- **FORTY_TWO_REDIRECT_URI** — OAuth callback URL (https://localhost:8889/api/auth/42/callback)

FRONTEND:
- **FRONTEND_URL** — base URL of the frontend (https://localhost:8889)

---

## API Endpoints

All endpoints are prefixed with `/api` through the nginx proxy.

### Authentication

- **GET /auth/42** - Start OAuth flow with the 42 Intranet (no auth)
- **GET /auth/42/callback** - OAuth 42 callback, handled by the backend (no auth)
- **GET /auth/me** - Validate the current JWT token (requires auth)
- **POST /users/register** - Register a new user (no auth)
- **POST /users/login** - Log in and get a JWT token (no auth)

### Users

- **GET /users/:userId** - Get user profile by ID (requires auth)
- **GET /users/search?query=xxx** - Search users by name or email (no auth)
- **GET /users/filter/online** - Get all online users (requires auth)
- **PUT /users/:userId** - Update name, email, or password (requires auth, only for the user themselves)
- **PUT /users/:userId/status** - Change online/offline status (requires auth, only the user themselves)

### Avatar

- **GET /users/:userId/avatar** - Get the avatar URL (requires auth)
- **POST /users/:userId/avatar** - Upload a new avatar image (requires auth, only for the user themselves)
- **DELETE /users/:userId/avatar** - Restore the default avatar (requires auth, only for the user themselves)

### Friends

- **GET /users/:userId/my_friends** - List all accepted friends (requires auth)
- **GET /users/:userId/pending_requests** - List pending received requests (requires auth)
- **POST /users/:userId/send_request/:friendId** - Send a friend request (requires auth)
- **POST /users/:userId/accept_request/:friendId** - Accept a friend request (requires auth)
- **DELETE /users/:userId/reject_request/:friendId** - Reject a friend request (requires auth)
- **DELETE /users/:userId/remove_friend/:friendId** - Remove someone as a friend (requires auth)

---

## How Authentication Works

### JWT

1. The user logs in via `POST /users/login` by sending email and password
2. The backend verifies the password with bcrypt and returns a JWT token
3. That token must be sent in every protected request in the header:
   `Authorization: Bearer <token>`
4. The token expires after 7 days

### OAuth 42

1. The user clicks "Login 42" and the frontend redirects to `GET /api/auth/42`
2. The backend redirects to the 42 Intranet OAuth page
3. The user authorizes the application in the Intranet
4. The Intranet redirects back to `GET /api/auth/42/callback?code=xxx`
5. The backend calls the 42 API again and exchanges the code for an access token
6. The backend calls the 42 API again, now with permission (token) to request the user's data
7. If the user doesn't exist in the database, they are created automatically (looked up by email)
8. The user is redirected to the frontend with the JWT in the URL so it can be stored in localStorage

---

## Implemented Security

- Passwords are hashed with bcrypt (10 salt rounds)
- Authentication uses a JWT signed with `JWT_SECRET`, expiring after 7 days
- Each protected route checks that the token belongs to the user making the request
- Avatars are validated by magic bytes (JPEG, PNG, GIF, WEBP), minimum 1KB and maximum 5MB
- Inputs are validated: name (3-20 characters), email (valid format, max 254), password (8-64 characters, requires an uppercase letter and a number or special character)
- The `.env` file is never pushed to the repository

---

## Database Schema

### User
- id (primary key, auto-increment)
- name (unique, 3-20 characters)
- email (unique)
- password (hashed with bcrypt)
- avatar (path to image, optional)
- onlineStatus (boolean, default: false)
- lastConnection (date and time, updated on logout)
- createdAt (date and time of registration)

### Friendship
- id (primary key, auto-increment)
- requesterId (Foreign Key -> User: who sends the request)
- receiverId (Foreign Key -> User: who receives it)
- status ('pending' or 'accepted')
- createdAt (date and time)

### Relationships
- **User → Friendship (one-to-many)**
  - A user can have multiple sent requests (`sentRequests`)
  - A user can receive multiple requests (`receivedRequests`)
- **Friendship → User (many-to-one)**
  - Each request has a `requester` (who sends it)
  - Each request has a `receiver` (who receives it)

---

## Implemented Features

- User registration with field validation
- Login with JWT
- Login with OAuth 42
- Profile editing (name, email, password)
- Avatar upload with type and size validation
- Online/offline status with last-connection timestamp
- Friend request system
- User search by name or email
- Protected routes with JWT middleware
- Character limits on frontend and backend
- Errors are displayed to the user