// ============================================================================
// APP.TSX - ENRUTADOR PRINCIPAL
// ============================================================================
// Este archivo define las "páginas" de la aplicación y a qué URL corresponde cada una.
// Antes teníamos 3 archivos HTML separados (index.html, perfil.html, amigos.html).
// Ahora tenemos 3 componentes React y el Router decide cuál mostrar según la URL.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import Amigos from './pages/Amigos';

// ============================================================================
// COMPONENTE: RutaProtegida
// ============================================================================
// Este componente funciona como un guardia de seguridad.
// Si el usuario NO tiene token (no ha hecho login), lo manda al login.
// Si SÍ tiene token, le deja ver la página que pidió.
function RutaProtegida({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('token');

    if (!token) {
        // No hay sesión → redirigir al login
        return <Navigate to="/" replace />;
    }

    // Hay sesión → mostrar la página solicitada
    return <>{children}</>;
}

// ============================================================================
// COMPONENTE PRINCIPAL: App
// ============================================================================
function App() {
    return (
        // BrowserRouter: activa el sistema de rutas en la aplicación
        <BrowserRouter>
            <Routes>
                {/* Ruta "/" → Página de Login (era index.html) */}
                <Route path="/" element={<Login />} />

                {/* Ruta "/perfil" → Perfil del usuario (era perfil.html) */}
                {/* Está protegida: si no hay login, redirige a "/" */}
                <Route
                    path="/perfil"
                    element={
                        <RutaProtegida>
                            <Perfil />
                        </RutaProtegida>
                    }
                />

                {/* Ruta "/amigos" → Gestión de amigos (era amigos.html) */}
                {/* También está protegida */}
                <Route
                    path="/amigos"
                    element={
                        <RutaProtegida>
                            <Amigos />
                        </RutaProtegida>
                    }
                />

                {/* Cualquier otra ruta → redirigir al login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
