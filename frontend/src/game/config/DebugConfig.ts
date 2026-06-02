// DEBUG CONFIG -- flags de debug pa el motor 3D (cosas de ayuda visual)
// usar solo en dev, antes de production TODO en false

export const DEBUG_CONFIG = {

	showColliders: true, // muestra colliders invisibles en escena (wireframe rojo), pa ver collisions y ajustar sizes/positions, solo visual no afecta game logic

} as const;

// ===== MINI DICCIONARIO =====
// collider -> forma invisible pa detectar colisiones
// wireframe -> malla sin relleno (solo lineas)
