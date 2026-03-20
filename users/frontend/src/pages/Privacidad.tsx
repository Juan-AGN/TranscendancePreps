import { useNavigate } from 'react-router-dom';

// ============================================================
// PAGE: PRIVACY POLICY
// Required according to the Transcendence subject
// ============================================================

function Privacidad() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-violet-700 p-4 md:p-8">
            <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl md:p-10">

            {/* ── BACK BUTTON ── */}
            <button className="mb-6 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700" onClick={() => navigate(-1)}>
                ← Back
            </button>

            <h1 className="mb-2 text-3xl font-bold text-indigo-800">🔒 Privacy Policy</h1>
            <p className="mb-6 text-sm text-slate-500">Last updated: March 3, 2026</p>

            {/* ── SECTION 1 ── */}
            <section className="mb-6 border-b border-slate-200 pb-5">
                <h2 className="mb-2 text-xl font-semibold text-indigo-800">1. Data we collect</h2>
                <p className="leading-7 text-slate-600">We collect the following personal data when you register:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 leading-7 text-slate-600">
                    <li>Username</li>
                    <li>Email address</li>
                    <li>Password (securely stored with hash)</li>
                    <li>Avatar (optional)</li>
                </ul>
            </section>

            {/* ── SECTION 2 ── */}
            <section className="mb-6 border-b border-slate-200 pb-5">
                <h2 className="mb-2 text-xl font-semibold text-indigo-800">2. How we use your data</h2>
                <p className="leading-7 text-slate-600">Your data is used exclusively for:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 leading-7 text-slate-600">
                    <li>Managing your account and authentication</li>
                    <li>Displaying your profile to other users</li>
                    <li>Managing your friends list</li>
                    <li>Showing your online/offline status</li>
                </ul>
            </section>

            {/* ── SECTION 3 ── */}
            <section className="mb-6 border-b border-slate-200 pb-5">
                <h2 className="mb-2 text-xl font-semibold text-indigo-800">3. Security</h2>
                <p className="leading-7 text-slate-600">
                    All passwords are stored using <strong>bcrypt</strong> with salt.
                    Authentication is done via <strong>JWT</strong> (JSON Web Tokens).
                    We never share your data with third parties.
                </p>
            </section>

            {/* ── SECTION 4 ── */}
            <section className="mb-6 border-b border-slate-200 pb-5">
                <h2 className="mb-2 text-xl font-semibold text-indigo-800">4. Your rights</h2>
                <p className="leading-7 text-slate-600">You have the right to:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 leading-7 text-slate-600">
                    <li>Access your personal data</li>
                    <li>Modify your profile at any time</li>
                    <li>Delete your account</li>
                </ul>
            </section>

            {/* ── SECTION 5 ── */}
            <section>
                <h2 className="mb-2 text-xl font-semibold text-indigo-800">5. Contact</h2>
                <p className="leading-7 text-slate-600">
                    This project has been developed as part of the <strong>42</strong> curriculum.
                    For any privacy-related questions, contact the development team.
                </p>
            </section>

            </div>
        </div>
    );
}

export default Privacidad;