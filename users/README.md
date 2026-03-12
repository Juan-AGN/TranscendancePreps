# 🏓 Transcendence

This project has been created as part of the 42 curriculum by druiz-ca, isra, carlos and juan-ant.

---

## 📋 Description

Transcendence is a multiplayer web application that includes user management, real-time chat, and an online Pong game. Users can register, manage their profile, add friends, and play matches in real time.

---

## 🚀 Usage Instructions

### Prerequisites
- Docker
- Docker Compose

### Run the project

```bash
# Clone the repository
git clone <repo-url>
cd TranscendancePreps

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up --build
```

### Available URLs
- **Frontend:** http://localhost:5174
- **Backend:** http://localhost:3000

---

## 👥 Team Information

| 42 Login | Role | Responsibility |
|----------|------|----------------|
| druiz-ca | Developer | User Management Module |
| isra | Developer | Frontend (React + Vite) |
| carlos | Developer | Real-time Chat |
| juan-ant | Developer | Game (Pong) |

> ⚠️ PO, PM and Tech Lead roles pending assignment

---

## 🗂️ Project Management

- **Version control:** Git + GitHub
- **Branches:** `main` (production), `develop` (development), `feature/*` (features)
- **Communication:** Discord + weekly meetings

---

## 🛠️ Tech Stack

### Frontend
- **React** + TypeScript + Vite
- Per-page custom CSS

### Backend
- **Node.js** + Fastify + TypeScript
- JWT for authentication
- bcrypt for password hashing

### Database
- **PostgreSQL** + Prisma ORM

### DevOps
- **Docker** + Docker Compose

---

## 🗄️ Database Schema

```
User
├── id (PK)
├── name
├── email (unique)
├── password (hashed with bcrypt)
├── avatar (optional)
├── onlineStatus (boolean)
├── lastConnection
└── createdAt

Friendship
├── id (PK)
├── requesterId (FK → User)
├── receiverId (FK → User)
├── status (PENDING / ACCEPTED / REJECTED)
└── createdAt
```

---

## ✅ Feature List

### User Management (druiz-ca)
- [x] User registration
- [x] Login with JWT
- [x] Edit profile (name, email, password)
- [x] Upload and display avatar
- [x] Online/offline status
- [x] Friend system (send, accept, reject requests)
- [x] User search
- [x] Protected routes (require authentication)

### Frontend (isra)
- [ ] Pending documentation

### Chat (carlos)
- [ ] Pending documentation

### Game (juan-ant)
- [ ] Pending documentation

---

## 📦 Selected Modules

| Module | Type | Points | Owner |
|--------|------|--------|-------|
| Standard User Management | Major | 2 | druiz-ca |
| Pending | - | - | - |

> ⚠️ Module list pending completion with the team

**Current total points: 2 / 14**

---

## 🤖 AI Usage

AI tools (GitHub Copilot) have been used during development to:
- Suggest code structure
- Detect errors and propose solutions
- Generate documentation

All generated code has been reviewed, understood, and validated by each team member before being integrated.

---

## 🔒 Security

- Passwords hashed with **bcrypt** (salt rounds: 10)
- Authentication with **JWT**
- Environment variables in `.env` (never committed to the repository)
- Protected routes with authentication middleware

---

## 📄 Legal Pages

- [Privacy Policy](http://localhost:5174/privacidad)
- [Terms of Service](http://localhost:5174/terminos)