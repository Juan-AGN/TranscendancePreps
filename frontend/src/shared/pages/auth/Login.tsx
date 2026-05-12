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
import { API_URL } from './config';
import { Footer } from '../../components/layout/Footer';
import { IntroButtons } from '../IntroPage';

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
            navigate('/profile');
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
                    navigate('/profile');  // before: window.location.href = '/profile.html'
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
    const inputClass = 'w-full rounded-xl border-1 border-yellow-400 px-4 py-3 text-slate-800 outline-none transition focus:border-yellow-400 focus:ring-1';

    return (
        <div className="flex min-h-screen items-center justify-center bg-cover bg-no-repeat p-4"
            style={{ backgroundImage: "url('./bgLogin.png')" }}>
            <div className="w-full max-w-3xl  overflow-hidden border-1 border-yellow-500/50 rounded-3xl shadow-2xl">
                <div className="bg-transparent px-8 py-8 text-center">
                    <div className="mb-2 text-5xl">🏓</div>
                    <h1 className="text-3xl font-bold">Transcendence</h1>
                    <p className="mt-1 text-sm text-indigo-100">42 Project - User Management</p>
                </div>

                <div className="flex ">
                    <button
                        className={`flex-1 px-4 py-4 text-sm font-semibold uppercase transition ${activeTab === 'login'
                            ? 'border-b-2 rounded-full border-yellow-400 bg-white/25 text-yellow-500'
                            : 'text-slate-400 hover:bg-black/10 rounded-full hover:text-yellow-500'}`}
                        onClick={() => {
                            setActiveTab('login');
                            setLoginAlert(null);
                            setRegisterAlert(null);
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        className={`flex-1 px-4 py-4 text-sm font-semibold uppercase transition ${activeTab === 'register'
                            ? 'border-b-2 rounded-full border-yellow-400 bg-white/25 text-yellow-500'
                            : 'text-slate-400 hover:bg-black/10 rounded-full hover:text-yellow-500'}`}
                        onClick={() => {
                            setActiveTab('register');
                            setLoginAlert(null);
                            setRegisterAlert(null);
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="px-8 py-6">
                    {activeTab === 'login' && (
                        <div>
                            {loginAlert && (
                                <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${loginAlert.tipo === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                    {loginAlert.tipo === 'success' ? '✅ ' : '❌ '}
                                    {loginAlert.message}
                                </div>
                            )}

                            <div className="w-full max-w-sm mx-auto mb-4">
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

                            <div className="w-full max-w-sm mx-auto mb-5">
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

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                                <IntroButtons label="Sign In" onCLick={doLogin} />
                                <span className="text-xs text-slate-400">- or -</span>
                                <a href={`${API_URL}/auth/42`} className="block no-underline">
                                    <IntroButtons label="Login 42" />
                                </a>
                            </div>
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

                            <div className="mx-auto max-w-sm w-full mb-4 ">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
                                <input
                                    type="text"
                                    className={inputClass}
                                    placeholder="Your full name"
                                    value={registerName}
                                    onChange={e => setRegisterName(e.target.value)}
                                />
                            </div>

                            <div className="mx-auto max-w-sm w-full mb-4">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                                <input
                                    type="email"
                                    className={inputClass}
                                    placeholder="your@email.com"
                                    value={registerEmail}
                                    onChange={e => setRegisterEmail(e.target.value)}
                                />
                            </div>

                            <div className="mx-auto max-w-sm w-full mb-5">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                                <input
                                    type="password"
                                    className={inputClass}
                                    placeholder="Minimum 6 characters"
                                    value={registerPassword}
                                    onChange={e => setRegisterPassword(e.target.value)}
                                />
                            </div>
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                            <IntroButtons label="Create Account" onCLick={doRegister}/>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-6" />


            </div>
            <div className="absolute bottom-0 left-0 right-0 z-20">
                <Footer />
            </div>
        </div>

    );
}

export default Login;
