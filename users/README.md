# MÓDULO DE GESTIÓN DE USUARIOS - FT_TRANSCENDENCE

Tecnologías: Node.js, Fastify, TypeScript, PostgreSQL, Prisma, JWT, bcrypt, Docker

---

## Descripción

Este módulo gestiona todo lo relacionado con los usuarios del proyecto ft_transcendence:
- Registro e inicio de sesión (local y OAuth con la intranet de 42)
- Gestión del perfil (nombre, email, contraseña, avatar, estado (online/offline))
- Gestión de amigos (enviar, aceptar, rechazar y eliminar solicitudes)
- Búsqueda de usuarios

---

## Variables de entorno

Copiar .env.example a .env y rellenar los valores:

BASE DE DATOS: 
    **POSTGRES_USER** - nombre de usuario de PostgreSQL
    **POSTGRES_PASSWORD** — contraseña de PostgreSQL
    **POSTGRES_DB** — nombre de la base de datos
    **DATABASE_URL** — cadena de conexión completa a PostgreSQL (una ruta que combina las 3 anteriores para Prisma)

SEGURIDAD:
    **JWT_SECRET** — clave secreta para firmar los tokens JWT

SERVIDOR:
    **PORT** — puerto del backend (por defecto 3000)

OAUTH 42:
    **FORTY_TWO_CLIENT_ID** — client ID de la aplicación OAuth de 42
    **FORTY_TWO_CLIENT_SECRET** — client secret de la aplicación OAuth de 42
    **FORTY_TWO_REDIRECT_URI** — URL de callback OAuth (https://localhost:8889/api/auth/42/callback)

FRONTEND:
    **FRONTEND_URL** — URL base del frontend (https://localhost:8889)


## Endpoints de la API

Todos los endpoints van prefijados con /api a través del proxy nginx.

### Autenticación

**GET /auth/42** - Iniciar flujo OAuth con la Intranet de 42 (sin auth)
**GET /auth/42/callback** - Callback de OAuth 42, gestionado por el backend (sin auth)
**GET /auth/me** - Validar el token JWT actual (requiere auth)
**POST /users/register** - Registrar un nuevo usuario (sin auth)
**POST /users/login** - Iniciar sesión y obtener token JWT (sin auth)


### Usuarios
**GET /users/:userId** - Obtener perfil de usuario por ID (requiere auth)
**GET /users/search?query=xxx** - Buscar usuarios por nombre o email (sin auth)
**GET /users/filter/online** - Obtener todos los usuarios onlines (requiere auth)
**PUT /users/:userId** - Actualizar nombre, email o contraseña(requiere auth, solo para el propio usuario)
**PUT /users/_userId/status** - Cambiar estado online/offline (requiere auth, solo el propoo usuario)


### Avatar

**GET /users/:userId/avatar** - Obtener la URL del avatar (requiere auth)
**POST /users/:userId/avatar** - subir una nueva imagen de avatar (requiere auth, solo para el propio usuario)
**DELETE /users/:userId/avatar** - Restaurar al avatar por defecto (requiere auth, solo para el propio usuario)


### Amigos

**GET /users/:userId/my_friends** - Listar todos los amigos aceptado (requiere auth)
**GET /users/:userId/pending_requests** - Listar solicitudes pendientes recibidas (requiere auth)
**POST /users/:userId/send_request/:friendId** - Enviar solicitud de amistad (requiere auth)
**POST /users/:userId/accept_request/:friendId** - Aceptar solicitud de amistad (requiere auth)
**DELETE /users/:userId/reject_request/:friendId** - Rechazar solicitud de amistad (rquiere auth)
**DELETE /users/:userId/remove_friend/:friendId** - Eliminar alguien de amigo (requiere auth)


## Como funciona la autencicación

### JWT

1. El usuario hace login con POST /users/login enviando mail y contraseña
2. El backend verifica la contraseña con bcrypt y devuelve un token JWT
3. Ese token hay que enviarlo en cada petición protegida en la cabecera:
    Authorization: Bearer <token>
4. El token expira a los 7 días

### OAuth 42

1. El usuario pulsa "Login 42" y el frontend redirige a GET /api/auth/42
2. El backend redirige a la página OAuth de la Intranet de 42
3. El usuario autoriza la aplicación en la Intranet
4. La Intranet redirige de vuelta a GET /api/auth/42/callback?code=xxx
5. El backend vuelve a llamar a la API de 42 e intercambia el código por un token de acceso 6. El backend vuelve a llamar a la API de 42, ahora con permiso (token) para solicitar los datos del usuario 
7. Si el usuario no existe en la base de datos, se crea automáticamente (busca por email)
8. Se redirige al frontend con el JWT en la URL para que éste lo almacene en el localstorage


## Seguridad implementada

- Las contraseñas se hashean con bcrypt (10 salt rounds)
- La autenticación usa JWT firmado con JWT_SECRET, con expiración de 7 días.
- Cada ruta protegida comprueba que el token pertenece al usuario que hace la petición.
- Los avatares se validan con magic bytes (JPEG, PNG, GIF, WEBP), mínimo 1KB y máximo 5MB.
- Los inputs están validados: nombre (3-20 carácteres), email(formato válido, máximo 254), contraseña(8-64 caracteres, requiere mayúscula y número o carácter especial).
- El archivo .env nunca se sube al respositorio.

## Esquema de base de datos

## Esquema de base de datos

### User
- id (clave primaria, autoincremental)
- name (único, 3-20 carácteres)
- email (único)
- password (hasheada con bcrypt)
- avatar (ruta a la imagen, opcional)
- onlineStatus (booleano, por defecto: false)
- lastConnection (fecha y hora, se actualiza al hacer logout)
- createdAt (fecha y hora de registro)

### Friendship
- id (clave primaria, autoincremental)
- requesterId (Clave Foránea -> User: quien envía la solicitud)
- receiverId (Clave Foránea -> User: quien la recibe)
- status ('pendiente' o 'aceptada')
- createdAt (fecha y hora)

### Relaciones
- **User → Friendship (one-to-many)**
  - Un usuario puede tener múltiples solicitudes enviadas (`sentRequests`)
  - Un usuario puede recibir múltiples solicitudes (`receivedRequests`)
- **Friendship → User (many-to-one)**
  - Cada solicitud tiene un `requester` (quien la envía)
  - Cada solicitud tiene un `receiver` (quien la recibe)

## Funcionalidades implementadas

- Registro de usuarios con validación de campos
- Login con JWT
- Login con OAuth 42
- Edición de perfil (nombre, email, constraseña)
- Subida de avatar con validación de tipo y tamaño
- Estado online/offline con timestamp de última conexión
- Sistema de solicitudes de amistad
- Búsqueda de usuarios por nombre o email
- Rutas protegidas con middleware JWT
- Límite de carácteres en front y back
- Los errores se muestran al usuario