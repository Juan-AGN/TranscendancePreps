import { useNavigate } from 'react-router-dom';
import './Privacidad.css'; // Reusing the same CSS

// ============================================================
// PAGE: TERMS OF SERVICE
// Required according to the Transcendence subject
// ============================================================

function Terminos() {
    const navigate = useNavigate();

    return (
        <div className="privacidad-container">

            {/* ── BACK BUTTON ── */}
            <button className="btn-volver" onClick={() => navigate(-1)}>
                ← Back
            </button>

            <h1>📜 Terms of Service</h1>
            <p className="fecha">Last updated: March 3, 2026</p>

            {/* ── SECTION 1 ── */}
            <section>
                <h2>1. Acceptance of terms</h2>
                <p>
                    By registering and using Transcendence, you accept these terms of service.
                    If you do not agree, do not use the application.
                </p>
            </section>

            {/* ── SECTION 2 ── */}
            <section>
                <h2>2. Acceptable use</h2>
                <p>You agree to:</p>
                <ul>
                    <li>Not use the application for illegal activities</li>
                    <li>Not attempt to access other users' accounts</li>
                    <li>Not share offensive or inappropriate content</li>
                    <li>Respect other users in chat and the game</li>
                </ul>
            </section>

            {/* ── SECTION 3 ── */}
            <section>
                <h2>3. Your account</h2>
                <p>
                    You are responsible for keeping your password secure.
                    Each user can have only one account.
                    We reserve the right to delete accounts that violate these terms.
                </p>
            </section>

            {/* ── SECTION 4 ── */}
            <section>
                <h2>4. Service availability</h2>
                <p>
                    This project is part of the <strong>42</strong> curriculum and is offered
                    as-is. We do not guarantee continuous availability of the service.
                </p>
            </section>

            {/* ── SECTION 5 ── */}
            <section>
                <h2>5. Modifications</h2>
                <p>
                    We may update these terms at any time.
                    Continued use of the application implies acceptance of the new terms.
                </p>
            </section>

        </div>
    );
}

export default Terminos;