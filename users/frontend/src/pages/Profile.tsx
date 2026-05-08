// ============================================================================
// PROFILE.TSX - User Profile Page
// ============================================================================
// This component replaces the original profile.html.
// KEY CHANGE from HTML: the component state
// (user data, whether the modal is open, etc.) is managed with useState()
// instead of loose global variables.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
// MAIN COMPONENT: Profile
// ============================================================================
function Profile() {

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
            window.history.replaceState({}, '', '/profile');
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
            // (the original profile.html had a bug and used /friends/:userId which did not exist)
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
        const dataToSend: any = { name: editName, email: editEmail };

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
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-700 text-xl text-white">
                Loading profile...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-violet-700 p-4 md:p-6">
            {/* ================================================================ */}
            {/* FLOATING NOTIFICATION */}
            {/* Only rendered if notification is not null */}
            {/* ================================================================ */}
            {notification && (
                <div className={`fixed right-4 top-4 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg ${notification.tipo === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                    {notification.message}
                </div>
            )}

            <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/* ============================================================ */}
                {/* PROFILE HEADER */}
                {/* ============================================================ */}
                <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-10 text-center text-white md:px-10">
                    <div className="relative mb-5 inline-block">
                        <img
                            className="h-36 w-36 rounded-full border-4 border-white object-cover shadow-xl"
                            src={user.avatar ? `${API_URL}${user.avatar}` : `${API_URL}/avatars/default-avatar.svg`}
                            onError={(e) => { (e.target as HTMLImageElement).src = `${API_URL}/avatars/default-avatar.svg`; }}
                            alt="Avatar"
                        />
                        <div className={`absolute bottom-1 right-1 h-7 w-7 rounded-full border-2 border-white ${user.onlineStatus ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    </div>

                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="mt-1 text-indigo-100">{user.email}</p>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-indigo-600 transition hover:-translate-y-0.5 hover:shadow-md" onClick={openModal}>
                            Edit Profile
                        </button>

                        {/* Hidden file input for the avatar */}
                        <label className="cursor-pointer rounded-full bg-white px-5 py-2 text-sm font-semibold text-indigo-600 transition hover:-translate-y-0.5 hover:shadow-md">
                            Change Avatar
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={uploadAvatar}
                            />
                        </label>

                        <button
                            className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-md ${user.onlineStatus ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                            onClick={changeStatus}
                        >
                            {user.onlineStatus ? 'Disconnect' : 'Connect'}
                        </button>

                        {/* button to go to the friends page */}
                        <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-indigo-600 transition hover:-translate-y-0.5 hover:shadow-md" onClick={() => navigate('/friends')}>
                            My Friends
                        </button>

                        <button className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rose-600 hover:shadow-md" onClick={logout}>
                            Log Out
                        </button>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* PROFILE CONTENT */}
                {/* ============================================================ */}
                <div className="px-6 py-8 md:px-10">

                    {/* SECTION: INFORMATION */}
                    <div className="mb-10">
                        <h2 className="mb-5 border-b-2 border-indigo-500 pb-2 text-2xl font-bold text-slate-800">Profile Information</h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border-l-4 border-indigo-500 bg-slate-50 p-4">
                                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Status</div>
                                <div className="text-base font-medium text-slate-800">
                                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${user.onlineStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {user.onlineStatus ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-xl border-l-4 border-indigo-500 bg-slate-50 p-4">
                                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Last Connection</div>
                                <div className="text-base font-medium text-slate-800">
                                    {user.lastConnection
                                        ? new Date(user.lastConnection).toLocaleString()
                                        : '-'
                                    }
                                </div>
                            </div>
                            <div className="rounded-xl border-l-4 border-indigo-500 bg-slate-50 p-4">
                                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Member Since</div>
                                <div className="text-base font-medium text-slate-800">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="rounded-xl border-l-4 border-indigo-500 bg-slate-50 p-4">
                                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Total Friends</div>
                                <div className="text-base font-medium text-slate-800">{friends.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: FRIENDS */}
                    <div className="mb-2">
                        <h2 className="mb-5 border-b-2 border-indigo-500 pb-2 text-2xl font-bold text-slate-800">My Friends</h2>
                        {friends.length === 0 ? (
                            <p className="text-center text-slate-500">
                                You have no friends yet
                            </p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {/* In React, to show lists we use .map() instead of innerHTML */}
                                {friends.map(friend => (
                                    <div key={friend.id} className="rounded-xl bg-slate-50 p-4 text-center transition hover:-translate-y-1 hover:shadow-md">
                                        <img
                                            src={friend.avatar ? `${API_URL}${friend.avatar}` : `${API_URL}/avatars/default-avatar.svg`}
                                            alt={friend.name}
                                            className="mx-auto mb-3 block h-20 w-20 rounded-full border-2 border-indigo-400 object-cover"
                                        />
                                        <div className="font-semibold text-slate-800">{friend.name}</div>
                                        <div className={`text-xs ${friend.onlineStatus ? 'font-semibold text-emerald-600' : 'text-slate-500'}`}>
                                            {friend.onlineStatus ? 'Online' : 'Offline'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* FOOTER WITH LEGAL LINKS */}
                <footer className="mt-2 border-t border-slate-100 px-6 py-6 text-center text-xs text-slate-400 md:px-10">
                    <a href="/privacy" className="mr-4 text-indigo-500 hover:underline">Privacy Policy</a>
                    <a href="/terms" className="text-indigo-500 hover:underline">Terms of Service</a>
                </footer>
            </div>

            {/* ================================================================ */}
            {/* EDIT MODAL */}
            {/* Only rendered if modalOpen === true */}
            {/* ================================================================ */}
            {modalOpen && (
                // Clicking the dark backdrop closes the modal
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 md:p-8">
                        <h2 className="mb-6 text-2xl font-bold text-slate-800">✏️ Edit Profile</h2>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                            <input
                                type="email"
                                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-semibold text-slate-700">New Password (optional)</label>
                            <input
                                type="password"
                                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                placeholder="Leave blank to keep unchanged"
                                value={editPassword}
                                onChange={e => setEditPassword(e.target.value)}
                            />
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                className="flex-1 rounded-xl bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600"
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

export default Profile;
