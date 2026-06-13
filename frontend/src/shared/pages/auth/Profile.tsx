// ============================================================================
// PROFILE.TSX - User Profile Page
// ============================================================================
// This component replaces the original profile.html.
// KEY CHANGE from HTML: the component state
// (user data, whether the modal is open, etc.) is managed with useState()
// instead of loose global variables.

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from './config';
import { OlympusButton } from '../../components/Buttons/ProfileButton';
import { Pencil, ImagePlus, Users, Power, LogOut } from 'lucide-react';

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
    const { t } = useTranslation();

    const navigate = useNavigate();

    //////
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    function openAvatarPicker() {
        fileInputRef.current?.click();
    }
    //////

    // ========================================================================
    // EFFECT: Load data when the page opens (after the 'return' renders on screen)
    // ========================================================================
    useEffect(() => {
        // Read token from URL if coming from 42 login
        const params = new URLSearchParams(window.location.search);
        const tokenFromURL = params.get('token');
        const userIdFromURL = params.get('userId');

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
            navigate('/login');
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
            showNotification(t('profilePage.alerts.errorLoadingProfile'), 'error');
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
                newStatus ? t('profilePage.alerts.onlineNow') : t('profilePage.alerts.offlineNow'),
                'success'
            );

        } catch (error) {
            console.error('Error:', error);
            showNotification(t('profilePage.alerts.errorChangingStatus'), 'error');
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
            showNotification(t('profilePage.alerts.profileUpdated'), 'success');

        } catch (error) {
            console.error('Error:', error);
            showNotification(t('profilePage.alerts.errorUpdatingProfile'), 'error');
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
            showNotification(t('profilePage.alerts.avatarUpdated'), 'success');

        } catch (error) {
            console.error('Error:', error);
            showNotification(t('profilePage.alerts.errorUploadingAvatar'), 'error');
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
        navigate('/login');
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
            <div
                className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat text-xl text-yellow-900"
                style={{ backgroundImage: "url('/images/bgLogin.png')" }}
            >
                <div className="hidden dark:block absolute inset-0 bg-black/70 pointer-events-none" />
                <span className="relative z-10">{t('profilePage.loadingProfile')}</span>
            </div>
        );
    }

    return (
        <div
            className="relative min-h-screen bg-cover bg-center bg-no-repeat px-4 pb-6 pt-24 md:px-6 md:pb-8 md:pt-32"
            style={{ backgroundImage: "url('/images/bg6.png')" }}
        >
            <div className="hidden dark:block absolute inset-0 bg-black/70 pointer-events-none" />
            {/* ================================================================ */}
            {/* FLOATING NOTIFICATION */}
            {/* Only rendered if notification is not null */}
            {/* ================================================================ */}
            {notification && (
                <div className={`fixed right-4 top-4 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md ${notification.tipo === 'success' ? 'border-emerald-300/60 bg-emerald-100/90 text-emerald-800' : 'border-red-300/70 bg-red-100/92 text-red-800'}`}>
                    {notification.message}
                </div>
            )}

            <div className="relative z-10 mx-auto max-w-6xl overflow-hidden rounded-3xl border border-yellow-500/45 bg-white/[0.07] shadow-[0_20px_80px_rgba(90,60,20,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-[6px]">

                {/* ============================================================ */}
                {/* PROFILE HEADER */}
                {/* ============================================================ */}
                <div className="relative z-10 px-6 py-5 text-center text-yellow-900 md:px-10">
                    <div className="relative inline-block">
                        <img
                            className="h-36 w-36 rounded-full border-4 border-cyan-200/60 object-cover shadow-[0_0_30px_rgba(56,189,248,0.25)]"
                            src={user.avatar ? `${API_URL}${user.avatar}` : '/images/NoImage.png'}
                            onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.onerror = null;
                                img.src = '/images/NoImage.png';
                            }}
                            alt={t('profilePage.avatarAlt')}
                        />
                        <div className={`absolute bottom-1 right-1 h-7 w-7 rounded-full border-2 border-white ${user.onlineStatus ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    </div>

                    <h1 className="text-3xl font-bold tracking-wide text-yellow-900">{user.name}</h1>
                    <p className="text-yellow-800/80">{user.email}</p>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <OlympusButton onClick={openModal}>
                            <Pencil
                                size={15}
                                strokeWidth={2.2}
                                className="text-yellow-700" />
                            <span>{t('profilePage.actions.editProfile')}</span>
                        </OlympusButton>

                        {/* Hidden file input for the avatar */}
                        <OlympusButton onClick={openAvatarPicker}>
                            <ImagePlus
                                size={15}
                                strokeWidth={2.2}
                                className="text-yellow-700"
                            />
                            {t('profilePage.actions.changeAvatar')}
                        </OlympusButton>

                        <input
                            id="avatar-file-input"
                            name="avatarFile"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={uploadAvatar}
                        />

                        {/* button to go to the friends page */}
                        <OlympusButton onClick={() => navigate('/friends')}>
                            <Users
                                size={15}
                                strokeWidth={2.2}
                                className="text-yellow-700"
                            />
                            <span>{t('profilePage.actions.myFriends')}</span>
                        </OlympusButton>

                        <OlympusButton onClick={changeStatus}>
                            <Power
                                size={15}
                                strokeWidth={2.2}
                                className="text-yellow-700"
                            />
                            <span>
                                {user.onlineStatus ? t('profilePage.actions.disconnect') : t('profilePage.actions.connect')}
                            </span>
                        </OlympusButton>

                        <OlympusButton onClick={logout}>
                            <LogOut
                                size={15}
                                strokeWidth={2.2}
                                className="text-yellow-700"
                            />
                            <span>{t('profilePage.actions.logOut')}</span>
                        </OlympusButton>
                    </div>
                </div>

                {/* ============================================================ */}
                {/* PROFILE CONTENT */}
                {/* ============================================================ */}
                <div className="px-6 py-2 md:px-10">

                    {/* SECTION: INFORMATION */}
                    <div className="mb-6">
                        <div className="border-1 p-4 rounded-xl border-yellow-400">
                            <h2 className="mb-2  pb-2 text-2xl text-center font-bold text-yellow-800 uppercase">{t('profilePage.overview.title')}</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="rounded-xl border border-yellow-500/35 bg-white/60 p-4 backdrop-blur-sm">
                                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-yellow-700/80">{t('profilePage.overview.status')}</div>
                                    <div className="text-base font-medium text-yellow-900">
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${user.onlineStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {user.onlineStatus ? t('profilePage.status.online') : t('profilePage.status.offline')}
                                        </span>
                                        <p className="mt-3 text-[11px] leading-snug text-yellow-950/55">
                                            {t('profilePage.overview.availableToFriends')}
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-yellow-500/35 bg-white/60 p-4 backdrop-blur-sm">
                                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-yellow-700/80">{t('profilePage.overview.lastConnection')}</div>
                                    <div className="text-base font-medium text-yellow-900">
                                        {user.lastConnection
                                            ? new Date(user.lastConnection).toLocaleString()
                                            : '-'
                                        }
                                    </div>
                                </div>
                                <div className="rounded-xl border border-yellow-500/35 bg-white/60 p-4 backdrop-blur-sm">
                                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-yellow-700/80">{t('profilePage.overview.memberSince')}</div>
                                    <div className="text-base font-medium text-yellow-900">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                        <p className="mt-2 text-[11px] text-yellow-950/55">
                                            {t('profilePage.overview.olympusCitizen')}
                                        </p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-yellow-500/35 bg-white/60 p-4 backdrop-blur-sm">
                                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-yellow-700/80">{t('profilePage.overview.totalFriends')}</div>
                                    <div className="text-base font-medium text-yellow-900">{friends.length}</div>
                                    <p className="mt-2 text-[11px] leading-snug text-yellow-950/55">
                                        {t('profilePage.overview.buildNetwork')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: FRIENDS */}
                    <div className="mb-4">
                        <div className="border-1 p-4 rounded-xl border-yellow-400">
                            <h2 className="mb-2 pb-2 text-2xl font-bold text-center text-yellow-900">{t('profilePage.friends.title')}</h2>
                            {friends.length === 0 ? (
                                <p className="text-center text-yellow-800/75">
                                    {t('profilePage.friends.empty')}
                                </p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {/* In React, to show lists we use .map() instead of innerHTML */}
                                    {friends.map(friend => (
                                        <div key={friend.id} className="rounded-xl border border-cyan-300/30 bg-white/60 p-4 text-center backdrop-blur-sm transition hover:shadow-md">
                                            <img
                                                src={friend.avatar ? `${API_URL}${friend.avatar}` : '/images/NoImage.png'}
                                                onError={(e) => {
                                                    const img = e.target as HTMLImageElement;
                                                    img.onerror = null;
                                                    img.src = '/images/NoImage.png';
                                                }}
                                                alt={friend.name}
                                                className="mx-auto mb-3 block h-20 w-20 rounded-full border-2 border-cyan-400/70 object-cover"
                                            />
                                            <div className="font-semibold text-yellow-900">{friend.name}</div>
                                            <div className={`text-xs ${friend.onlineStatus ? 'font-semibold text-emerald-600' : 'text-slate-500'}`}>
                                                {friend.onlineStatus ? t('profilePage.status.online') : t('profilePage.status.offline')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ================================================================ */}
            {/* EDIT MODAL */}
            {/* Only rendered if modalOpen === true */}
            {/* ================================================================ */}
            {modalOpen && (
                // Clicking the dark backdrop closes the modal
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-yellow-500/45 bg-white/90 p-6 shadow-[0_20px_60px_rgba(90,60,20,0.28)] md:p-8">
                        <h2 className="mb-6 text-2xl font-bold text-yellow-900">✏️ {t('profilePage.edit.title')}</h2>

                        <div className="mb-4">
                            <label htmlFor="profile-edit-name" className="mb-2 block text-sm font-semibold text-yellow-900/85">{t('profilePage.edit.name')}</label>
                            <input
                                id="profile-edit-name"
                                name="editName"
                                type="text"
                                className="w-full rounded-xl border border-yellow-500/35 bg-white/85 px-4 py-3 text-yellow-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="profile-edit-email" className="mb-2 block text-sm font-semibold text-yellow-900/85">{t('profilePage.edit.email')}</label>
                            <input
                                id="profile-edit-email"
                                name="editEmail"
                                type="email"
                                className="w-full rounded-xl border border-yellow-500/35 bg-white/85 px-4 py-3 text-yellow-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                                value={editEmail}
                                onChange={e => setEditEmail(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="profile-edit-password" className="mb-2 block text-sm font-semibold text-yellow-900/85">{t('profilePage.edit.newPasswordOptional')}</label>
                            <input
                                id="profile-edit-password"
                                name="editPassword"
                                type="password"
                                className="w-full rounded-xl border border-yellow-500/35 bg-white/85 px-4 py-3 text-yellow-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                                placeholder={t('profilePage.edit.leaveBlank')}
                                value={editPassword}
                                onChange={e => setEditPassword(e.target.value)}
                            />
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                className="flex-1 rounded-xl bg-rose-500 px-4 py-3 font-semibold text-white transition hover:bg-rose-600"
                                onClick={() => setModalOpen(false)}
                            >
                                {t('profilePage.edit.cancel')}
                            </button>
                            <button
                                className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600"
                                onClick={saveChanges}
                            >
                                {t('profilePage.edit.saveChanges')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
