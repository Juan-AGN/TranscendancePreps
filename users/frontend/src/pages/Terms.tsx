import { useNavigate } from 'react-router-dom';

// ============================================================
// PAGE: TERMS OF SERVICE
// Required according to the Transcendence subject
// ============================================================

function Terms() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-violet-700 p-4 md:p-8">
            <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-2xl md:p-10">

            {/* ── BACK BUTTON ── */}
            <button className="mb-6 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700" onClick={() => navigate(-1)}>
                ← Back
            </button>

            <h1 className="mb-2 text-3xl font-bold text-indigo-800">📜 Terms of Service</h1>
            <p className="mb-6 text-sm text-slate-500">Last updated: March 3, 2026</p>

            {/* ── SECTION 1 ── */}
            <section className="mb-6 border-b border-slate-200 pb-5">
                <h2 className="mb-2 text-xl font-semibold text-indigo-800">1. Acceptance of terms</h2>
                <p className="leading-7 text-slate-600">
                    By registering and using Transcendence, you accept these terms of service.
                    If you do not agree, do not use the application.
                </p>
            </section>

            {/* ── SECTION 2 ── */}
            <section className="mb-6 border-b border-slate-200 pb-5">
                <h2 className="mb-2 text-xl font-semibold text-indigo-800">2. Acceptable use</h2>
                <p className="leading-7 text-slate-600">You agree to:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 leading-7 text-slate-600">
                    <li>Not use the application for illegal activities</li>
                    <li>Not attempt to access other users' accounts</li>
                    <li>Not share offensive or inappropriate content</li>
                    <li>Respect other users in chat and the game</li>
                </ul>
            </section>

            {/* ── SECTION 3 ── */}
            <section className="mb-6 border-b border-slate-200 pb-5">
                <h2 className="mb-2 text-xl font-semibold text-indigo-800">3. Your account</h2>
                <p className="leading-7 text-slate-600">
                    You are responsible for keeping your password secure.
                    Each user can have only one account.
                    We reserve the right to delete accounts that violate these terms.
                </p>
            </section>

            {/* ── SECTION 4 ── */}
            <section className="mb-6 border-b border-slate-200 pb-5">
                <h2 className="mb-2 text-xl font-semibold text-indigo-800">4. Service availability</h2>
                <p className="leading-7 text-slate-600">
                    This project is part of the <strong>42</strong> curriculum and is offered
                    as-is. We do not guarantee continuous availability of the service.
                </p>
            </section>

            {/* ── SECTION 5 ── */}
            <section>
                <h2 className="mb-2 text-xl font-semibold text-indigo-800">5. Modifications</h2>
                <p className="leading-7 text-slate-600">
                    We may update these terms at any time.
                    Continued use of the application implies acceptance of the new terms.
                </p>
            </section>

            </div>
        </div>
    );
}

export default Terms;