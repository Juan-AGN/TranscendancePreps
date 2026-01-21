// 'export' e 'import' -> para cuando necesitas usar datos de
// otros archivos del proyecto
import {promises as fs} from 'fs';

// INTERFACES
export interface interf_Usuarios {
    id_user: number;
    nombre: string;
    email: string;
    password: string;
    amigos: number[];
    solicitudes_enviadas: number[];
    solicitudes_recibidas: number[];
}

export interface interf_posts {
    id_post: number;
    user_id: number;
    contenido: string;
}

// FUNCIONES DE LECTURA
export async function leerUsuarios(): Promise<interf_Usuarios[]> {
    try {
        const datos = await fs.readFile('usuarios.json', 'utf-8');
        return JSON.parse(datos);
    } catch(error) {
        return [];
    }
}

export async function leerPosts(): Promise<interf_posts[]> {
    try {
        const datos_leidos = await fs.readFile('posts.json', 'utf-8');
        return JSON.parse(datos_leidos);
    } catch(error) {
        return [];
    }
}

// FUNCIONES DE ESCRITURA
export async function guardarUsuarios(array_Usuarios: interf_Usuarios[]) {
    await fs.writeFile('usuarios.json', JSON.stringify(array_Usuarios, null, 2));
}

export async function guardarPosts(array_Posts: interf_posts[]) {
    await fs.writeFile('posts.json', JSON.stringify(array_Posts, null, 2));
}

// FUNCIONES DE GENERACIÓN DE IDs
export function generarIdUsuario(array_Usuarios: interf_Usuarios[]): number {
    if (array_Usuarios.length === 0) return 1;
    const idsExistentes = array_Usuarios.map(usuario => usuario.id_user);
    return Math.max(...idsExistentes) + 1;
}

export function generarIdPost(array_Posts: interf_posts[]): number {
    if (array_Posts.length === 0) return 1;
    const idsExistentes = array_Posts.map(post => post.id_post);
    return Math.max(...idsExistentes) + 1;
}