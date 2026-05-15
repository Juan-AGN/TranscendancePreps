// ============================================================================
// FRIENDS.TSX - Friends Management Page
// ============================================================================
// This component replaces the original friends.html.
// The logic is exactly the same, only the way state is managed
// and the interface is rendered changes (useState + JSX instead of innerHTML).

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

// ============================================================================
// TYPES
// ============================================================================
interface FriendData {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    onlineStatus: boolean;
}

interface RequestData {
    id: number;
    requester: FriendData;
}

// ============================================================================
// MAIN COMPONENT: Friends
// ============================================================================
function Friends() {

    // ========================================================================
    // COMPONENT STATE
    // ========================================================================
    const [activeTab, setActiveTab] = useState<'my-friends' | 'requests' | 'search'>('my-friends');

    const [friendsList, setFriendsList] = useState<FriendData[]>([]);
    const [requestsList, setRequestsList] = useState<RequestData[]>([]);
    const [searchResults, setSearchResults] = useState<FriendData[]>([]);

    const [searchInput, setSearchInput] = useState('');

    const navigate = useNavigate();

    // Get userId from localStorage (saved on login)
    const userId = localStorage.getItem('userId') || '';
    const token = localStorage.getItem('token') || '';

    // ========================================================================
    // EFFECT: Check session and load data on mount
    // ========================================================================
    useEffect(() => {
        // If there is no session, redirect to login
        if (!userId || !token) {
            navigate('/');
            return;
        }

        // Load friends and requests when the page opens
        loadFriends();
        loadRequests();
    }, []);

    // ========================================================================
    // FUNCTION: SWITCH BETWEEN TABS
    // ========================================================================
    function changeTab(tab: 'my-friends' | 'requests' | 'search') {
        setActiveTab(tab);
        if (tab === 'my-friends') loadFriends();
        if (tab === 'requests') loadRequests();
    }

    // ========================================================================
    // FUNCTION: LOAD FRIENDS LIST
    // ========================================================================
    async function loadFriends() {
        try {
            // STEP 1: Request to the backend
            const response = await fetch(`${API_URL}/users/${userId}/my_friends`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            // STEP 2: Save in state
            setFriendsList(data.friends || []);

        } catch (error) {
            console.error('Error loading friends:', error);
        }
    }

    // ========================================================================
    // FUNCTION: LOAD PENDING REQUESTS
    // ========================================================================
    async function loadRequests() {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/pending_requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setRequestsList(data.requests || []);

        } catch (error) {
            console.error('Error loading requests:', error);
        }
    }

    // ========================================================================
    // FUNCTION: SEARCH USERS
    // ========================================================================
    async function searchUsers() {
        // STEP 1: Validate that there are at least 2 characters
        if (searchInput.length < 2) {
            alert('Type at least 2 characters to search');
            return;
        }

        try {
            // STEP 2: Request to the backend
            const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(searchInput)}`);
            const data = await response.json();

            // STEP 3: Filter to exclude the current user
            const results = (data.users || []).filter(
                (u: FriendData) => u.id !== parseInt(userId)
            );
            setSearchResults(results);

        } catch (error) {
            console.error('Error searching:', error);
        }
    }

    // ========================================================================
    // FUNCTION: SEND FRIEND REQUEST
    // ========================================================================
    async function sendRequest(friendId: number) {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/send_request/${friendId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                alert('Request sent successfully');
            } else {
                alert(data.error);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error sending request');
        }
    }

    // ========================================================================
    // FUNCTION: ACCEPT REQUEST
    // ========================================================================
    async function acceptRequest(friendId: number) {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/accept_request/${friendId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                alert('Request accepted! You are now friends');
                // Reload both lists
                loadRequests();
                loadFriends();
            } else {
                alert(data.error);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error accepting request');
        }
    }

    // ========================================================================
    // FUNCTION: REJECT REQUEST
    // ========================================================================
    async function rejectRequest(friendId: number) {
        if (!confirm('Are you sure you want to reject this request?')) return;

        try {
            const response = await fetch(`${API_URL}/users/${userId}/reject_request/${friendId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Request rejected');
                loadRequests();
            } else {
                const data = await response.json();
                alert(data.error);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error rejecting request');
        }
    }

    // ========================================================================
    // FUNCTION: REMOVE FRIEND
    // ========================================================================
    async function removeFriend(friendId: number) {
        if (!confirm('Are you sure you want to remove this friend?')) return;

        try {
            const response = await fetch(`${API_URL}/users/${userId}/remove_friend/${friendId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Friend removed successfully');
                loadFriends();
            } else {
                const data = await response.json();
                alert(data.error);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Error removing friend');
        }
    }

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-violet-700 p-4 md:p-6">
            <div className="mx-auto max-w-6xl rounded-3xl bg-white p-6 shadow-2xl md:p-10">

            {/* BACK BUTTON */}
            <button className="mb-5 rounded-xl bg-slate-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-x-0.5 hover:bg-slate-600" onClick={() => navigate('/profile')}>
                ← Back to Profile
            </button>

            <h1 className="mb-7 text-center text-3xl font-bold text-indigo-600">Friends Management</h1>

            {/* ============================================================ */}
            {/* TABS */}
            {/* ============================================================ */}
            <div className="mb-7 flex flex-wrap gap-3 border-b-2 border-slate-100 pb-3">
                <button
                    className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${activeTab === 'my-friends' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-500'}`}
                    onClick={() => changeTab('my-friends')}
                >
                    My Friends ({friendsList.length})
                </button>
                <button
                    className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${activeTab === 'requests' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-500'}`}
                    onClick={() => changeTab('requests')}
                >
                    Pending Requests ({requestsList.length})
                </button>
                <button
                    className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${activeTab === 'search' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-500'}`}
                    onClick={() => changeTab('search')}
                >
                    Search Users
                </button>
            </div>

            {/* ============================================================ */}
            {/* TAB 1: MY FRIENDS */}
            {/* ============================================================ */}
            {activeTab === 'my-friends' && (
                <div>
                    {friendsList.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            <div className="text-lg">You have no friends yet</div>
                            <div className="text-sm text-slate-400">Search for users to add!</div>
                        </div>
                    ) : (
                        // .map() in React is like a forEach to display lists
                        friendsList.map(friend => (
                            <div key={friend.id} className="mb-3 flex flex-col items-center gap-4 rounded-2xl border border-transparent bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-md md:flex-row">
                                <img
                                    src={friend.avatar ? `${API_URL}${friend.avatar}` : `${API_URL}/avatars/default-avatar.svg`}
                                    alt="Avatar"
                                    className="h-16 w-16 rounded-full border-2 border-indigo-400 object-cover"
                                />
                                <div className="flex-1 text-center md:text-left">
                                    <div className="font-semibold text-slate-800">
                                        {friend.name}
                                        <span className={`ml-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${friend.onlineStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {friend.onlineStatus ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-500">{friend.email}</div>
                                </div>
                                <button className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600" onClick={() => removeFriend(friend.id)}>
                                    Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: PENDING REQUESTS */}
            {/* ============================================================ */}
            {activeTab === 'requests' && (
                <div>
                    {requestsList.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            <div className="text-lg">You have no pending requests</div>
                            <div className="text-sm text-slate-400">You will be notified when you receive one</div>
                        </div>
                    ) : (
                        requestsList.map(req => (
                            <div key={req.id} className="mb-3 flex flex-col items-center gap-4 rounded-2xl border border-transparent bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-md md:flex-row">
                                <img
                                    src={req.requester.avatar ? `${API_URL}${req.requester.avatar}` : `${API_URL}/avatars/default-avatar.svg`}
                                    alt="Avatar"
                                    className="h-16 w-16 rounded-full border-2 border-indigo-400 object-cover"
                                />
                                <div className="flex-1 text-center md:text-left">
                                    <div className="font-semibold text-slate-800">{req.requester.name}</div>
                                    <div className="text-sm text-slate-500">{req.requester.email}</div>
                                </div>
                                <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600" onClick={() => acceptRequest(req.requester.id)}>
                                    Accept
                                </button>
                                <button className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600" onClick={() => rejectRequest(req.requester.id)}>
                                    Reject
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: SEARCH USERS */}
            {/* ============================================================ */}
            {activeTab === 'search' && (
                <div>
                    <div className="mb-6 flex flex-col gap-3 md:flex-row">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && searchUsers()}
                            className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                        <button className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600" onClick={searchUsers}>Search</button>
                    </div>

                    {searchResults.length === 0 && searchInput.length >= 2 && (
                        <div className="py-12 text-center text-slate-500">
                            <div className="text-lg">No users found</div>
                            <div className="text-sm text-slate-400">Try a different search term</div>
                        </div>
                    )}

                    {searchResults.map(result => (
                        <div key={result.id} className="mb-3 flex flex-col items-center gap-4 rounded-2xl border border-transparent bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-md md:flex-row">
                            <img
                                src={result.avatar ? `${API_URL}${result.avatar}` : `${API_URL}/avatars/default-avatar.svg`}
                                alt="Avatar"
                                className="h-16 w-16 rounded-full border-2 border-indigo-400 object-cover"
                            />
                            <div className="flex-1 text-center md:text-left">
                                <div className="font-semibold text-slate-800">
                                    {result.name}
                                    <span className={`ml-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${result.onlineStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {result.onlineStatus ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-500">{result.email}</div>
                            </div>
                            <button className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600" onClick={() => sendRequest(result.id)}>
                                Add friend
                            </button>
                        </div>
                    ))}
                </div>
            )}

            </div>
        </div>
    );
}

export default Friends;
