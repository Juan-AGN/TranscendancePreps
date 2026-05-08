# 💬 Social Chat Service (REST) — README

Servicio de chat **independiente** para *ft_transcendence*. Incluye **DM (1–1)**, **mensajes**, **paginación**, **sidebar de conversaciones**, **abrir conversación** y **grupos** (crear/añadir/quitar/renombrar). Está preparado para integrarse con el **frontend** y, más adelante, sustituir el sistema temporal `x-user-id` por el **Auth real** del equipo.

---

## ✅ Qué hace este servicio (MVP actual)

### 👤 DM (1–1)
- Crea o recupera una conversación DM entre 2 usuarios.
- Evita duplicados: si ya existe, devuelve el mismo `conversationId`.

### ✉️ Mensajes
- Enviar mensajes a una conversación.
- Leer mensajes con paginación por cursor (`nextCursor`).
- Al enviar mensaje se actualiza `Conversation.updatedAt` para que la lista se ordene por actividad.

### 🧭 Conversaciones (Sidebar)
- Lista las conversaciones del usuario con preview del último mensaje (`lastMessage`).
- Ordena por actividad (`updatedAt`).

### 📂 Abrir conversación
- Devuelve información de la conversación + una “página” de mensajes.
- Soporta paginación con `cursor` y `limit`.

### 👥 Grupos
- Crea conversación tipo `GROUP` con `title`.
- Añade miembros.
- Quita miembros.
- Renombra el grupo.

### 🔐 Permisos (MVP)
- Para ver miembros, leer mensajes o enviar mensajes: **debes ser miembro** de la conversación.

---

## 🧠 Tecnologías usadas (qué es y para qué sirve)

- **Node.js**: ejecuta el backend (servidor).
- **TypeScript (.ts)**: JS con tipos (menos errores). Compila a `dist/`.
- **Express**: framework para crear endpoints REST y responder JSON.
- **HTTP (GET/POST/PATCH/DELETE)**: protocolo cliente-servidor (leer/crear/actualizar/borrar).
- **JSON**: formato clave/valor para requests/responses y configuración (package.json, etc.).
- **PostgreSQL**: base de datos relacional para persistencia (conversaciones/miembros/mensajes).
- **Prisma (ORM)**: puente TS ↔ Postgres (schema, migraciones y consultas).
- **Migraciones**: cambios versionados del esquema de DB (para que todo el equipo tenga lo mismo).
- **Docker**: contenedores reproducibles.
- **Docker Compose**: levanta todo el stack con un comando.
- **Volúmenes**: persisten los datos del Postgres (ej: `db_data`).
- **curl**: pruebas de API desde terminal sin frontend.
- **Variables de entorno (.env / DATABASE_URL)**: config sin hardcodear (DB/puertos).

---

## 🗂️ Estructura del servicio (archivos clave)

- `social-chat/back/Dockerfile` → build de la imagen del servicio.
- `social-chat/back/content/package.json` → dependencias + scripts.
- `social-chat/back/content/tsconfig.json` → compila TS → `dist/`.
- `social-chat/back/content/prisma.config.ts` → config Prisma 7 (datasource.url desde DATABASE_URL).
- `social-chat/back/content/prisma/schema.prisma` → esquema DB (Conversation/ConversationMember/Message).
- `social-chat/back/content/prisma/migrations/` → SQL versionado (se sube a GitHub).
- `social-chat/back/content/src/index.ts` → arranca Express y monta router en `/chat`.
- `social-chat/back/content/src/routes/chat.routes.ts` → endpoints REST del chat.
- `social-chat/back/content/src/prisma.ts` → instancia única PrismaClient (consultas DB).
- `social-chat/back/content/src/utils/getUserId.ts` → usuario actual temporal leyendo `x-user-id`.

---

## ⚙️ Variables de entorno (DB y puertos)

### 🐳 Docker (runtime dentro del contenedor)
En `docker-compose.yml`, el servicio `social-chat-back` debe tener:
- `PORT=8890`
- `DATABASE_URL=postgresql://...@db:5432/...`

✅ Importante: dentro de Docker el host de DB es **db** (no `localhost`).

### 💻 Local (para comandos Prisma desde tu terminal)
En `social-chat/back/content/.env.example` (se sube):
- `DATABASE_URL="postgresql://trans_user:trans_pass@localhost:5432/transcendence?schema=public"`

Cada dev crea su `.env` local (NO se sube):
- `cp .env.example .env`

---

## 🧱 Migraciones (Prisma) — por qué y cómo

### ❓ Por qué hay que migrar
Cambiar `schema.prisma` NO cambia Postgres automáticamente. Las migraciones sincronizan DB real ↔ schema y permiten que todo el equipo tenga la misma estructura.

### 🛠️ Crear una migración nueva (solo quien cambia schema)
- `cd social-chat/back/content`
- `npx prisma migrate dev --name <nombre>`
Esto crea la migración y la aplica en tu DB de desarrollo.

### 🚀 Aplicar migraciones existentes (equipo / docker / evaluación)
- `docker compose exec social-chat-back npx prisma migrate deploy`
Esto NO crea migraciones, solo aplica las existentes.

