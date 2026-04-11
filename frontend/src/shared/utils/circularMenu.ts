/**
 * circularMenu.ts - Utilidades matematicas pa calcular posiciones circulares
 * Funciones de geometria pa el menu radial 2D
 * Convierte coordenadas polares a cartesianas y genera arcos SVG
 */


// Interface pa punto en 2D (coordenadas cartesianas)
export interface Point2D {
  x: number  // posicion horizontal
  y: number  // posicion vertical
}


/** Convierte coordenadas polares a cartesianas
  * @param cx - centro X del circulo
  * @param cy - centro Y del circulo
  * @param r - radio (distancia desde el centro)
  * @param angRad - angulo en radianes (0 = derecha, π/2 = abajo)
  * @returns punto {x, y} en coordenadas cartesianas */
export function polar(cx: number, cy: number, r: number, angRad: number): Point2D {
  return {
    x: cx + r * Math.cos(angRad),  // proyeccion en eje X
    y: cy + r * Math.sin(angRad),  // proyeccion en eje Y
  }
}


/** Genera path SVG de un arco circular
  * @param cx - centro X del circulo
  * @param cy - centro Y del circulo
  * @param r - radio del arco
  * @param startRad - angulo inicial en radianes
  * @param endRad - angulo final en radianes
  * @returns string del path SVG (comando 'A' pa arcos) */
export function arcPath(
  cx: number, 
  cy: number, 
  r: number, 
  startRad: number, 
  endRad: number
): string {
  // Calculamos punto inicial y final del arco
  const s = polar(cx, cy, r, startRad)
  const e = polar(cx, cy, r, endRad)
  
  // Delta: diferencia angular (+ = sentido horario, - = antihorario)
  const delta = endRad - startRad
  
  // Large arc flag: 1 si el arco es > 180°, 0 si es < 180°
  const large = Math.abs(delta) > Math.PI ? 1 : 0
  
  // Sweep flag: direccion del arco (1 = horario, 0 = antihorario)
  const sweep = delta >= 0 ? 1 : 0
  
  // Path SVG: M = move to, A = arc to
  // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} ${sweep} ${e.x} ${e.y}`
}


/** Calcula el angulo en radianes pa un indice en el menu circular
  * @param index - indice del elemento (0, 1, 2, ...)
  * @param total - cantidad total de elementos
  * @param offsetRad - offset inicial en radianes (default: -π/2 pa empezar arriba)
  * @returns angulo en radianes */
export function getAngleForIndex(
  index: number, 
  total: number, 
  offsetRad: number = -Math.PI / 2
): number {
  // Dividimos el circulo en sectores iguales
  const step = (Math.PI * 2) / total
  return index * step + offsetRad
}


/** Calcula posicion cartesiana de un elemento en el menu circular
  * @param index - indice del elemento
  * @param total - cantidad total de elementos
  * @param radius - radio del circulo
  * @param centerX - centro X del circulo
  * @param centerY - centro Y del circulo
  * @returns punto {x, y} donde colocar el elemento */
export function getPositionForIndex(
  index: number,
  total: number,
  radius: number,
  centerX: number = 0,
  centerY: number = 0
): Point2D {
  const angle = getAngleForIndex(index, total)
  return polar(centerX, centerY, radius, angle)
}
