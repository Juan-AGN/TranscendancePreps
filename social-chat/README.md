# 💬 Social Chat Service (REST + Realtime-ready)

The **Social Chat service** is an independent microservice of the *ft_transcendence* project responsible for all social communication features, including **direct messages (DMs)**, **group chats**, **message persistence**, **cursor-based pagination**, and **conversation management**.

It is designed as a **standalone backend service** that integrates with:
- the **Users/Auth service** (for identity and authentication)
- the **frontend chat UI** (React-based social interface)
- the **WebSocket notification layer** (for realtime updates)

---

## 🎯 Purpose

The goal of this service is to provide a **scalable, isolated chat system** that supports:

- Private 1-to-1 messaging (DMs)
- Group conversations
- Message history with pagination
- Conversation sidebar (recent activity ordering)
- Online status integration (via Users service)
- Realtime-ready architecture (WebSocket hub integration)

---

## ✨ Core Features

### 👤 Direct Messages (DM)
- Automatically creates or reuses a conversation between two users
- Ensures **no duplicate DM threads**
- Returns a stable `conversationId` for both participants

### 👥 Group Chats
- Create group conversations with a title
- Add or remove members dynamically
- Rename group conversations
- Supports scalable multi-user conversations

### ✉️ Messaging System
- Send messages to any conversation
- Persistent storage via PostgreSQL
- Messages include sender, content, timestamps
- Enforced validation (length limits + safe input handling)

### 📜 Message Pagination
- Cursor-based pagination (`cursor`, `nextCursor`)
- Efficient loading of large conversation histories
- Optimized indexing on `(conversationId, createdAt)`

### 🧭 Conversation Sidebar
- Lists all user conversations
- Sorted by `updatedAt` (recent activity first)
- Includes last message preview (`lastMessage`)
- Supports both DM and group conversations

### 🔐 Access Control (MVP)
- Only **conversation members** can:
  - read messages
  - send messages
  - access conversation data

### 👁️ Conversation State
- Conversations can be hidden per user (soft hide)
- Members remain in DB to preserve history integrity
- Tracks read state via `lastReadMessageId`

---

## ⚡ Realtime Integration (Design)

Although the core service is REST-based, it is designed to integrate with a **WebSocket notification layer**:

- New messages can trigger WS events
- Online status updates are propagated via user service integration
- Multi-tab user sessions are supported
- Chat notifications are handled asynchronously

---

## 🧠 Architecture Overview

The chat service is built as a **fully independent microservice**:

- **Express (Node.js)** → HTTP API layer
- **TypeScript** → Type safety and maintainability
- **Prisma ORM** → Database access layer
- **PostgreSQL** → Persistent storage
- **Docker** → Isolated deployment
- **Docker Compose** → Service orchestration

---

## 🗄️ Data Model (Chat DB)

### Conversation
- Represents a DM or group chat
- Tracks creation and update timestamps

### ConversationMember
- Links users to conversations
- Stores per-user state:
  - `hiddenAt` (soft deletion)
  - `lastReadMessageId` (read tracking)
- Ensures uniqueness per conversation/user pair

### Message
- Stores chat messages
- Indexed for fast retrieval by conversation and time
- Includes sender and content metadata

---

## 🔌 REST API Summary

Base path (internal service):

```
http://social-chat-back:8890/chat
```

### 👤 DM
- `POST /dm` → Create or retrieve DM conversation

### 🧭 Conversations
- `GET /conversations` → Sidebar list
- `GET /conversations/:id` → Open conversation + messages

### ✉️ Messages
- `POST /conversations/:id/messages` → Send message
- `GET /conversations/:id/messages` → Paginated messages

### 👥 Groups
- `POST /groups` → Create group
- `PATCH /groups/:id` → Rename group
- `POST /groups/:id/members` → Add members
- `DELETE /groups/:id/members/:userId` → Remove member

### 👁️ Members
- `GET /conversations/:id/members` → List participants

---

## 🔐 Authentication Model

- Current MVP uses:

```
x-user-id: <userId>
```

- This is a **temporary authentication layer**
- Will be replaced by:
  - JWT (`req.user.id`)
  - or shared Auth middleware from Users service

---

## ⚙️ Environment Configuration

### Docker runtime

```
PORT=8890
CHAT_DATABASE_URL=postgresql://...@db:5432/...
```

### Local development

```
DATABASE_URL=postgresql://user:pass@localhost:5432/chat
```

---

## 🔄 Integration with Other Services

### Users / Auth Service
- Provides identity (`userId`)
- Supplies profile data (username, avatar)
- Manages online status updates

### Frontend
- Consumes REST API for chat UI
- Displays sidebar + messages + group management

### WebSocket Layer (planned / partial)
- Message notifications
- Online presence updates
- Multi-session synchronization

---

## 🚧 Key Design Decisions

- **Microservice isolation** → chat is fully independent from auth/game
- **Prisma ORM** → ensures schema consistency across team
- **Cursor pagination** → scalable message loading
- **Soft delete (hiddenAt)** → preserves message history integrity
- **Member persistence** → avoids data loss in group/DM history
- **Separation of concerns** → REST for persistence, WS for realtime

---

## ⚠️ Known Limitations

- No full realtime message sync over WebSocket yet (partial integration)
- Uses temporary `x-user-id` authentication
- No distributed cache layer (Redis not used)
- Online status depends on external Users service integration

---

## 🧩 Role in ft_transcendence

The Social Chat service is responsible for:

- All **social interaction between users**
- Supporting **game coordination via communication**
- Providing a **persistent communication layer**
- Enabling **future realtime expansion**

It is a **core pillar of the platform's social ecosystem**.