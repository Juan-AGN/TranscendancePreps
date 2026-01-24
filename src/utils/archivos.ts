// ============================================================================
// IMPORTACIONES
// ============================================================================
import fs from 'fs';  // Módulo para leer/escribir archivos
import path from 'path';  // Módulo para manejar rutas de archivos

// ============================================================================
// INTERFACES (Definir la estructura de los datos)
// ============================================================================

// Estructura de un Usuario
export interface Usuario {
    id_user: number;
    nombre: string;
    email: string;
    password?: string;
    amigos?: number[];                  // Lista de IDs de amigos
    solicitudes_enviadas?: number[];    // IDs de usuarios a los que envié solicitud
    solicitudes_recibidas?: number[];   // IDs de usuarios que me enviaron solicitud
}

// Estructura de un Post
export interface Post {
    id_post: number;
    id_user: number;
    contenido: string;
    fecha: string;
}

// ============================================================================
// RUTAS DE LOS ARCHIVOS JSON
// ============================================================================

// Obtener la ruta completa del archivo usuarios.json
const ARCHIVO_USUARIOS = path.join(process.cwd(), 'usuarios.json');

// Obtener la ruta completa del archivo posts.json
const ARCHIVO_POSTS = path.join(process.cwd(), 'posts.json');

// ============================================================================
// FUNCIONES PARA USUARIOS
// ============================================================================

/**
 * Leer todos los usuarios del archivo JSON
 * @returns Array de usuarios
 */
export function leerUsuarios(): Usuario[] {
    try {
        // PASO 1: Verificar si el archivo existe
        if (!fs.existsSync(ARCHIVO_USUARIOS)) {
            // Si no existe, crear un archivo vacío con []
            fs.writeFileSync(ARCHIVO_USUARIOS, '[]', 'utf-8');
            return [];
        }
        
        // PASO 2: Leer el contenido del archivo
        const contenido = fs.readFileSync(ARCHIVO_USUARIOS, 'utf-8');
        
        // PASO 3: Convertir el texto JSON a objeto JavaScript
        const usuarios = JSON.parse(contenido);
        
        // PASO 4: Retornar los usuarios
        return usuarios;
        
    } catch (error) {
        // Si hay un error, mostrar en consola y retornar array vacío
        console.error('Error al leer usuarios:', error);
        return [];
    }
}

/**
 * Guardar usuarios en el archivo JSON
 * @param usuarios - Array de usuarios a guardar
 */
export function guardarUsuarios(usuarios: Usuario[]): void {
    try {
        // PASO 1: Convertir el array de usuarios a texto JSON
        // El segundo parámetro (null, 2) es para formatear bonito con indentación
        const contenidoJSON = JSON.stringify(usuarios, null, 2);
        
        // PASO 2: Escribir el contenido en el archivo
        fs.writeFileSync(ARCHIVO_USUARIOS, contenidoJSON, 'utf-8');
        
        console.log('✅ Usuarios guardados correctamente');
        
    } catch (error) {
        console.error('❌ Error al guardar usuarios:', error);
    }
}

/**
 * Generar un ID único para un nuevo usuario
 * @returns Número ID único
 */
export function generarIdUsuario(): number {
    // PASO 1: Leer todos los usuarios
    const usuarios = leerUsuarios();
    
    // PASO 2: Si no hay usuarios, el primer ID es 1
    if (usuarios.length === 0) {
        return 1;
    }
    
    // PASO 3: Encontrar el ID más alto
    const idsExistentes = usuarios.map(u => u.id_user);
    const idMasAlto = Math.max(...idsExistentes);
    
    // PASO 4: Retornar el siguiente ID (el más alto + 1)
    return idMasAlto + 1;
}

// ============================================================================
// FUNCIONES PARA POSTS
// ============================================================================

/**
 * Leer todos los posts del archivo JSON
 * @returns Array de posts
 */
export function leerPosts(): Post[] {
    try {
        // PASO 1: Verificar si el archivo existe
        if (!fs.existsSync(ARCHIVO_POSTS)) {
            // Si no existe, crear un archivo vacío con []
            fs.writeFileSync(ARCHIVO_POSTS, '[]', 'utf-8');
            return [];
        }
        
        // PASO 2: Leer el contenido del archivo
        const contenido = fs.readFileSync(ARCHIVO_POSTS, 'utf-8');
        
        // PASO 3: Convertir el texto JSON a objeto JavaScript
        const posts = JSON.parse(contenido);
        
        // PASO 4: Retornar los posts
        return posts;
        
    } catch (error) {
        // Si hay un error, mostrar en consola y retornar array vacío
        console.error('Error al leer posts:', error);
        return [];
    }
}

/**
 * Guardar posts en el archivo JSON
 * @param posts - Array de posts a guardar
 */
export function guardarPosts(posts: Post[]): void {
    try {
        // PASO 1: Convertir el array de posts a texto JSON
        const contenidoJSON = JSON.stringify(posts, null, 2);
        
        // PASO 2: Escribir el contenido en el archivo
        fs.writeFileSync(ARCHIVO_POSTS, contenidoJSON, 'utf-8');
        
        console.log('✅ Posts guardados correctamente');
        
    } catch (error) {
        console.error('❌ Error al guardar posts:', error);
    }
}

/**
 * Generar un ID único para un nuevo post
 * @returns Número ID único
 */
export function generarIdPost(): number {
    // PASO 1: Leer todos los posts
    const posts = leerPosts();
    
    // PASO 2: Si no hay posts, el primer ID es 1
    if (posts.length === 0) {
        return 1;
    }
    
    // PASO 3: Encontrar el ID más alto
    const idsExistentes = posts.map(p => p.id_post);
    const idMasAlto = Math.max(...idsExistentes);
    
    // PASO 4: Retornar el siguiente ID (el más alto + 1)
    return idMasAlto + 1;
}