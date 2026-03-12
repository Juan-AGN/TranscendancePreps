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
import './Login.css';
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
                    nombre: registerName,
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
    return (
        <div className="login-container">

            {/* HEADER */}
            <div className="login-header">
                <div className="login-header-logo">🏓</div>
                <h1 className="login-header-titulo">Transcendence</h1>
                <p className="login-header-subtitulo">42 Project - User Management</p>
            </div>

            {/* TABS */}
            <div className="login-tabs">
                <button
                    className={`login-tab ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('login');
                        setLoginAlert(null);
                        setRegisterAlert(null);
                    }}
                >
                    Sign In
                </button>
                <button
                    className={`login-tab ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('register');
                        setLoginAlert(null);
                        setRegisterAlert(null);
                    }}
                >
                    Sign Up
                </button>
            </div>

            {/* FORMS */}
            <div className="login-form-container">
                {/* ---------------------------------------------------------- */}
                {/* LOGIN TAB: only shown if activeTab === 'login' */}
                {/* ---------------------------------------------------------- */}
                {activeTab === 'login' && ( // if activeTab is 'login' -> show the following (&&)
                    <div>
                        {/* Alert: only rendered if loginAlert is not null */}
                        {loginAlert && (
                            <div className={`alerta ${loginAlert.tipo}`}>
                                {loginAlert.tipo === 'success' ? '✅ ' : '❌ '}
                                {loginAlert.message}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            {/* value={loginEmail} -> displays the state */}
                            {/* onChange={e => setLoginEmail(e.target.value)} -> updates state on input */}
                            <input
                                type="email"
                                className="form-input"
                                placeholder="your@email.com"
                                value={loginEmail}
                                onChange={e => setLoginEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && doLogin()}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input  
                                type="password"
                                className="form-input"
                                placeholder="Your password"
                                value={loginPassword}
                                onChange={e => setLoginPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && doLogin()}
                            />
                        </div>

                        <button className="btn-submit" onClick={doLogin}>
                            Sign In
                        </button>
                    </div>
                )}

                {/* ---------------------------------------------------------- */}
                {/* REGISTER TAB: only shown if activeTab === 'register' */}
                {/* ---------------------------------------------------------- */}
                {activeTab === 'register' && (
                    <div>
                        {registerAlert && (
                            <div className={`alerta ${registerAlert.tipo}`}>
                                {registerAlert.tipo === 'success' ? '✅ ' : '❌ '}
                                {registerAlert.message}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Your full name"
                                value={registerName}
                                onChange={e => setRegisterName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="your@email.com"
                                value={registerEmail}
                                onChange={e => setRegisterEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Minimum 6 characters"
                                value={registerPassword}
                                onChange={e => setRegisterPassword(e.target.value)}
                            />
                        </div>

                        <button className="btn-submit" onClick={doRegister}>
                            Create Account
                        </button>
                    </div>
                )}
            </div>

            {/* DIVIDER */}
            <div style={{ textAlign: 'center', margin: '0 40px 16px', color: '#bbb', fontSize: '13px' }}>— or —</div>

            {/* LOGIN WITH 42 BUTTON */}
            <div style={{ padding: '0 40px 24px' }}>
                <a href="http://localhost:3000/auth/42" style={{ textDecoration: 'none' }}>
                    <button className="btn-42">
                        🎓 Login with 42
                    </button>
                </a>
            </div>

            {/* FOOTER WITH LEGAL LINKS */}
            <footer className="login-footer">
                <a href="/privacidad">Privacy Policy</a>
                <a href="/terminos">Terms of Service</a>
            </footer>
        </div>

    );
}

export default Login;
