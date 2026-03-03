import { useNavigate } from 'react-router-dom';
import './Privacidad.css';

// ============================================================
// PÁGINA: POLÍTICA DE PRIVACIDAD
// Obligatoria según el subject de Transcendence
// ============================================================

function Privacidad() {
    const navegar = useNavigate();

    return (
        <div className="privacidad-container">

            {/* ── BOTÓN VOLVER ── */}
            <button className="btn-volver" onClick={() => navegar(-1)}>
                ← Volver
            </button>

            <h1>🔒 Política de Privacidad</h1>
            <p className="fecha">Última actualización: 3 de marzo de 2026</p>

            {/* ── SECCIÓN 1 ── */}
            <section>
                <h2>1. Datos que recopilamos</h2>
                <p>Recopilamos los siguientes datos personales cuando te registras:</p>
                <ul>
                    <li>Nombre de usuario</li>
                    <li>Dirección de correo electrónico</li>
                    <li>Contraseña (almacenada de forma segura con hash)</li>
                    <li>Avatar (opcional)</li>
                </ul>
            </section>

            {/* ── SECCIÓN 2 ── */}
            <section>
                <h2>2. Cómo usamos tus datos</h2>
                <p>Tus datos se usan exclusivamente para:</p>
                <ul>
                    <li>Gestionar tu cuenta y autenticación</li>
                    <li>Mostrar tu perfil a otros usuarios</li>
                    <li>Gestionar tu lista de amigos</li>
                    <li>Mostrar tu estado online/offline</li>
                </ul>
            </section>

            {/* ── SECCIÓN 3 ── */}
            <section>
                <h2>3. Seguridad</h2>
                <p>
                    Todas las contraseñas se almacenan usando <strong>bcrypt</strong> con salt.
                    La autenticación se realiza mediante <strong>JWT</strong> (JSON Web Tokens).
                    Nunca compartimos tus datos con terceros.
                </p>
            </section>

            {/* ── SECCIÓN 4 ── */}
            <section>
                <h2>4. Tus derechos</h2>
                <p>Tienes derecho a:</p>
                <ul>
                    <li>Acceder a tus datos personales</li>
                    <li>Modificar tu perfil en cualquier momento</li>
                    <li>Eliminar tu cuenta</li>
                </ul>
            </section>

            {/* ── SECCIÓN 5 ── */}
            <section>
                <h2>5. Contacto</h2>
                <p>
                    Este proyecto ha sido desarrollado como parte del currículo de <strong>42</strong>.
                    Para cualquier duda sobre privacidad, contacta con el equipo de desarrollo.
                </p>
            </section>

        </div>
    );
}

export default Privacidad;