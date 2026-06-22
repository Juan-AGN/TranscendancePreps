# Social Chat (Chat + Perfiles + Amigos)

## Objetivo
Implementar el módulo **(Major) Interacción de usuarios** del proyecto *ft_transcendence*:
- Chat básico entre usuarios
- Perfiles de usuario
- Sistema de amigos (solicitudes y lista)

La idea es dejar listo el **backend (modelos + API + permisos)** y facilitar la integración con el frontend.

---

## Alcance (MVP)
### 1) Perfiles
- Ver perfil de un usuario (público)
- Editar perfil propio (campos básicos)

### 2) Amigos
- Enviar solicitud de amistad
- Aceptar / rechazar solicitud
- Listar amigos
- Listar solicitudes pendientes (recibidas/enviadas)
- Eliminar amigo (unfriend)

### 3) Chat básico
- Conversaciones 1–1 (DM)
- Enviar mensaje
- Listar conversaciones del usuario
- Listar mensajes de una conversación (con paginación)

---

## Reglas de permisos (resumen)
- **Perfil público**: visible para usuarios autenticados (o público total si el equipo lo decide).
- **Amigos**: solo afecta a los dos usuarios implicados.
- **Chat**:
  - Solo pueden leer/enviar mensajes los miembros de la conversación.
  - Solo permitir crear DM si son amigos.
