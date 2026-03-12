// ============================================================================
// PERFIL.TSX - User Profile Page
// ============================================================================
// This component replaces the original perfil.html.
// KEY CHANGE from HTML: the component state
// (user data, whether the modal is open, etc.) is managed with useState()
// instead of loose global variables.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Perfil.css';
import { API_URL } from '../config';

// ============================================================================
// TYPES (TypeScript)
// ============================================================================
// We define the "shape" of a user object so TypeScript can warn us
// if we try to access a field that does not exist.
interface User {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    onlineStatus: boolean;
    lastConnection: string | null;
    createdAt: string;
}

interface Friend {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    onlineStatus: boolean;
}

// ============================================================================
// MAIN COMPONENT: Perfil
// ============================================================================
function Perfil() {

    // ========================================================================
    // COMPONENT STATE // useState hooks are always the first thing that loads
    // ========================================================================
    const [user, setUser] = useState<User | null>(null);   // User data
                                        // the state can be: a User or null (starts as null)

    const [friends, setFriends] = useState<Friend[]>([]);               // Friends list

    // Edit modal state: true = open, false = closed
    const [modalOpen, setModalOpen] = useState(false);

    // Edit form field state
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');

    // Floating notification state
    const [notification, setNotification] = useState<{ message: string; tipo: 'success' | 'error' } | null>(null);

    const navigate = useNavigate();

    // ========================================================================
    // EFFECT: Load data when the page opens (after the 'return' renders on screen)
    // ========================================================================
    useEffect(() => {
        // Read token from URL if coming from 42 login
        const params = new URLSearchParams(window.location.search);
        const tokenFromURL   = params.get('token');
        const userIdFromURL  = params.get('userId');

        if (tokenFromURL && userIdFromURL) {
            localStorage.setItem('token', tokenFromURL);
            localStorage.setItem('userId', userIdFromURL);
            // Clean the URL so the token is not visible
            window.history.replaceState({}, '', '/perfil');
        }

        // STEP 1: Get the token from localStorage
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        // STEP 2: If there is no session, redirect to login
        if (!token || !userId) {
            navigate('/');
            return;
        }

        // STEP 3: Load the profile and friends
        loadProfile(parseInt(userId), token);
        loadFriends(parseInt(userId), token);
    }, []); // [] = run only on mount

    // ========================================================================
    // FUNCTION: Load profile data
    // ========================================================================
    async function loadProfile(userId: number, token: string) {
        try {
            // STEP 1: Request to the backend
            const response = await fetch(`${API_URL}/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error loading profile');

            // STEP 2: Save the data in state
            const data: User = await response.json();
            setUser(data);  // before: document.getElementById('profileName').textContent = ...

        } catch (error) {
            console.error('Error:', error);
            showNotification('Error loading the profile', 'error');
        }
    }

    // ========================================================================
    // FUNCTION: Load friends list
    // ========================================================================
    async function loadFriends(userId: number, token: string) {
        try {
            // CORRECT ROUTE: /users/:userId/my_friends
            // (the original perfil.html had a bug and used /amigos/:userId which did not exist)
            const response = await fetch(`${API_URL}/users/${userId}/my_friends`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error loading friends');

            const data = await response.json();
            setFriends(data.friends || []);

        } catch (error) {
            console.error('Error:', error);
        }
    }

    // ========================================================================
    // FUNCTION: Change online/offline status
    // ========================================================================
    async function changeStatus() {
        if (!user) return;

        const token = localStorage.getItem('token');
        const newStatus = !user.onlineStatus;

        try {
            const response = await fetch(`${API_URL}/users/${user.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ onlineStatus: newStatus })
            });

            if (!response.ok) throw new Error('Error changing status');

            // Update the local user state (without reloading the page)
            const data = await response.json();
            setUser(data.user);

            showNotification(
                newStatus ? 'You are now online' : 'You are now offline',
                'success'
            );

        } catch (error) {
            console.error('Error:', error);
            showNotification('Error changing status', 'error');
        }
    }

    // ========================================================================
    // FUNCTION: Open the edit modal (fills fields with current data)
    // ========================================================================
    function openModal() {
        if (!user) return;
        setEditName(user.name);
        setEditEmail(user.email);
        setEditPassword('');
        setModalOpen(true);
    }

    // ========================================================================
    // FUNCTION: Save profile changes
    // ========================================================================
    async function saveChanges() {
        if (!user) return;

        const token = localStorage.getItem('token');
        const dataToSend: any = { nombre: editName, email: editEmail };

        if (editPassword) {
            dataToSend.password = editPassword;
        }

        try {
            const response = await fetch(`${API_URL}/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) throw new Error('Error updating profile');

            // Reload profile data after saving
            await loadProfile(user.id, token!);
            setModalOpen(false);
            showNotification('Profile updated successfully', 'success');

        } catch (error) {
            console.error('Error:', error);
            showNotification('Error updating profile', 'error');
        }
    }

    // ========================================================================
    // FUNCTION: Upload new avatar
    // ========================================================================
    async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        const token = localStorage.getItem('token');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/users/${user.id}/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Error uploading avatar');

            const data = await response.json();
            // Update only the avatar in state, without reloading everything
            setUser(prev => prev ? { ...prev, avatar: data.avatarUrl } : prev);
            showNotification('Avatar updated successfully', 'success');

        } catch (error) {
            console.error('Error:', error);
            showNotification('Error uploading avatar', 'error');
        }
    }

    // ========================================================================
    // FUNCTION: Logout
    // ========================================================================
    async function logout() {
        const token = localStorage.getItem('token');

        try {
            // Mark as offline before logging out
            if (user) {
                await fetch(`${API_URL}/users/${user.id}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ onlineStatus: false })
                });
            }
        } catch (error) {
            console.error('Error changing status:', error);
        }

        // Clear localStorage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/');
    }

    // ========================================================================
    // FUNCTION: Show floating notification
    // ========================================================================
    function showNotification(message: string, tipo: 'success' | 'error') {
        setNotification({ message, tipo });
        // Hide the notification after 3 seconds
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    }

    // ========================================================================
    // RENDER
    // ========================================================================
    // If the user has not loaded yet, show a loading message
    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', color: 'white', fontSize: '20px' }}>
                Loading profile...
            </div>
        );
    }

    return (
        <div>
            {/* ================================================================ */}
            {/* FLOATING NOTIFICATION */}
            {/* Only rendered if notification is not null */}
            {/* ================================================================ */}
            {notification && (
                <div className={`notification ${notification.tipo}`}>
                    {notification.message}
                </div>
            )}

            <div className="perfil-container">

                {/* ============================================================ */}
                {/* PROFILE HEADER */}
                {/* ============================================================ */}
                <div className="perfil-header">
                    <div className="avatar-container">
                        <img
                            className="avatar"
                            src={user.avatar ? `${API_URL}${user.avatar}` : `${API_URL}/avatares/default-avatar.svg`}
                            onError={(e) => { (e.target as HTMLImageElement).src = `${API_URL}/avatares/default-avatar.svg`; }}
                            alt="Avatar"
                        />
                        <div className={`status-indicator ${user.onlineStatus ? '' : 'offline'}`}></div>
                    </div>

                    <h1 className="profile-name">{user.name}</h1>
                    <p className="profile-email">{user.email}</p>

                    <div className="action-buttons">
                        <button className="btn btn-primary" onClick={openModal}>
                            📝 Edit Profile
                        </button>

                        {/* Hidden file input for the avatar */}
                        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                            📷 Change Avatar
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={uploadAvatar}
                            />
                        </label>

                        <button
                            className={`btn ${user.onlineStatus ? 'btn-danger' : 'btn-success'}`}
                            onClick={changeStatus}
                        >
                            {user.onlineStatus ? '🔴 Disconnect' : '🟢 Connect'}
                        </button>

                        {/* button to go to the friends page */}
                        <button className="btn btn-primary" onClick={() => navigate('/amigos')}>
                            👥 My Friends
                        </button>

                        <button className="btn btn-danger" onClick={logout}>
                            🚪 Log Out
                        </button>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* PROFILE CONTENT */}
                {/* ============================================================ */}
                <div className="perfil-content">

                    {/* SECTION: INFORMATION */}
                    <div className="section">
                        <h2 className="section-title">📋 Profile Information</h2>
                        <div className="info-grid">
                            <div className="info-card">
                                <div className="info-label">Status</div>
                                <div className="info-value">
                                    <span className={`status-badge ${user.onlineStatus ? 'online' : 'offline'}`}>
                                        {user.onlineStatus ? '🟢 Online' : '🔴 Offline'}
                                    </span>
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-label">Last Connection</div>
                                <div className="info-value">
                                    {user.lastConnection
                                        ? new Date(user.lastConnection).toLocaleString()
                                        : '-'
                                    }
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-label">Member Since</div>
                                <div className="info-value">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="info-card">
                                <div className="info-label">Total Friends</div>
                                <div className="info-value">{friends.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: FRIENDS */}
                    <div className="section">
                        <h2 className="section-title">👥 My Friends</h2>
                        {friends.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#666' }}>
                                You have no friends yet
                            </p>
                        ) : (
                            <div className="friends-grid">
                                {/* In React, to show lists we use .map() instead of innerHTML */}
                                {friends.map(friend => (
                                    <div key={friend.id} className="friend-card">
                                        <img
                                            src={friend.avatar ? `${API_URL}${friend.avatar}` : `${API_URL}/avatares/default-avatar.svg`}
                                            alt={friend.name}
                                            className="friend-avatar"
                                        />
                                        <div className="friend-name">{friend.name}</div>
                                        <div className={`friend-status ${friend.onlineStatus ? 'online' : ''}`}>
                                            {friend.onlineStatus ? '🟢 Online' : '🔴 Offline'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* FOOTER WITH LEGAL LINKS */}
                <footer style={{
                    textAlign: 'center',
                    padding: '24px 40px 32px',
                    color: '#999',
                    fontSize: '0.8rem',
                    borderTop: '1px solid #f0f0f0',
                    marginTop: '8px'
                }}>
                    <a href="/privacidad" style={{color: '#667eea', marginRight: '16px', textDecoration: 'none'}}>Privacy Policy</a>
                    <a href="/terminos" style={{color: '#667eea', textDecoration: 'none'}}>Terms of Service</a>
                </footer>
            </div>

            {/* ================================================================ */}
            {/* EDIT MODAL */}
            {/* Only rendered if modalOpen === true */}
            {/* ================================================================ */}
            {modalOpen && (
                // Clicking the dark backdrop closes the modal
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
                    <div className="modal-content">
                        <h2 className="modal-title">✏️ Edit Profile</h2>

                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">New Password (optional)</label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Leave blank to keep unchanged"
                                value={editPassword}
                                onChange={e => setEditPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-buttons">
                            <button
                                className="btn-block"
                                style={{ background: '#ef4444', color: 'white' }}
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-block"
                                style={{ background: '#10b981', color: 'white' }}
                                onClick={saveChanges}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Perfil;
