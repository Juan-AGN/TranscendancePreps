// ============================================================================
// LOGIN.TSX - Login and Registration Page
// ============================================================================
// This component replaces the original index.html.
// Key differences from vanilla HTML:
//   - Instead of document.getElementById() we use useState() for state
//   - Instead of onclick="" we use onClick={}
//   - Instead of value="..." on inputs we use value={variable} + onChange
//   - JSX looks like HTML but it is JavaScript (hence className instead of class)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';  // for navigating between pages
import { API_URL } from '../config';

// ============================================================================
// MAIN COMPONENT: Login
// ============================================================================
function Login() {

    // ========================================================================
    // COMPONENT STATE
    // ========================================================================
    // useState() is like having variables that, when changed, cause React to update the screen.
    // Before with vanilla HTML: document.getElementById('loginEmail').value
    // Now with React:           loginEmail (the variable) and setLoginEmail (the function to change it)

    // LOGIN form state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // REGISTER form state
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');

    // Tab state: 'login' or 'register'
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

    // Alert state: null = do not show, { message, type } = show
    const [loginAlert, setLoginAlert] = useState<{ message: string; tipo: 'success' | 'error' } | null>(null);
    const [registerAlert, setRegisterAlert] = useState<{ message: string; tipo: 'success' | 'error' } | null>(null);

    // Hook for navigating to other pages (replaces window.location.href)
    const navigate = useNavigate();

    // ========================================================================
    // EFFECT: Check if there is already an active session when the page loads
    // ========================================================================
    // useEffect() is like window.onload -> runs when the component appears on screen
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Session already exists -> go directly to the profile
            navigate('/perfil');
        }
    }, []); // The empty [] means "run only once when the component mounts"

    // ========================================================================
    // FUNCTION: DO LOGIN
    // ========================================================================
    async function doLogin() {

        // STEP 1: Validate that fields are not empty
        if (!loginEmail || !loginPassword) {
            setLoginAlert({ message: 'Please fill in the email and password', tipo: 'error' });
            return;
        }

        try {
            // STEP 2: Send the data to the backend (same as before with fetch)
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword
                })
            });

            // STEP 3: Read the server response
            const data = await response.json();

            // STEP 4: Check if the login was successful
            if (response.ok) {
                // Save the token AND userId in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.user.id);

                setLoginAlert({ message: 'Login successful! Redirecting...', tipo: 'success' });

                // STEP 5: Redirect to the profile after a short delay
                setTimeout(() => {
                    navigate('/perfil');  // before: window.location.href = '/perfil.html'
                }, 800);

            } else {
                setLoginAlert({ message: data.error || 'Incorrect email or password', tipo: 'error' });
            }

        } catch (error) {
            console.error('Network error:', error);
            setLoginAlert({ message: 'Cannot connect to the server', tipo: 'error' });
        }
    }

    // ========================================================================
    // FUNCTION: DO REGISTER
    // ========================================================================
    async function doRegister() {

        // STEP 1: Validate fields
        if (!registerName || !registerEmail || !registerPassword) {
            setRegisterAlert({ message: 'Please fill in all fields', tipo: 'error' });
            return;
        }

        // Validate that the email has the correct format (something@something.something)
        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail);
        if (!validEmail) {
            setRegisterAlert({ message: 'The email format is not valid', tipo: 'error' });
            return;
        }

        if (registerPassword.length < 6) {
            setRegisterAlert({ message: 'The password must be at least 6 characters long', tipo: 'error' });
            return;
        }

        try {
            // STEP 2: Send to the backend
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: registerName,
                    email: registerEmail,
                    password: registerPassword
                })
            });

            // STEP 3: Read the response
            const data = await response.json();

            // STEP 4: If successful
            if (response.ok) {
                setRegisterAlert({ message: 'Account created! You can now sign in', tipo: 'success' });

                // Save the email to pre-fill the login form automatically
                const usedEmail = registerEmail;

                // Clear the registration form
                setRegisterName('');
                setRegisterEmail('');
                setRegisterPassword('');

                // Switch to the login tab and pre-fill the email
                setTimeout(() => {
                    setActiveTab('login');
                    setLoginEmail(usedEmail);
                    setRegisterAlert(null);
                }, 1500);

            } else {
                setRegisterAlert({ message: data.error || 'Error creating the account', tipo: 'error' });
            }

        } catch (error) {
            console.error('Network error:', error);
            setRegisterAlert({ message: 'Cannot connect to the server', tipo: 'error' });
        }
    }

    // ========================================================================
    // RENDER (what is shown on screen)
    // ========================================================================
    // This is JSX: it looks like HTML but it is JavaScript.
    // Main differences:
    //   - onclick -> onClick
    //   - class -> className
    //   - Variables go inside curly braces: {variable}
    //   - Events receive functions: onClick={() => doLogin()}
    const inputClass = 'w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100';
    const primaryButtonClass = 'mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300';

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-700 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-8 text-center text-white">
                    <div className="mb-2 text-5xl">🏓</div>
                    <h1 className="text-3xl font-bold">Transcendence</h1>
                    <p className="mt-1 text-sm text-indigo-100">42 Project - User Management</p>
                </div>

                <div className="flex border-b-2 border-slate-100">
                    <button
                        className={`flex-1 px-4 py-4 text-sm font-semibold transition ${activeTab === 'login' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-500'}`}
                        onClick={() => {
                            setActiveTab('login');
                            setLoginAlert(null);
                            setRegisterAlert(null);
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        className={`flex-1 px-4 py-4 text-sm font-semibold transition ${activeTab === 'register' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-500'}`}
                        onClick={() => {
                            setActiveTab('register');
                            setLoginAlert(null);
                            setRegisterAlert(null);
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="px-8 py-8">
                    {activeTab === 'login' && (
                        <div>
                            {loginAlert && (
                                <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${loginAlert.tipo === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                    {loginAlert.tipo === 'success' ? '✅ ' : '❌ '}
                                    {loginAlert.message}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                                <input
                                    type="email"
                                    className={inputClass}
                                    placeholder="your@email.com"
                                    value={loginEmail}
                                    onChange={e => setLoginEmail(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && doLogin()}
                                />
                            </div>

                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                                <input
                                    type="password"
                                    className={inputClass}
                                    placeholder="Your password"
                                    value={loginPassword}
                                    onChange={e => setLoginPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && doLogin()}
                                />
                            </div>

                            <button className={primaryButtonClass} onClick={doLogin}>
                                Sign In
                            </button>
                        </div>
                    )}

                    {activeTab === 'register' && (
                        <div>
                            {registerAlert && (
                                <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${registerAlert.tipo === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                    {registerAlert.tipo === 'success' ? '✅ ' : '❌ '}
                                    {registerAlert.message}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Your full name"
                                    value={registerName}
                                    onChange={e => setRegisterName(e.target.value)}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                                <input
                                    type="email"
                                    className={inputClass}
                                    placeholder="your@email.com"
                                    value={registerEmail}
                                    onChange={e => setRegisterEmail(e.target.value)}
                                />
                            </div>

                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                                <input
                                    type="password"
                                    className={inputClass}
                                    placeholder="Minimum 6 characters"
                                    value={registerPassword}
                                    onChange={e => setRegisterPassword(e.target.value)}
                                />
                            </div>

                            <button className={primaryButtonClass} onClick={doRegister}>
                                Create Account
                            </button>
                            </div>
                        )}
                </div>

                <div className="px-8 pb-4 text-center text-xs text-slate-400">- or -</div>

                <div className="px-8 pb-6">
                    <a href={`${API_URL}/auth/42`} className="block no-underline">
                        <button className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-600 hover:shadow-lg hover:shadow-cyan-300">
                            🎓 Login with 42
                        </button>
                    </a>
                </div>

                <footer className="pb-7 text-center text-xs text-slate-400">
                    <a href="/privacidad" className="mx-2 text-indigo-500 hover:underline">Privacy Policy</a>
                    <a href="/terminos" className="mx-2 text-indigo-500 hover:underline">Terms of Service</a>
                </footer>
            </div>
        </div>
    );
}

export default Login;
