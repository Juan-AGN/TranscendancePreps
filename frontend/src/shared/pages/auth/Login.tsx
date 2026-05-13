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
    const inputClass = 'w-full rounded-[clamp(0.5rem,1.5vw,0.75rem)] border px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.45rem,1.4vh,0.75rem)] text-[clamp(0.75rem,1.6vw,0.875rem)] outline-none';
    const tabBase = 'w-full max-w-[220px] rounded-full px-[clamp(0.75rem,2vw,1rem)] py-[clamp(0.45rem,2vh,1rem)] text-[clamp(0.65rem,1.5vw,0.875rem)] font-semibold uppercase transition-all duration-300 ease-out cursor-pointer';
    const tabActive = 'border border-cyan-400/30 bg-cyan-300/20 text-yellow-600/80 backdrop-blur-md shadow-[0_0_16px_rgba(56,189,248,0.22),inset_0_1px_0_rgba(255,255,255,0.45)]';
    const tabInactive = 'border border-yellow-500/35 bg-white/10 text-yellow-900/50 hover:-translate-y-[1px] hover:border-cyan-300/20 hover:bg-white/40 hover:text-yellow-800/70 hover:shadow-[0_0_18px_rgba(255,215,120,0.15)]';

    return (
        <div className="relative flex h-dvh w-dvw items-center justify-center overflow-hidden overflow-y-auto bg-cover bg-center bg-no-repeat p-[clamp(0.5rem,2vw,2rem)]"
            style={{ backgroundImage: "url('./bgLogin.png')" }}>

            <div className="relative w-[min(90vw,48rem)]">

                <div className="absolute left-1/2 top-0 z-20 h-[clamp(90px,18vh,180px)] w-[clamp(90px,18vh,180px)] -translate-x-1/2 -translate-y-1/2
                                bg-contain bg-center bg-no-repeat drop-shadow-[0_0_22px_rgba(56,189,248,0.45)]"
                    style={{ backgroundImage: "url('/LoginBiometric.png')" }}>

                </div>

                <div className="w-[min(90vw,48rem)] max-h-[calc(100dvh-6rem)] overflow-y-auto bg-white/[0.15] backdrop-blur-[5px] border border-yellow-500/50 pt-[clamp(1.5rem,10vh,6rem)]
                            rounded-[clamp(1rem,2vw,1.5rem)] shadow-[0_20px_80px_rgba(90,60,20,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] ">

                    <p className="text-[clamp(0.65rem,1.5vw,0.85rem)] mb-5 tracking-[0.25em] text-center uppercase text-yellow-800/85">Identity Verification</p>

                    <div className="mx-auto flex w-full max-w-[520px] justify-center gap-[clamp(0.4rem,1.5vw,1rem)] px-3">
                        <button className={`${tabBase} ${activeTab === 'login'
                                ? tabActive
                                : tabInactive}`}
                            onClick={() => {
                                setActiveTab('login');
                                setLoginAlert(null);
                                setRegisterAlert(null);
                            }}>
                            Sign In
                        </button>
                        <button className={`${tabBase} ${activeTab === 'register'
                                ? tabActive
                                : tabInactive}`}
                            onClick={() => {
                                setActiveTab('register');
                                setLoginAlert(null);
                                setRegisterAlert(null);
                            }}>
                            Sign Up
                        </button>
                    </div>

                    <div className="px-[clamp(1rem,3vw,2rem)] py-[clamp(0.75rem,2.5vh,1.5rem)]">
                        {activeTab === 'login' && (
                            <div>
                                {loginAlert && (
                                    <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${loginAlert.tipo === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                        {loginAlert.tipo === 'success' ? '✅ ' : '❌ '}
                                        {loginAlert.message}
                                    </div>
                                )}

                                <div className="w-full max-w-sm mx-auto mb-[clamp(0.5rem,2vh,1rem)]">
                                    <label className="mb-[clamp(0.25rem,0.8vh,0.5rem)] block text-[clamp(0.7rem,1.5vw,0.875rem)] font-semibold text-slate-700">Email</label>
                                    <input
                                        type="email"
                                        className={inputClass}
                                        placeholder="your@email.com"
                                        value={loginEmail}
                                        onChange={e => setLoginEmail(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && doLogin()}
                                    />
                                </div>

                                <div className="w-full max-w-sm mx-auto mb-[clamp(0.5rem,2vh,1rem)]">
                                    <label className="mb-[clamp(0.25rem,0.8vh,0.5rem)] block text-[clamp(0.7rem,1.5vw,0.875rem)] font-semibold text-slate-700">Password</label>
                                    <input
                                        type="password"
                                        className={inputClass}
                                        placeholder="Your password"
                                        value={loginPassword}
                                        onChange={e => setLoginPassword(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && doLogin()}
                                    />
                                </div>

                                <div className="mt-[clamp(2.6rem,2vh,1.5rem)] flex flex-wrap items-center justify-center gap-[clamp(0.4rem,1.5vw,1rem)]">
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

                                <div className="mx-auto max-w-sm w-full mb-[clamp(0.5rem,2vh,1rem)] ">
                                    <label className="mb-[clamp(0.25rem,0.8vh,0.5rem)] block text-[clamp(0.7rem,1.5vw,0.875rem)] font-semibold text-slate-700">Name</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        placeholder="Your full name"
                                        value={registerName}
                                        onChange={e => setRegisterName(e.target.value)}
                                    />
                                </div>

                                <div className="mx-auto max-w-sm w-full mb-[clamp(0.5rem,2vh,1rem)]">
                                    <label className="mb-[clamp(0.25rem,0.8vh,0.5rem)] block text-[clamp(0.7rem,1.5vw,0.875rem)] font-semibold text-slate-700">Email</label>
                                    <input
                                        type="email"
                                        className={inputClass}
                                        placeholder="your@email.com"
                                        value={registerEmail}
                                        onChange={e => setRegisterEmail(e.target.value)}
                                    />
                                </div>

                                <div className="mx-auto max-w-sm w-full mb-[clamp(0.5rem,2vh,1rem)]">
                                    <label className="mb-[clamp(0.25rem,0.8vh,0.5rem)] block text-[clamp(0.7rem,1.5vw,0.875rem)] font-semibold text-slate-700">Password</label>
                                    <input
                                        type="password"
                                        className={inputClass}
                                        placeholder="Minimum 6 characters"
                                        value={registerPassword}
                                        onChange={e => setRegisterPassword(e.target.value)}
                                    />
                                </div>
                                <div className="mt-[clamp(1.6rem,2vh,1.5rem)] flex flex-wrap items-center justify-center gap-[clamp(0.4rem,1.5vw,1rem)]">
                                    <IntroButtons label="Create Account" onCLick={doRegister} />
                                </div>
                            </div>
                        )}
                    </div>


                </div>
            </div>
        </div>

    );
}

export default Login;
