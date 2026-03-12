// ============================================================================
// AMIGOS.TSX - Página de Gestión de Amigos
// ============================================================================
// Este componente reemplaza al amigos.html original.
// La lógica es exactamente la misma, solo cambia cómo se gestiona el estado
// y cómo se muestra la interfaz (useState + JSX en vez de innerHTML).

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Amigos.css';
import { API_URL } from '../config';

// ============================================================================
// TIPOS
// ============================================================================
interface AmigoData {
    id: number;
    nombre: string;
    email: string;
    avatar: string | null;
    estadoOnline: boolean;
}

interface SolicitudData {
    id: number;
    solicitante: AmigoData;
}

// ============================================================================
// COMPONENTE PRINCIPAL: Amigos
// ============================================================================
function Amigos() {

    // ========================================================================
    // ESTADO DEL COMPONENTE
    // ========================================================================
    const [tabActiva, setTabActiva] = useState<'mis-amigos' | 'solicitudes' | 'buscar'>('mis-amigos');

    const [listaAmigos, setListaAmigos] = useState<AmigoData[]>([]);
    const [listaSolicitudes, setListaSolicitudes] = useState<SolicitudData[]>([]);
    const [resultadosBusqueda, setResultadosBusqueda] = useState<AmigoData[]>([]);

    const [inputBuscar, setInputBuscar] = useState('');

    const navigate = useNavigate();

    // Obtener usuarioId del localStorage (se guardó al hacer login)
    const usuarioId = localStorage.getItem('usuarioId') || '';
    const token = localStorage.getItem('token') || '';

    // ========================================================================
    // EFECTO: Comprobar sesión y cargar datos al montar
    // ========================================================================
    useEffect(() => {
        // Si no hay sesión, redirigir al login
        if (!usuarioId || !token) {
            navigate('/');
            return;
        }

        // Cargar amigos y solicitudes al abrir la página
        cargarAmigos();
        cargarSolicitudes();
    }, []);

    // ========================================================================
    // FUNCIÓN: CAMBIAR ENTRE PESTAÑAS
    // ========================================================================
    function cambiarTab(tab: 'mis-amigos' | 'solicitudes' | 'buscar') {
        setTabActiva(tab);
        if (tab === 'mis-amigos') cargarAmigos();
        if (tab === 'solicitudes') cargarSolicitudes();
    }

    // ========================================================================
    // FUNCIÓN: CARGAR LISTA DE AMIGOS
    // ========================================================================
    async function cargarAmigos() {
        try {
            // PASO 1: Petición al backend
            const response = await fetch(`${API_URL}/usuarios/${usuarioId}/mis_amigos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            // PASO 2: Guardar en el estado
            setListaAmigos(data.amigos || []);

        } catch (error) {
            console.error('Error al cargar amigos:', error);
        }
    }

    // ========================================================================
    // FUNCIÓN: CARGAR SOLICITUDES PENDIENTES
    // ========================================================================
    async function cargarSolicitudes() {
        try {
            const response = await fetch(`${API_URL}/usuarios/${usuarioId}/solicitudes_pendientes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setListaSolicitudes(data.solicitudes || []);

        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
        }
    }

    // ========================================================================
    // FUNCIÓN: BUSCAR USUARIOS
    // ========================================================================
    async function buscarUsuarios() {
        // PASO 1: Validar que haya al menos 2 caracteres
        if (inputBuscar.length < 2) {
            alert('Escribe al menos 2 caracteres para buscar');
            return;
        }

        try {
            // PASO 2: Petición al backend
            const response = await fetch(`${API_URL}/usuarios/buscar?query=${encodeURIComponent(inputBuscar)}`);
            const data = await response.json();

            // PASO 3: Filtrar para no mostrar al propio usuario
            const resultados = (data.usuarios || []).filter(
                (u: AmigoData) => u.id !== parseInt(usuarioId)
            );
            setResultadosBusqueda(resultados);

        } catch (error) {
            console.error('Error al buscar:', error);
        }
    }

    // ========================================================================
    // FUNCIÓN: ENVIAR SOLICITUD DE AMISTAD
    // ========================================================================
    async function enviarSolicitud(amigoId: number) {
        try {
            const response = await fetch(`${API_URL}/usuarios/${usuarioId}/enviar_solicitud/${amigoId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                alert('✅ Solicitud enviada correctamente');
            } else {
                alert(data.error);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar solicitud');
        }
    }

    // ========================================================================
    // FUNCIÓN: ACEPTAR SOLICITUD
    // ========================================================================
    async function aceptarSolicitud(amigoId: number) {
        try {
            const response = await fetch(`${API_URL}/usuarios/${usuarioId}/aceptar_solicitud/${amigoId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                alert('✅ ¡Solicitud aceptada! Ahora son amigos');
                // Recargar ambas listas
                cargarSolicitudes();
                cargarAmigos();
            } else {
                alert(data.error);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error al aceptar solicitud');
        }
    }

    // ========================================================================
    // FUNCIÓN: RECHAZAR SOLICITUD
    // ========================================================================
    async function rechazarSolicitud(amigoId: number) {
        if (!confirm('¿Estás seguro que quieres rechazar esta solicitud?')) return;

        try {
            const response = await fetch(`${API_URL}/usuarios/${usuarioId}/rechazar_solicitud/${amigoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('✅ Solicitud rechazada');
                cargarSolicitudes();
            } else {
                const data = await response.json();
                alert(data.error);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error al rechazar solicitud');
        }
    }

    // ========================================================================
    // FUNCIÓN: ELIMINAR AMIGO
    // ========================================================================
    async function eliminarAmigo(amigoId: number) {
        if (!confirm('¿Estás seguro que quieres eliminar a este amigo?')) return;

        try {
            const response = await fetch(`${API_URL}/usuarios/${usuarioId}/eliminar_amigo/${amigoId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('✅ Amigo eliminado correctamente');
                cargarAmigos();
            } else {
                const data = await response.json();
                alert(data.error);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar amigo');
        }
    }

    // ========================================================================
    // RENDERIZADO
    // ========================================================================
    return (
        <div className="amigos-container">

            {/* BOTÓN VOLVER */}
            <button className="volver" onClick={() => navigate('/perfil')}>
                ← Volver al Perfil
            </button>

            <h1>👥 Gestión de Amigos</h1>

            {/* ============================================================ */}
            {/* PESTAÑAS */}
            {/* ============================================================ */}
            <div className="tabs">
                <button
                    className={`tab ${tabActiva === 'mis-amigos' ? 'active' : ''}`}
                    onClick={() => cambiarTab('mis-amigos')}
                >
                    Mis Amigos ({listaAmigos.length})
                </button>
                <button
                    className={`tab ${tabActiva === 'solicitudes' ? 'active' : ''}`}
                    onClick={() => cambiarTab('solicitudes')}
                >
                    Solicitudes Pendientes ({listaSolicitudes.length})
                </button>
                <button
                    className={`tab ${tabActiva === 'buscar' ? 'active' : ''}`}
                    onClick={() => cambiarTab('buscar')}
                >
                    🔍 Buscar Usuarios
                </button>
            </div>

            {/* ============================================================ */}
            {/* TAB 1: MIS AMIGOS */}
            {/* ============================================================ */}
            {tabActiva === 'mis-amigos' && (
                <div>
                    {listaAmigos.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">😔</div>
                            <div className="empty-state-text">No tienes amigos todavía</div>
                            <div className="empty-state-subtext">¡Busca usuarios para añadir!</div>
                        </div>
                    ) : (
                        // .map() en React es como un forEach para mostrar listas
                        listaAmigos.map(amigo => (
                            <div key={amigo.id} className="usuario-card">
                                <img
                                    src={amigo.avatar ? `${API_URL}${amigo.avatar}` : `${API_URL}/avatares/default-avatar.svg`}
                                    alt="Avatar"
                                />
                                <div className="usuario-info">
                                    <div className="usuario-nombre">
                                        {amigo.nombre}
                                        <span className={`estado ${amigo.estadoOnline ? 'online' : 'offline'}`}>
                                            {amigo.estadoOnline ? '🟢 Online' : '⚫ Offline'}
                                        </span>
                                    </div>
                                    <div className="usuario-email">{amigo.email}</div>
                                </div>
                                <button className="btn btn-danger" onClick={() => eliminarAmigo(amigo.id)}>
                                    🗑️ Eliminar
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: SOLICITUDES PENDIENTES */}
            {/* ============================================================ */}
            {tabActiva === 'solicitudes' && (
                <div>
                    {listaSolicitudes.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <div className="empty-state-text">No tienes solicitudes pendientes</div>
                            <div className="empty-state-subtext">Te notificaremos cuando recibas una</div>
                        </div>
                    ) : (
                        listaSolicitudes.map(solicitud => (
                            <div key={solicitud.id} className="usuario-card">
                                <img
                                    src={solicitud.solicitante.avatar ? `${API_URL}${solicitud.solicitante.avatar}` : `${API_URL}/avatares/default-avatar.svg`}
                                    alt="Avatar"
                                />
                                <div className="usuario-info">
                                    <div className="usuario-nombre">{solicitud.solicitante.nombre}</div>
                                    <div className="usuario-email">{solicitud.solicitante.email}</div>
                                </div>
                                <button className="btn btn-success" onClick={() => aceptarSolicitud(solicitud.solicitante.id)}>
                                    ✅ Aceptar
                                </button>
                                <button className="btn btn-danger" onClick={() => rechazarSolicitud(solicitud.solicitante.id)}>
                                    ❌ Rechazar
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: BUSCAR USUARIOS */}
            {/* ============================================================ */}
            {tabActiva === 'buscar' && (
                <div>
                    <div className="buscar-usuarios">
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={inputBuscar}
                            onChange={e => setInputBuscar(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && buscarUsuarios()}
                        />
                        <button onClick={buscarUsuarios}>🔍 Buscar</button>
                    </div>

                    {resultadosBusqueda.length === 0 && inputBuscar.length >= 2 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <div className="empty-state-text">No se encontraron usuarios</div>
                            <div className="empty-state-subtext">Intenta con otro término</div>
                        </div>
                    )}

                    {resultadosBusqueda.map(usuario => (
                        <div key={usuario.id} className="usuario-card">
                            <img
                                src={usuario.avatar ? `${API_URL}${usuario.avatar}` : `${API_URL}/avatares/default-avatar.svg`}
                                alt="Avatar"
                            />
                            <div className="usuario-info">
                                <div className="usuario-nombre">
                                    {usuario.nombre}
                                    <span className={`estado ${usuario.estadoOnline ? 'online' : 'offline'}`}>
                                        {usuario.estadoOnline ? '🟢 Online' : '⚫ Offline'}
                                    </span>
                                </div>
                                <div className="usuario-email">{usuario.email}</div>
                            </div>
                            <button className="btn btn-primary" onClick={() => enviarSolicitud(usuario.id)}>
                                ➕ Añadir amigo
                            </button>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default Amigos;
