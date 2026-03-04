// ============================================================================
// LOGIN.TSX - Página de Login y Registro
// ============================================================================
// Este componente reemplaza al index.html original.
// Las diferencias clave con HTML vanilla:
//   - En vez de document.getElementById() usamos useState() para el estado
//   - En vez de onclick="" usamos onClick={}
//   - En vez de value="..." en inputs usamos value={variable} + onChange
//   - El JSX parece HTML pero es JavaScript (por eso className en vez de class)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // para redirigir entre páginas
import './Login.css';
import { API_URL } from '../config';

// ============================================================================
// COMPONENTE PRINCIPAL: Login
// ============================================================================
function Login() {

    // ========================================================================
    // ESTADO DEL COMPONENTE
    // ========================================================================
    // useState() es como tener variables que cuando cambian, React actualiza la pantalla.
    // Antes con HTML vanilla: document.getElementById('loginEmail').value
    // Ahora con React:        loginEmail (la variable) y setLoginEmail (la función para cambiarla)

    // Estado del formulario de LOGIN
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Estado del formulario de REGISTRO
    const [registroNombre, setRegistroNombre] = useState('');
    const [registroEmail, setRegistroEmail] = useState('');
    const [registroPassword, setRegistroPassword] = useState('');

    // Estado de las pestañas: 'login' o 'registro'
    const [tabActiva, setTabActiva] = useState<'login' | 'registro'>('login');

    // Estado de las alertas: null = no mostrar, { mensaje, tipo } = mostrar
    const [alertaLogin, setAlertaLogin] = useState<{ mensaje: string; tipo: 'success' | 'error' } | null>(null);
    const [alertaRegistro, setAlertaRegistro] = useState<{ mensaje: string; tipo: 'success' | 'error' } | null>(null);

    // Hook para redirigir a otras páginas (reemplaza window.location.href)
    const navigate = useNavigate();

    // ========================================================================
    // EFECTO: Comprobar si ya hay sesión activa al cargar la página
    // ========================================================================
    // useEffect() es como window.onload -> se ejecuta cuando el componente aparece en pantalla
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Ya hay sesión -> ir directamente al perfil
            navigate('/perfil');
        }
    }, []); // El [] vacío significa "ejecutar solo una vez al montar el componente"

    // ========================================================================
    // FUNCIÓN: HACER LOGIN
    // ========================================================================
    async function hacerLogin() {

        // PASO 1: Validar que los campos no estén vacíos
        if (!loginEmail || !loginPassword) {
            setAlertaLogin({ mensaje: 'Rellena el email y la contraseña', tipo: 'error' });
            return;
        }

        try {
            // PASO 2: Enviar los datos al backend (igual que antes con fetch)
            const response = await fetch(`${API_URL}/usuarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: loginEmail,
                    contraseña: loginPassword
                })
            });

            // PASO 3: Leer la respuesta del servidor
            const data = await response.json();

            // PASO 4: Comprobar si el login fue exitoso
            if (response.ok) {
                // Guardar token Y usuarioId en localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuarioId', data.usuario.id);

                setAlertaLogin({ mensaje: '¡Login correcto! Redirigiendo...', tipo: 'success' });

                // PASO 5: Redirigir al perfil tras un pequeño delay
                setTimeout(() => {
                    navigate('/perfil');  // antes: window.location.href = '/perfil.html'
                }, 800);

            } else {
                setAlertaLogin({ mensaje: data.error || 'Email o contraseña incorrectos', tipo: 'error' });
            }

        } catch (error) {
            console.error('Error de red:', error);
            setAlertaLogin({ mensaje: 'No se puede conectar con el servidor', tipo: 'error' });
        }
    }

    // ========================================================================
    // FUNCIÓN: HACER REGISTRO
    // ========================================================================
    async function hacerRegistro() {

        // PASO 1: Validar campos
        if (!registroNombre || !registroEmail || !registroPassword) {
            setAlertaRegistro({ mensaje: 'Rellena todos los campos', tipo: 'error' });
            return;
        }

        // Validar que el email tenga formato correcto (algo@algo.algo)
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registroEmail);
        if (!emailValido) {
            setAlertaRegistro({ mensaje: 'El email no tiene un formato válido', tipo: 'error' });
            return;
        }

        if (registroPassword.length < 6) {
            setAlertaRegistro({ mensaje: 'La contraseña debe tener al menos 6 caracteres', tipo: 'error' });
            return;
        }

        try {
            // PASO 2: Enviar al backend
            const response = await fetch(`${API_URL}/usuarios/registro`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: registroNombre,
                    email: registroEmail,
                    contraseña: registroPassword
                })
            });

            // PASO 3: Leer respuesta
            const data = await response.json();

            // PASO 4: Si fue exitoso
            if (response.ok) {
                setAlertaRegistro({ mensaje: '¡Cuenta creada! Ahora puedes iniciar sesión', tipo: 'success' });

                // Guardar el email para pasarlo al login automáticamente
                const emailUsado = registroEmail;

                // Limpiar formulario de registro
                setRegistroNombre('');
                setRegistroEmail('');
                setRegistroPassword('');

                // Cambiar a la pestaña login y poner el email ya escrito
                setTimeout(() => {
                    setTabActiva('login');
                    setLoginEmail(emailUsado);
                    setAlertaRegistro(null);
                }, 1500);

            } else {
                setAlertaRegistro({ mensaje: data.error || 'Error al crear la cuenta', tipo: 'error' });
            }

        } catch (error) {
            console.error('Error de red:', error);
            setAlertaRegistro({ mensaje: 'No se puede conectar con el servidor', tipo: 'error' });
        }
    }

    // ========================================================================
    // RENDERIZADO (lo que se muestra en pantalla)
    // ========================================================================
    // Esto es JSX: parece HTML pero es JavaScript.
    // Diferencias principales:
    //   - onclick -> onClick
    //   - class -> className
    //   - Las variables se ponen entre llaves: {variable}
    //   - Los eventos reciben funciones: onClick={() => hacerLogin()}
    return (
        <div className="login-container">

            {/* HEADER */}
            <div className="login-header">
                <div className="login-header-logo">🏓</div>
                <h1 className="login-header-titulo">Transcendence</h1>
                <p className="login-header-subtitulo">Proyecto 42 - Gestión de Usuarios</p>
            </div>

            {/* PESTAÑAS */}
            <div className="login-tabs">
                <button
                    className={`login-tab ${tabActiva === 'login' ? 'active' : ''}`}
                    onClick={() => {
                        setTabActiva('login');
                        setAlertaLogin(null);
                        setAlertaRegistro(null);
                    }}
                >
                    Iniciar Sesión
                </button>
                <button
                    className={`login-tab ${tabActiva === 'registro' ? 'active' : ''}`}
                    onClick={() => {
                        setTabActiva('registro');
                        setAlertaLogin(null);
                        setAlertaRegistro(null);
                    }}
                >
                    Registrarse
                </button>
            </div>

            {/* FORMULARIOS */}
            <div className="login-form-container">
                {/* ---------------------------------------------------------- */}
                {/* TAB LOGIN: solo se muestra si tabActiva === 'login' */}
                {/* ---------------------------------------------------------- */}
                {tabActiva === 'login' && ( // si contiene 'login' -> muestra lo siguiente (&&)
                    <div>
                        {/* Alerta: solo se renderiza si alertaLogin no es null */}
                        {alertaLogin && (
                            <div className={`alerta ${alertaLogin.tipo}`}>
                                {alertaLogin.tipo === 'success' ? '✅ ' : '❌ '}
                                {alertaLogin.mensaje}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            {/* value={loginEmail} -> muestra el estado */}
                            {/* onChange={e => setLoginEmail(e.target.value)} -> actualiza el estado al escribir */}
                            <input
                                type="email"
                                className="form-input"
                                placeholder="tu@email.com"
                                value={loginEmail}
                                onChange={e => setLoginEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && hacerLogin()}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <input  
                                type="password"
                                className="form-input"
                                placeholder="Tu contraseña"
                                value={loginPassword}
                                onChange={e => setLoginPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && hacerLogin()}
                            />
                        </div>

                        <button className="btn-submit" onClick={hacerLogin}>
                            Iniciar Sesión
                        </button>
                    </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* TAB REGISTRO: solo se muestra si tabActiva === 'registro'  */}
                {/* ---------------------------------------------------------- */}
                {tabActiva === 'registro' && (
                    <div>
                        {alertaRegistro && (
                            <div className={`alerta ${alertaRegistro.tipo}`}>
                                {alertaRegistro.tipo === 'success' ? '✅ ' : '❌ '}
                                {alertaRegistro.mensaje}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Nombre</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Tu nombre completo"
                                value={registroNombre}
                                onChange={e => setRegistroNombre(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="tu@email.com"
                                value={registroEmail}
                                onChange={e => setRegistroEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Mínimo 6 caracteres"
                                value={registroPassword}
                                onChange={e => setRegistroPassword(e.target.value)}
                            />
                        </div>

                        <button className="btn-submit" onClick={hacerRegistro}>
                            Crear Cuenta
                        </button>
                    </div>
                )}
            </div>

            {/* FOOTER CON ENLACES LEGALES */}
            <footer style={{textAlign: 'center', marginTop: '24px', color: '#999', fontSize: '0.8rem'}}>
                <a href="/privacidad" style={{color: '#2c3e8c', marginRight: '16px'}}>Política de Privacidad</a>
                <a href="/terminos" style={{color: '#2c3e8c'}}>Términos de Servicio</a>
            </footer>
        </div>
    );
}

export default Login;
