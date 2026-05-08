# Social Chat Service (REST) — Integración

Este servicio implementa un chat REST con:
- DM (1–1): crear/obtener conversación, enviar mensajes, leer mensajes
- Listado de conversaciones (sidebar) con preview del último mensaje
- Paginación de mensajes por cursor (id)

## 1) Variables / configuración

### Docker (runtime dentro de contenedores)
El servicio recibe estas variables por `docker-compose.yml`:

- `PORT` (ej. 8890): puerto donde escucha el servicio
- `DATABASE_URL`: conexión Postgres dentro de Docker
  - Debe apuntar a `db:5432` (NO `localhost`)

Ejemplo:
`DATABASE_URL=postgresql://trans_user:trans_pass@db:5432/transcendence?schema=public`

### Local (terminal / desarrollo)
Para ejecutar comandos de Prisma desde tu máquina:
- Usar `.env.example` -> `.env` en `social-chat/back/content/`
- Ahí la URL suele ser `localhost:5432` (porque el puerto está expuesto)

## 2) Sustituciones pendientes (cuando haya Auth real)

Actualmente el servicio usa un header temporal:
- `x-user-id: <id>`

### Cambios cuando haya Auth:
- Reemplazar `getUserId(req)` (que lee `x-user-id`)
- Por el id real de auth (ej: `req.user.id` o `req.session.userId`)

✅ Objetivo: NO cambiar la lógica del chat; solo cómo obtenemos el usuario actual.

## 3) Datos que necesito recibir de otros módulos

### Del módulo Auth/Users (compañero)
Necesario para integración final:
- Forma de obtener el usuario logueado (ej: `req.user.id`)
- Tipo y formato del ID (String o Int)
- Campos públicos para UI:
  - `username` o `displayName`
  - `avatarUrl` (si existe)

Recomendado: exponer un DTO público (lo que el front necesita mostrar):
`{ id, username/displayName, avatarUrl }`

### Del Frontend (compañero)
Decidir:
- Cómo mostrará nombres/avatares (si consume `/users/:id` o si se añade un endpoint de “resolve users”)
- Paginación / scroll (usa `nextCursor` que devuelve el backend)
- Si quiere polling (REST) o WS más adelante

## 4) Lo que este servicio envía al Front (API REST)

### Health
GET `/chat/ping`
Response:
`{ ok: true, service: "social-chat" }`

### Crear/obtener DM
POST `/chat/dm`
Headers: `x-user-id: "1"`
Body: `{ "otherUserId": "2" }`
Response:
- `{ conversationId: 1, created: true }` o
- `{ conversationId: 1, created: false }`

### Enviar mensaje
POST `/chat/conversations/:id/messages`
Headers: `x-user-id`
Body: `{ "content": "hola" }`
Response:
`{ id, conversationId, senderId, content, createdAt }`

### Leer mensajes (paginado)
GET `/chat/conversations/:id/messages?limit=50&cursor=<id>`
Headers: `x-user-id`
Response:
`{ messages: [...], nextCursor: <id|null> }`

### Listar conversaciones (sidebar)
GET `/chat/conversations`
Headers: `x-user-id`
Response:
`{ conversations: [ { id, type, members, otherUserIds, lastMessage, createdAt, updatedAt } ] }`

### Abrir conversación (info + mensajes)
GET `/chat/conversations/:id?limit=50&cursor=<id>`
Headers: `x-user-id`
Response:
`{ conversation: {...}, messages: [...], nextCursor }`

## 5) Qué falta para “servicio operativo e integrable”

### Imprescindible
- Sustituir `x-user-id` por Auth real (cuando exista)
- Resolver datos de usuario para UI (username/avatar):
  - opción A: front llama al servicio users
  - opción B: endpoint extra en chat: `/chat/users/resolve?ids=1,2,3`

### Recomendado para MVP sólido
- Endpoint `GET /chat/conversations/:id/members` (si el front lo necesita)
- Manejo de errores más fino (códigos y mensajes consistentes)
- Documentación de pruebas (curl / postman)

### Para módulos futuros
- Grupos (GROUP): crear grupo, añadir miembros, roles
- Amigos: tabla Friendship + reglas (solo chatear si amigos)
- Tiempo real (WS): emitir `message:new` al crear un mensaje