Migraciones actuales:
- `init_chat` → crea tablas base (Conversation, ConversationMember, Message)
- `add_group_title` → añade `Conversation.title` para grupos

---

## 🔌 API REST (contrato para el frontend)

🟡 Temporal hasta Auth real: se usa header **`x-user-id`** como usuario actual.

### ✅ Header temporal (MVP)
- `x-user-id: "1"`

### 🟢 Health
- `GET /chat/ping`
  Respuesta: `{ "ok": true, "service": "social-chat" }`

### 👤 DM
- `POST /chat/dm`
  Headers: `x-user-id`
  Body: `{ "otherUserId": "2" }`
  Respuesta: `{ "conversationId": 1, "created": true }` o `{ "conversationId": 1, "created": false }`

### 🧭 Sidebar (lista de conversaciones)
- `GET /chat/conversations`
  Headers: `x-user-id`
  Respuesta:
  - `conversations[]` con: `id`, `type`, `title`, `members`, `otherUserIds` (solo DM), `lastMessage`, `updatedAt`, `createdAt`

### 📂 Abrir conversación (info + mensajes)
- `GET /chat/conversations/:id?limit=50&cursor=123`
  Headers: `x-user-id`
  Respuesta:
  - `conversation` (id/type/title/members/otherUserIds/fechas)
  - `messages[]`
  - `nextCursor`

### ✉️ Mensajes
- `POST /chat/conversations/:id/messages`
  Headers: `x-user-id`
  Body: `{ "content": "hola" }`
  Respuesta: `{ id, conversationId, senderId, content, createdAt }`

- `GET /chat/conversations/:id/messages?limit=50&cursor=123`
  Headers: `x-user-id`
  Respuesta: `{ "messages": [...], "nextCursor": <id|null> }`

### 👥 Miembros
- `GET /chat/conversations/:id/members`
  Headers: `x-user-id`
  Respuesta: `{ "conversationId": 1, "members": [ { "userId": "1", "createdAt": "..." }, ... ] }`

### 🧑‍🤝‍🧑 Grupos
- `POST /chat/groups`
  Headers: `x-user-id`
  Body: `{ "title": "Grupo prueba", "memberIds": ["2","3"] }`
  Respuesta: `{ "conversation": { id,type,title,createdAt,updatedAt }, "members": ["1","2","3"] }`

- `POST /chat/groups/:id/members`
  Headers: `x-user-id`
  Body: `{ "memberIds": ["4"] }`
  Respuesta: `{ "conversationId": 1, "added": ["4"] }`

- `PATCH /chat/groups/:id`
  Headers: `x-user-id`
  Body: `{ "title": "Nuevo nombre" }`
  Respuesta: `{ "conversation": { id,type,title,updatedAt } }`

- `DELETE /chat/groups/:id/members/:userId`
  Headers: `x-user-id`
  Respuesta: `{ "conversationId": 1, "removed": "3", "deleted": 1 }`

---

## 🧪 Pruebas rápidas (sin frontend) — con curl

Crear DM:
- `curl -X POST http://localhost:8890/chat/dm -H "Content-Type: application/json" -H "x-user-id: 1" -d '{"otherUserId":"2"}'`

Enviar mensaje:
- `curl -X POST http://localhost:8890/chat/conversations/1/messages -H "Content-Type: application/json" -H "x-user-id: 1" -d '{"content":"hola"}'`

Leer mensajes:
- `curl -H "x-user-id: 2" "http://localhost:8890/chat/conversations/1/messages?limit=50"`

Listar conversaciones (sidebar):
- `curl -H "x-user-id: 1" http://localhost:8890/chat/conversations`

Crear grupo:
- `curl -X POST http://localhost:8890/chat/groups -H "Content-Type: application/json" -H "x-user-id: 1" -d '{"title":"Grupo prueba","memberIds":["2","3"]}'`

Renombrar grupo:
- `curl -X PATCH http://localhost:8890/chat/groups/1 -H "Content-Type: application/json" -H "x-user-id: 1" -d '{"title":"Nuevo nombre"}'`

Quitar miembro:
- `curl -X DELETE http://localhost:8890/chat/groups/1/members/3 -H "x-user-id: 1"`

---

## 🔑 Qué falta para integrar con Auth real (lo importante)

Actualmente el servicio usa `x-user-id` (temporal). Para pasar a Auth real:

1) Sustituir `x-user-id` por el usuario real autenticado.
   - Archivo: `src/utils/getUserId.ts`
   - Ahora: lee header `x-user-id`.
   - Después: leer `req.user.id` (JWT) o `req.session.userId` (sesiones) o lo que defina el módulo de auth.
   ✅ Mantener `getUserId(req)` y cambiar solo su interior.

2) Alinear el tipo de IDs:
   - Ahora `userId` y `senderId` son String en DB.
   - Si el módulo Users usa Int, hay que migrar columnas a Int o acordar IDs string (UUID) en todo el proyecto.

3) Datos para UI (username/avatar):
   - El chat devuelve IDs; el frontend necesita `username`/`avatarUrl`.
   - Opciones:
     A) Front consulta Users: `/users/:id`
     B) Endpoint helper: `GET /chat/users/resolve?ids=1,2,3` → `{id, username, avatarUrl}`

---
