# 🏓 Transcendence

This project has been created as part of the 42 curriculum by druiz-ca, isra, carlos and juan-ant.

---

## 📋 Descripción

Transcendence es una aplicación web multijugador que incluye gestión de usuarios, chat en tiempo real y un juego de Pong online. Los usuarios pueden registrarse, gestionar su perfil, añadir amigos y jugar partidas en tiempo real.

---

## 🚀 Instrucciones de uso

### Prerrequisitos
- Docker
- Docker Compose

### Ejecutar el proyecto

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd TranscendancePreps

# Copiar variables de entorno
cp .env.example .env

# Levantar todos los servicios
docker-compose up --build
```

### URLs disponibles
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

---

## 👥 Información del Equipo

| Login 42 | Rol | Responsabilidad |
|----------|-----|-----------------|
| druiz-ca | Developer | Módulo de Gestión de Usuarios |
| isra | Developer | Frontend (React + Vite) |
| carlos | Developer | Chat en tiempo real |
| juan-ant | Developer | Juego (Pong) |

> ⚠️ Roles de PO, PM y Tech Lead pendientes de asignar

---

## 🗂️ Gestión del Proyecto

- **Control de versiones:** Git + GitHub
- **Ramas:** `main` (producción), `develop` (desarrollo), `feature/*` (funcionalidades)
- **Comunicación:** Discord + reuniones semanales

---

## 🛠️ Stack Técnico

### Frontend
- **React** + TypeScript + Vite
- CSS propio por página

### Backend
- **Node.js** + Fastify + TypeScript
- JWT para autenticación
- bcrypt para hash de contraseñas

### Base de Datos
- **PostgreSQL** + Prisma ORM

### DevOps
- **Docker** + Docker Compose

---

## 🗄️ Esquema de Base de Datos

```
Usuario
├── id (PK)
├── nombre
├── email (único)
├── password (hasheado con bcrypt)
├── avatar (opcional)
├── estadoOnline (boolean)
├── ultimaConexion
└── createdAt

Amistad
├── id (PK)
├── solicitanteId (FK → Usuario)
├── receptorId (FK → Usuario)
├── estado (PENDIENTE / ACEPTADA / RECHAZADA)
└── createdAt
```

---

## ✅ Lista de Funcionalidades

### Gestión de Usuarios (druiz-ca)
- [x] Registro de usuarios
- [x] Login con JWT
- [x] Editar perfil (nombre, email, contraseña)
- [x] Subir y mostrar avatar
- [x] Estado online/offline
- [x] Sistema de amigos (enviar, aceptar, rechazar solicitudes)
- [x] Búsqueda de usuarios
- [x] Rutas protegidas (requieren autenticación)

### Frontend (isra)
- [ ] Pendiente de documentar

### Chat (carlos)
- [ ] Pendiente de documentar

### Juego (juan-ant)
- [ ] Pendiente de documentar

---

## 📦 Módulos Elegidos

| Módulo | Tipo | Puntos | Responsable |
|--------|------|--------|-------------|
| Gestión Estándar de Usuarios | Mayor | 2 | druiz-ca |
| Pendiente | - | - | - |

> ⚠️ Lista de módulos pendiente de completar con el equipo

**Total puntos actuales: 2 / 14**

---

## 🤖 Uso de IA

Durante el desarrollo se han usado herramientas de IA (GitHub Copilot) para:
- Sugerir estructura de código
- Detectar errores y proponer soluciones
- Generar documentación

Todo el código generado ha sido revisado, entendido y validado por cada miembro del equipo antes de ser integrado.

---

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt** (salt rounds: 10)
- Autenticación con **JWT**
- Variables de entorno en `.env` (nunca en el repositorio)
- Rutas protegidas con middleware de autenticación

---

## 📄 Páginas legales

- [Política de Privacidad](http://localhost:5173/privacidad)
- [Términos de Servicio](http://localhost:5173/terminos)