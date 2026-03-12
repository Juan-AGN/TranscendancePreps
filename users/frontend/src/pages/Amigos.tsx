// ============================================================================
// AMIGOS.TSX - Friends Management Page
// ============================================================================
// This component replaces the original amigos.html.
// The logic is exactly the same, only the way state is managed
// and the interface is rendered changes (useState + JSX instead of innerHTML).

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Amigos.css';
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
// MAIN COMPONENT: Amigos
// ============================================================================
function Amigos() {

    // ========================================================================
    // COMPONENT STATE
    // ========================================================================
    const [activeTab, setActiveTab] = useState<'mis-amigos' | 'solicitudes' | 'buscar'>('mis-amigos');

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
    function changeTab(tab: 'mis-amigos' | 'solicitudes' | 'buscar') {
        setActiveTab(tab);
        if (tab === 'mis-amigos') loadFriends();
        if (tab === 'solicitudes') loadRequests();
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
                alert('✅ Request sent successfully');
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
                alert('✅ Request accepted! You are now friends');
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
                alert('✅ Request rejected');
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
                alert('✅ Friend removed successfully');
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
        <div className="amigos-container">

            {/* BACK BUTTON */}
            <button className="volver" onClick={() => navigate('/perfil')}>
                ← Back to Profile
            </button>

            <h1>👥 Friends Management</h1>

            {/* ============================================================ */}
            {/* TABS */}
            {/* ============================================================ */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'mis-amigos' ? 'active' : ''}`}
                    onClick={() => changeTab('mis-amigos')}
                >
                    My Friends ({friendsList.length})
                </button>
                <button
                    className={`tab ${activeTab === 'solicitudes' ? 'active' : ''}`}
                    onClick={() => changeTab('solicitudes')}
                >
                    Pending Requests ({requestsList.length})
                </button>
                <button
                    className={`tab ${activeTab === 'buscar' ? 'active' : ''}`}
                    onClick={() => changeTab('buscar')}
                >
                    🔍 Search Users
                </button>
            </div>

            {/* ============================================================ */}
            {/* TAB 1: MY FRIENDS */}
            {/* ============================================================ */}
            {activeTab === 'mis-amigos' && (
                <div>
                    {friendsList.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">😔</div>
                            <div className="empty-state-text">You have no friends yet</div>
                            <div className="empty-state-subtext">Search for users to add!</div>
                        </div>
                    ) : (
                        // .map() in React is like a forEach to display lists
                        friendsList.map(friend => (
                            <div key={friend.id} className="usuario-card">
                                <img
                                    src={friend.avatar ? `${API_URL}${friend.avatar}` : `${API_URL}/avatares/default-avatar.svg`}
                                    alt="Avatar"
                                />
                                <div className="usuario-info">
                                    <div className="usuario-nombre">
                                        {friend.name}
                                        <span className={`estado ${friend.onlineStatus ? 'online' : 'offline'}`}>
                                            {friend.onlineStatus ? '🟢 Online' : '⚫ Offline'}
                                        </span>
                                    </div>
                                    <div className="usuario-email">{friend.email}</div>
                                </div>
                                <button className="btn btn-danger" onClick={() => removeFriend(friend.id)}>
                                    🗑️ Remove
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB 2: PENDING REQUESTS */}
            {/* ============================================================ */}
            {activeTab === 'solicitudes' && (
                <div>
                    {requestsList.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <div className="empty-state-text">You have no pending requests</div>
                            <div className="empty-state-subtext">You will be notified when you receive one</div>
                        </div>
                    ) : (
                        requestsList.map(req => (
                            <div key={req.id} className="usuario-card">
                                <img
                                    src={req.requester.avatar ? `${API_URL}${req.requester.avatar}` : `${API_URL}/avatares/default-avatar.svg`}
                                    alt="Avatar"
                                />
                                <div className="usuario-info">
                                    <div className="usuario-nombre">{req.requester.name}</div>
                                    <div className="usuario-email">{req.requester.email}</div>
                                </div>
                                <button className="btn btn-success" onClick={() => acceptRequest(req.requester.id)}>
                                    ✅ Accept
                                </button>
                                <button className="btn btn-danger" onClick={() => rejectRequest(req.requester.id)}>
                                    ❌ Reject
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB 3: SEARCH USERS */}
            {/* ============================================================ */}
            {activeTab === 'buscar' && (
                <div>
                    <div className="buscar-usuarios">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && searchUsers()}
                        />
                        <button onClick={searchUsers}>🔍 Search</button>
                    </div>

                    {searchResults.length === 0 && searchInput.length >= 2 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <div className="empty-state-text">No users found</div>
                            <div className="empty-state-subtext">Try a different search term</div>
                        </div>
                    )}

                    {searchResults.map(result => (
                        <div key={result.id} className="usuario-card">
                            <img
                                src={result.avatar ? `${API_URL}${result.avatar}` : `${API_URL}/avatares/default-avatar.svg`}
                                alt="Avatar"
                            />
                            <div className="usuario-info">
                                <div className="usuario-nombre">
                                    {result.name}
                                    <span className={`estado ${result.onlineStatus ? 'online' : 'offline'}`}>
                                        {result.onlineStatus ? '🟢 Online' : '⚫ Offline'}
                                    </span>
                                </div>
                                <div className="usuario-email">{result.email}</div>
                            </div>
                            <button className="btn btn-primary" onClick={() => sendRequest(result.id)}>
                                ➕ Add friend
                            </button>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

export default Amigos;
