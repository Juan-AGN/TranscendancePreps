import { useNavigate } from 'react-router-dom';
import './Privacidad.css';

// ============================================================
// PAGE: PRIVACY POLICY
// Required according to the Transcendence subject
// ============================================================

function Privacidad() {
    const navigate = useNavigate();

    return (
        <div className="privacidad-container">

            {/* ── BACK BUTTON ── */}
            <button className="btn-volver" onClick={() => navigate(-1)}>
                ← Back
            </button>

            <h1>🔒 Privacy Policy</h1>
            <p className="fecha">Last updated: March 3, 2026</p>

            {/* ── SECTION 1 ── */}
            <section>
                <h2>1. Data we collect</h2>
                <p>We collect the following personal data when you register:</p>
                <ul>
                    <li>Username</li>
                    <li>Email address</li>
                    <li>Password (securely stored with hash)</li>
                    <li>Avatar (optional)</li>
                </ul>
            </section>

            {/* ── SECTION 2 ── */}
            <section>
                <h2>2. How we use your data</h2>
                <p>Your data is used exclusively for:</p>
                <ul>
                    <li>Managing your account and authentication</li>
                    <li>Displaying your profile to other users</li>
                    <li>Managing your friends list</li>
                    <li>Showing your online/offline status</li>
                </ul>
            </section>

            {/* ── SECTION 3 ── */}
            <section>
                <h2>3. Security</h2>
                <p>
                    All passwords are stored using <strong>bcrypt</strong> with salt.
                    Authentication is done via <strong>JWT</strong> (JSON Web Tokens).
                    We never share your data with third parties.
                </p>
            </section>

            {/* ── SECTION 4 ── */}
            <section>
                <h2>4. Your rights</h2>
                <p>You have the right to:</p>
                <ul>
                    <li>Access your personal data</li>
                    <li>Modify your profile at any time</li>
                    <li>Delete your account</li>
                </ul>
            </section>

            {/* ── SECTION 5 ── */}
            <section>
                <h2>5. Contact</h2>
                <p>
                    This project has been developed as part of the <strong>42</strong> curriculum.
                    For any privacy-related questions, contact the development team.
                </p>
            </section>

        </div>
    );
}

export default Privacidad;