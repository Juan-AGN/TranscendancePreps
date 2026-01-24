// Helper para las rutas de los assests (models3d)

// export para hacer publica la funcion en other files... 
// getAssetPath(path: string): string
//   - Recibe un argumento 'path' que debe ser texto (string).
//   - Devuelve un valor que tambien sera texto (: string).
export function getAssetPath(path: string): string {

  // Vite maneja automaticamente la carpeta /public.
  // En desarrollo y produccion, los archivos de /public se sirven en la raiz '/'.
  
  // return path.startsWith('/') ? path : `/${path}`
  //   - Logica ternaria (if/else simplificado):
  //   - Pregunta: ¿El texto empieza con una barra '/'?
  //   - Si es VERDAD (?): Devuelve el path tal cual (ej: '/model.glb').
  //   - Si es FALSO (:): Le pega una barra al principio (ej: 'model.glb' -> '/model.glb').
  //   - IMPORTANCIA: Esto evita errores 404. El navegador necesita la barra inicial 
  //     para saber que debe buscar el archivo en la raiz del servidor.
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Lista de modelos 3D del Hub (AUN NO ESTAN SUBIDOS AL REPO!!!)
 */
// export const MODELS = { ... }
//   - Crea un diccionario (objeto) constante llamado MODELS.
//   - Actua como un "indice" o "menu" de todos los objetos 3D disponibles en tu juego.
export const MODELS = {

  CHARACTER: getAssetPath('stickman.glb'),

  // Estos son los objetos especificos de tu proyecto Transcendence.
  ARCADE: getAssetPath('1.glb'),
  COMPUTER: getAssetPath('2.glb'),
  PING_PONG: getAssetPath('3.glb'),
  
  // Modelos de entorno
  STADIUM: getAssetPath('4.glb'),
  STADIUM1: getAssetPath('4.glb'),
  TROPHY: getAssetPath('5.glb'),
  
  TOWN_HOUSE: getAssetPath('6.glb'),
  LA_FAROLA: getAssetPath('7.glb'),
  LA_ROSALEDA: getAssetPath('8.glb'),
  TORRE_MONICA: getAssetPath('9.glb'),

  SAND: getAssetPath('4.glb'),
  LOW_TABLE: getAssetPath('4.glb'),

 } as const
//   - ESTO ES CRITICO EN TYPESCRIPT.
//   - 'as const' convierte este objeto en "Read-Only" (Solo lectura).
//   - Le dice a TypeScript: "Los valores de este objeto NUNCA cambiaran".
//   - En vez de tratar MODELS.PING_PONG como un "string" generico, 
//     TypeScript sabe que es exactamente el texto literal "/ping_pong.glb".
//     Ayuda a evitar errores de escritura (typos) en el autocompletado.


//OJO , o instarlo todo, por si no hay conexion a internet, si no fallaria la compresion de modelos
// ver mas tarde si descargar los archivos y meterlos en public... hacerlo local.

// Configuracion de Draco para compresion de modelos

// export const DRACO_CONFIG = { ... } as const
//   - Configuracion para el "DracoLoader".
//   - ¿QUE ES DRACO? Es una tecnologia de Google para comprimir modelos 3D (como un ZIP para geometria).
//   - Sin Draco, un modelo pesa 10MB. Con Draco, puede bajar a 1MB.
export const DRACO_CONFIG = {

  // wasmUrl: La direccion web donde esta el codigo "pegamento" de JavaScript para WebAssembly.
  wasmUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_wasm_wrapper.js',
  
  // wasmBinaryUrl: El archivo binario real (.wasm) que contiene el decodificador compilado.
  // WebAssembly corre a velocidad casi nativa en el navegador para descomprimir los modelos rapido.
  wasmBinaryUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.wasm',
  
  // fallbackUrl: Una version en JavaScript puro por si el navegador es muy viejo y no soporta WASM (raro hoy en dia).
  fallbackUrl: 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/draco_decoder.js'

} as const