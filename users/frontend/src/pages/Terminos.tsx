import { useNavigate } from 'react-router-dom';
import './Privacidad.css'; // Reutilizamos el mismo CSS

// ============================================================
// PÁGINA: TÉRMINOS DE SERVICIO
// Obligatoria según el subject de Transcendence
// ============================================================

function Terminos() {
    const navegar = useNavigate();

    return (
        <div className="privacidad-container">

            {/* ── BOTÓN VOLVER ── */}
            <button className="btn-volver" onClick={() => navegar(-1)}>
                ← Volver
            </button>

            <h1>📜 Términos de Servicio</h1>
            <p className="fecha">Última actualización: 3 de marzo de 2026</p>

            {/* ── SECCIÓN 1 ── */}
            <section>
                <h2>1. Aceptación de los términos</h2>
                <p>
                    Al registrarte y usar Transcendence, aceptas estos términos de servicio.
                    Si no estás de acuerdo, no uses la aplicación.
                </p>
            </section>

            {/* ── SECCIÓN 2 ── */}
            <section>
                <h2>2. Uso aceptable</h2>
                <p>Te comprometes a:</p>
                <ul>
                    <li>No usar la aplicación para actividades ilegales</li>
                    <li>No intentar acceder a cuentas de otros usuarios</li>
                    <li>No compartir contenido ofensivo o inapropiado</li>
                    <li>Respetar a otros usuarios en el chat y el juego</li>
                </ul>
            </section>

            {/* ── SECCIÓN 3 ── */}
            <section>
                <h2>3. Tu cuenta</h2>
                <p>
                    Eres responsable de mantener tu contraseña segura.
                    Cada usuario puede tener una sola cuenta.
                    Nos reservamos el derecho de eliminar cuentas que violen estos términos.
                </p>
            </section>

            {/* ── SECCIÓN 4 ── */}
            <section>
                <h2>4. Disponibilidad del servicio</h2>
                <p>
                    Este proyecto es parte del currículo de <strong>42</strong> y se ofrece
                    tal como está. No garantizamos disponibilidad continua del servicio.
                </p>
            </section>

            {/* ── SECCIÓN 5 ── */}
            <section>
                <h2>5. Modificaciones</h2>
                <p>
                    Podemos actualizar estos términos en cualquier momento.
                    El uso continuado de la aplicación implica la aceptación de los nuevos términos.
                </p>
            </section>

        </div>
    );
}

export default Terminos;