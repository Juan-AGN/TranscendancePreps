// ============================================================================
// APP.TSX - MAIN ROUTER
// ============================================================================
// This file defines the application "pages" and which URL each one maps to.
// Before we had 3 separate HTML files (index.html, profile.html, friends.html).
// Now we have 3 React components and the Router decides which to show based on the URL.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// ============================================================================
// COMPONENT: ProtectedRoute
// ============================================================================
// This component works like a security guard.
// If the user has NO token (hasn't logged in), it sends them to login.
// If they DO have a token, it lets them see the requested page.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get('token');
    const token = localStorage.getItem('token') || tokenFromURL;

    if (!token) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

// ============================================================================
// MAIN COMPONENT: App
// ============================================================================
function App() {
    return (
        // BrowserRouter: enables the routing system in the application
        <BrowserRouter>
            <Routes>
                {/* Route "/" -> Login page (was index.html) */}
                <Route 
                    path="/" 
                    element={<Login />} />

                {/* Route "/profile" -> User profile (was profile.html) */}
                {/* Protected: if not logged in, redirects to "/" */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* Route "/friends" -> Friends management (was friends.html) */}
                {/* Also protected */}
                <Route
                    path="/friends"
                    element={
                        <ProtectedRoute>
                            <Friends />
                        </ProtectedRoute>
                    }
                />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Any other route -> redirect to login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
