//archivo cn(classname) pra centralizar y estandarizar la forma en que construyren las clases de css en react
// si no existiera cn.ts cada componente utilizaria un clsx distinto (habria conflctos)
import { clsx, type ClassValue } from 'clsx'
//(clsx)-libreria q sirve para construir strings de clase css condicionales
// ClassValue es un tipo de TS que define q cosas acepta clsx(strings, arrays, objm nulls , etc..)
import { twMerge } from 'tailwind-merge'
// twMerge: El cerebro de Tailwind. Entiende que 'p-4' choca con 'p-2' y elimina el conflicto.
// libreia para tailwind css. twMerge analiza las clases y detecta conflictos
// clsx concatena strings y maneja condicionales(ture false), pero no entiende la rules de Tailwind.
    /* Ejemplo:
    * cn('px-2', 'px-4') → 'px-4' (resuelve conflicto)
    * cn('text-red-500', isActive && 'text-blue-500') → condicional
    */


// hacemos export como siempre para exportar y q la fn sea publica; cn(className)
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

//metemos ...inputs(es el array con todos los arg recibidos, los recibe y los guarda en array llamdo inputs.) & ClassValue[]( [] indica que inputs es una lista de arrays.)
//          sta funcion acepta una cantidad infinita de argumentos separados por coma, y todos ellos deben ser compatibles con nombres de clases CSS (strings, objetos, nulls, etc)
// devuelvo una lista de inputs y clsx lso convierte en un string de clases de ccs valido
// twMerger resuelve conflictos de Tailwind.

// . Flujo de datos:
//    A. clsx(inputs) -> Procesa el array. Si hay un 'false' o 'null', lo quita. Une el resto en un string.
//       Resultado inter: "bg-red-500 bg-blue-500" (Aun con conflicto).
//    B. twMerge(...) -> Recibe ese string sucio. Detecta que ambos son colores de fondo.
//       Prioriza el último (la derecha gana). Elimina 'bg-red-500'.
//       Resultado final: "bg-blue-500"


// RESUMEN: clsx decide QUÉ entra (lógica) y twMerge decide QUÉ se queda (limpieza de estilos).