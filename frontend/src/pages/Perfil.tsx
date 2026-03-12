// ============================================================================
// PERFIL.TSX - Página de Perfil del Usuario
// ============================================================================
// Este componente reemplaza al perfil.html original.
// CAMBIO IMPORTANTE respecto al HTML: el estado del componente
// (datos del usuario, si el modal está abierto, etc.) se gestiona con useState()
// en vez de variables globales sueltas.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Perfil.css';
import { API_URL } from '../config';

// ============================================================================
// TIPOS (TypeScript)
// ============================================================================
// Definimos la "forma" de un objeto usuario para que TypeScript nos avise
// si intentamos acceder a un campo que no existe.
interface Usuario {
    id: number;
    nombre: string;
    email: string;
    avatar: string | null;
    estadoOnline: boolean;
    ultimaConexion: string | null;
    createdAt: string;
}

interface Amigo {
    id: number;
    nombre: string;
    email: string;
    avatar: string | null;
    estadoOnline: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL: Perfil
// ============================================================================
function Perfil() {

    // ========================================================================
    // ESTADO DEL COMPONENTE // lo 1º que carga siempre son los useStates
    // ========================================================================
    const [usuario, setUsuario] = useState<Usuario | null>(null);   // Datos del usuario
                                        // el estado puede ser: un Usuario o null (inicia en null)

    const [amigos, setAmigos] = useState<Amigo[]>([]);               // Lista de amigos

    // Estado del modal de edición: true = abierto, false = cerrado
    const [modalAbierto, setModalAbierto] = useState(false);

    // Estado de los campos del formulario de edición
    const [editNombre, setEditNombre] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');

    // Estado de la notificación flotante
    const [notificacion, setNotificacion] = useState<{ mensaje: string; tipo: 'success' | 'error' } | null>(null);

    const navigate = useNavigate();

    // ========================================================================
    // EFECTO: Cargar datos al abrir la página (después de 'pintar' la pantalla con el 'return')
    // ========================================================================
    useEffect(() => {
        // Leer token de la URL si venimos del login con 42
        const params = new URLSearchParams(window.location.search);
        const tokenDeURL   = params.get('token');
        const userIdDeURL  = params.get('userId');

        if (tokenDeURL && userIdDeURL) {
            localStorage.setItem('token', tokenDeURL);
            localStorage.setItem('usuarioId', userIdDeURL);
            // Limpiar la URL para que no se vea el token
            window.history.replaceState({}, '', '/perfil');
        }

        // PASO 1: Obtener el token del localStorage
        const token = localStorage.getItem('token');
        const usuarioId = localStorage.getItem('usuarioId');

        // PASO 2: Si no hay sesión, redirigir al login
        if (!token || !usuarioId) {
            navigate('/');
            return;
        }

        // PASO 3: Cargar el perfil y los amigos
        cargarPerfil(parseInt(usuarioId), token);
        cargarAmigos(parseInt(usuarioId), token);
    }, []); // [] = ejecutar solo al montar

    // ========================================================================
    // FUNCIÓN: Cargar datos del perfil
    // ========================================================================
    async function cargarPerfil(userId: number, token: string) {
        try {
            // PASO 1: Petición al backend
            const response = await fetch(`${API_URL}/usuarios/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar perfil');

            // PASO 2: Guardar los datos en el estado
            const data: Usuario = await response.json();
            setUsuario(data);  // antes: document.getElementById('profileName').textContent = ...

        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('Error al cargar el perfil', 'error');
        }
    }

    // ========================================================================
    // FUNCIÓN: Cargar lista de amigos
    // ========================================================================
    async function cargarAmigos(userId: number, token: string) {
        try {
            // RUTA CORRECTA: /usuarios/:userId/mis_amigos
            // (el perfil.html original tenía un bug y usaba /amigos/:userId que no existía)
            const response = await fetch(`${API_URL}/usuarios/${userId}/mis_amigos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar amigos');

            const data = await response.json();
            setAmigos(data.amigos || []);

        } catch (error) {
            console.error('Error:', error);
        }
    }

    // ========================================================================
    // FUNCIÓN: Cambiar estado online/offline
    // ========================================================================
    async function cambiarEstado() {
        if (!usuario) return;

        const token = localStorage.getItem('token');
        const nuevoEstado = !usuario.estadoOnline;

        try {
            const response = await fetch(`${API_URL}/usuarios/${usuario.id}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ estadoOnline: nuevoEstado })
            });

            if (!response.ok) throw new Error('Error al cambiar estado');

            // Actualizar el estado local del usuario (sin recargar la página)
            const data = await response.json();
            setUsuario(data.usuario);

            mostrarNotificacion(
                nuevoEstado ? 'Ahora estás online' : 'Ahora estás offline',
                'success'
            );

        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('Error al cambiar estado', 'error');
        }
    }

    // ========================================================================
    // FUNCIÓN: Abrir modal de edición (rellena los campos con los datos actuales)
    // ========================================================================
    function abrirModal() {
        if (!usuario) return;
        setEditNombre(usuario.nombre);
        setEditEmail(usuario.email);
        setEditPassword('');
        setModalAbierto(true);
    }

    // ========================================================================
    // FUNCIÓN: Guardar cambios del perfil
    // ========================================================================
    async function guardarCambios() {
        if (!usuario) return;

        const token = localStorage.getItem('token');
        const datosAEnviar: any = { nombre: editNombre, email: editEmail };

        if (editPassword) {
            datosAEnviar.contraseña = editPassword;
        }

        try {
            const response = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosAEnviar)
            });

            if (!response.ok) throw new Error('Error al actualizar perfil');

            // Recargar los datos del perfil tras guardar
            await cargarPerfil(usuario.id, token!);
            setModalAbierto(false);
            mostrarNotificacion('Perfil actualizado correctamente', 'success');

        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('Error al actualizar perfil', 'error');
        }
    }

    // ========================================================================
    // FUNCIÓN: Subir nuevo avatar
    // ========================================================================
    async function subirAvatar(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file || !usuario) return;

        const token = localStorage.getItem('token');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/usuarios/${usuario.id}/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Error al subir avatar');

            const data = await response.json();
            // Actualizar solo el avatar en el estado, sin recargar todo
            setUsuario(prev => prev ? { ...prev, avatar: data.avatarUrl } : prev);
            mostrarNotificacion('Avatar actualizado correctamente', 'success');

        } catch (error) {
            console.error('Error:', error);
            mostrarNotificacion('Error al subir avatar', 'error');
        }
    }

    // ========================================================================
    // FUNCIÓN: Cerrar sesión
    // ========================================================================
    async function cerrarSesion() {
        const token = localStorage.getItem('token');

        try {
            // Marcar como offline antes de cerrar sesión
            if (usuario) {
                await fetch(`${API_URL}/usuarios/${usuario.id}/estado`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ estadoOnline: false })
                });
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
        }

        // Limpiar localStorage y redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioId');
        navigate('/');
    }

    // ========================================================================
    // FUNCIÓN: Mostrar notificación flotante
    // ========================================================================
    function mostrarNotificacion(mensaje: string, tipo: 'success' | 'error') {
        setNotificacion({ mensaje, tipo });
        // Ocultar la notificación después de 3 segundos
        setTimeout(() => {
            setNotificacion(null);
        }, 3000);
    }

    // ========================================================================
    // RENDERIZADO
    // ========================================================================
    // Si el usuario aún no ha cargado, mostramos un mensaje de carga
    if (!usuario) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: 'white', fontSize: '20px' }}>
                Cargando perfil...
            </div>
        );
    }

    return (
        <div>
            {/* ================================================================ */}
            {/* NOTIFICACIÓN FLOTANTE */}
            {/* Solo se renderiza si notificacion no es null */}
            {/* ================================================================ */}
            {notificacion && (
                <div className={`notification ${notificacion.tipo}`}>
                    {notificacion.mensaje}
                </div>
            )}

            <div className="perfil-container">

                {/* ============================================================ */}
                {/* HEADER DEL PERFIL */}
                {/* ============================================================ */}
                <div className="perfil-header">
                    <div className="avatar-container">
                        <img
                            className="avatar"
                            src={usuario.avatar ? `${API_URL}${usuario.avatar}` : `${API_URL}/avatares/default-avatar.svg`}
                            onError={(e) => { (e.target as HTMLImageElement).src = `${API_URL}/avatares/default-avatar.svg`; }}
                            alt="Avatar"
                        />
                        <div className={`status-indicator ${usuario.estadoOnline ? '' : 'offline'}`}></div>
                    </div>

                    <h1 className="profile-name">{usuario.nombre}</h1>
                    <p className="profile-email">{usuario.email}</p>

                    <div className="action-buttons">
                        <button className="btn btn-primary" onClick={abrirModal}>
                            📝 Editar Perfil
                        </button>

                        {/* Input de archivo oculto para el avatar */}
                        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                            📷 Cambiar Avatar
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={subirAvatar}
                            />
                        </label>

                        <button
                            className={`btn ${usuario.estadoOnline ? 'btn-danger' : 'btn-success'}`}
                            onClick={cambiarEstado}
                        >
                            {usuario.estadoOnline ? '🔴 Desconectarse' : '🟢 Conectarse'}
                        </button>

                        {/* botón para ir a la página de amigos */}
                        <button className="btn btn-primary" onClick={() => navigate('/amigos')}>
                            👥 Mis Amigos
                        </button>

                        <button className="btn btn-danger" onClick={cerrarSesion}>
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* CONTENIDO DEL PERFIL */}
                {/* ============================================================ */}
                <div className="perfil-content">

                    {/* SECCIÓN: INFORMACIÓN */}
                    <div className="section">
                        <h2 className="section-title">📋 Información del Perfil</h2>
                        <div className="info-grid">
                            <div className="info-card">
                                <div className="info-label">Estado</div>
                                <div className="info-value">
                                    <span className={`status-badge ${usuario.estadoOnline ? 'online' : 'offline'}`}>
                                        {usuario.estadoOnline ? '🟢 Conectado' : '🔴 Desconectado'}
                                    </span>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-label">Última Conexión</div>
                                <div className="info-value">
                                    {usuario.ultimaConexion
                                        ? new Date(usuario.ultimaConexion).toLocaleString()
                                        : '-'
                                    }
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-label">Miembro Desde</div>
                                <div className="info-value">
                                    {new Date(usuario.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-label">Total de Amigos</div>
                                <div className="info-value">{amigos.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN: AMIGOS */}
                    <div className="section">
                        <h2 className="section-title">👥 Mis Amigos</h2>
                        {amigos.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#666' }}>
                                No tienes amigos todavía
                            </p>
                        ) : (
                            <div className="friends-grid">
                                {/* En React, para mostrar listas usamos .map() en vez de innerHTML */}
                                {amigos.map(amigo => (
                                    <div key={amigo.id} className="friend-card">
                                        <img
                                            src={amigo.avatar ? `${API_URL}${amigo.avatar}` : `${API_URL}/avatares/default-avatar.svg`}
                                            alt={amigo.nombre}
                                            className="friend-avatar"
                                        />
                                        <div className="friend-name">{amigo.nombre}</div>
                                        <div className={`friend-status ${amigo.estadoOnline ? 'online' : ''}`}>
                                            {amigo.estadoOnline ? '🟢 Online' : '🔴 Offline'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* FOOTER CON ENLACES LEGALES */}
                <footer style={{
                    textAlign: 'center',
                    padding: '24px 40px 32px',
                    color: '#999',
                    fontSize: '0.8rem',
                    borderTop: '1px solid #f0f0f0',
                    marginTop: '8px'
                }}>
                    <a href="/privacidad" style={{color: '#667eea', marginRight: '16px', textDecoration: 'none'}}>Política de Privacidad</a>
                    <a href="/terminos" style={{color: '#667eea', textDecoration: 'none'}}>Términos de Servicio</a>
                </footer>
            </div>

            {/* ================================================================ */}
            {/* MODAL DE EDICIÓN */}
            {/* Solo se renderiza si modalAbierto === true */}
            {/* ================================================================ */}
            {modalAbierto && (
                // Al hacer clic en el fondo oscuro, cerrar el modal
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalAbierto(false)}>
                    <div className="modal-content">
                        <h2 className="modal-title">✏️ Editar Perfil</h2>

                        <div className="form-group">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editNombre}
                                onChange={e => setEditNombre(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nueva Contraseña (opcional)</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Dejar vacío para no cambiar"
                                value={editPassword}
                                onChange={e => setEditPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-buttons">
                            <button
                                className="btn-block"
                                style={{ background: '#ef4444', color: 'white' }}
                                onClick={() => setModalAbierto(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-block"
                                style={{ background: '#10b981', color: 'white' }}
                                onClick={guardarCambios}
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Perfil;
