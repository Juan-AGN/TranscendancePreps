// ============================================================================
// FRIENDS.TSX - Friends Management Page
// ============================================================================
// This component replaces the original friends.html.
// The logic is exactly the same, only the way state is managed
// and the interface is rendered changes (useState + JSX instead of innerHTML).

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_URL } from './config';
import { OlympusButton } from '../../components/Buttons/ProfileButton';
import { Search, UserRoundPlus, Users } from 'lucide-react';
import { validateSession, clearSession } from './session';

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
	const { t } = useTranslation();

	const navigate = useNavigate();

	// Get userId from localStorage (saved on login)
	const userId = localStorage.getItem('userId') || '';
	const token = localStorage.getItem('token') || '';

	// ========================================================================
	// EFFECT: Check session and load data on mount
	// ========================================================================
	useEffect(() => {
		async function checkSessionAndLoadFriends() {
			if (!userId || !token) {
				clearSession();
				navigate('/login');
				return;
			}

			const isValid = await validateSession();

			if (!isValid) {
				navigate('/login');
				return;
			}

			loadFriends();
			loadRequests();
		}

		checkSessionAndLoadFriends();
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
			alert('Error loading friends');
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
			alert('Error loading requests');
		}
	}

	// ========================================================================
	// FUNCTION: SEARCH USERS
	// ========================================================================
	async function searchUsers() {
		// STEP 1: Validate that there are at least 2 characters
		if (searchInput.length < 2) {
			alert(t('friendsPage.alerts.typeMin2'));
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
			alert('Error searching users');
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
				alert(t('friendsPage.alerts.requestSent'));
			} else {
				alert(data.error);
			}

		} catch (error) {
			alert(t('friendsPage.alerts.errorSendingRequest'));
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
				alert(t('friendsPage.alerts.requestAccepted'));
				// Reload both lists
				loadRequests();
				loadFriends();
			} else {
				alert(data.error);
			}

		} catch (error) {
			alert(t('friendsPage.alerts.errorAcceptingRequest'));
		}
	}

	// ========================================================================
	// FUNCTION: REJECT REQUEST
	// ========================================================================
	async function rejectRequest(friendId: number) {
		if (!confirm(t('friendsPage.confirms.rejectRequest'))) return;

		try {
			const response = await fetch(`${API_URL}/users/${userId}/reject_request/${friendId}`, {
				method: 'DELETE',
				headers: { 'Authorization': `Bearer ${token}` }
			});

			if (response.ok) {
				alert(t('friendsPage.alerts.requestRejected'));
				loadRequests();
			} else {
				const data = await response.json();
				alert(data.error);
			}

		} catch (error) {
			alert(t('friendsPage.alerts.errorRejectingRequest'));
		}
	}

	// ========================================================================
	// FUNCTION: REMOVE FRIEND
	// ========================================================================
	async function removeFriend(friendId: number) {
		if (!confirm(t('friendsPage.confirms.removeFriend'))) return;

		try {
			const response = await fetch(`${API_URL}/users/${userId}/remove_friend/${friendId}`, {
				method: 'DELETE',
				headers: { 'Authorization': `Bearer ${token}` }
			});

			if (response.ok) {
				alert(t('friendsPage.alerts.friendRemoved'));
				loadFriends();
			} else {
				const data = await response.json();
				alert(data.error);
			}

		} catch (error) {
			alert(t('friendsPage.alerts.errorRemovingFriend'));
		}
	}

	// ========================================================================
	// RENDER
	// ========================================================================
	return (
		<div className="relative min-h-screen bg-cover bg-center bg-no-repeat px-4 pb-6 pt-32"
			style={{ backgroundImage: "url('/images/bgFriends.png')" }}>
			<div className="hidden dark:block absolute inset-0 bg-black/70 pointer-events-none" />

			<div className="relative z-10 mx-auto max-w-6xl min-h-[65vh] overflow-hidden rounded-3xl border border-yellow-500/45 bg-white/[0.07] backdrop-blur-[55px]
                            shadow-[0_20px_80px_rgba(90,60,20,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] ">


				<h1 className="mt-8 mb-7 text-center text-2xl font-bold text-yellow-700/80 uppercase">👥 {t('friendsPage.title')}</h1>

				{/* ============================================================ */}
				{/* TABS */}
				{/* ============================================================ */}
				<div className="mt-15 mb-10 w-full flex flex-wrap items-center justify-center gap-3  pb-3">
					<OlympusButton onClick={() => changeTab("my-friends")}>
						<Users
							size={15}
							strokeWidth={2.2}
							className="text-yellow-700" />
						<span>{t('friendsPage.tabs.friends')}</span>
					</OlympusButton>
					<OlympusButton onClick={() => changeTab('requests')}>
						<UserRoundPlus
							size={15}
							strokeWidth={2.2}
							className="text-yellow-700" />
						<span>{t('friendsPage.tabs.pendingRequests')}</span>
						<span>({requestsList.length})</span>

					</OlympusButton>
					<OlympusButton onClick={() => changeTab('search')}>
						<Search
							size={15}
							strokeWidth={2.2}
							className="text-yellow-700" />
						<span>{t('friendsPage.tabs.searchUsers')}</span>

					</OlympusButton>
				</div>

				{/* ============================================================ */}
				{/* TAB 1: MY FRIENDS */}
				{/* ============================================================ */}
				{activeTab === 'my-friends' && (
					<div>
						{friendsList.length === 0 ? (
							<div className="py-12 text-center text-slate-500">
								<div className="mb-2 text-6xl">😔</div>
								<div className="text-lg">{t('friendsPage.empty.noFriends')}</div>
								<div className="text-sm text-slate-400">{t('friendsPage.empty.searchUsersToAdd')}</div>
							</div>
						) : (
							// .map() in React is like a forEach to display lists
							friendsList.map(friend => (
								<div key={friend.id} className="mb-3 flex flex-col items-center gap-4 rounded-2xl border border-transparent bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-md md:flex-row">
									<img
										src={friend.avatar ? `${API_URL}${friend.avatar}` : `${API_URL}/avatars/default-avatar.svg`}
										alt={t('friendsPage.avatarAlt')}
										className="h-16 w-16 rounded-full border-2 border-indigo-400 object-cover"
									/>
									<div className="flex-1 text-center md:text-left">
										<div className="font-semibold text-slate-800">
											{friend.name}
											<span className={`ml-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${friend.onlineStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
												{friend.onlineStatus ? t('friendsPage.status.online') : t('friendsPage.status.offline')}
											</span>
										</div>
										<div className="text-sm text-slate-500">{friend.email}</div>
									</div>
									<button className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600" onClick={() => removeFriend(friend.id)}>
										{t('friendsPage.actions.remove')}
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
								<div className="mb-2 text-6xl">📭</div>
								<div className="text-lg">{t('friendsPage.empty.noPendingRequests')}</div>
								<div className="text-sm text-slate-400">{t('friendsPage.empty.pendingNotified')}</div>
							</div>
						) : (
							requestsList.map(req => (
								<div key={req.id} className="mb-3 flex flex-col items-center gap-4 rounded-2xl border border-transparent bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-md md:flex-row">
									<img
										src={req.requester.avatar ? `${API_URL}${req.requester.avatar}` : `${API_URL}/avatars/default-avatar.svg`}
										alt={t('friendsPage.avatarAlt')}
										className="h-16 w-16 rounded-full border-2 border-indigo-400 object-cover"
									/>
									<div className="flex-1 text-center md:text-left">
										<div className="font-semibold text-slate-800">{req.requester.name}</div>
										<div className="text-sm text-slate-500">{req.requester.email}</div>
									</div>
									<button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600" onClick={() => acceptRequest(req.requester.id)}>
										{t('friendsPage.actions.accept')}
									</button>
									<button className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600" onClick={() => rejectRequest(req.requester.id)}>
										{t('friendsPage.actions.reject')}
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
								placeholder={t('friendsPage.search.placeholder')}
								maxLength={50}
								value={searchInput}
								onChange={e => setSearchInput(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && searchUsers()}
								className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
							/>
							<button className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600" onClick={searchUsers}>{t('friendsPage.search.button')}</button>
						</div>

						{searchResults.length === 0 && searchInput.length >= 2 && (
							<div className="py-12 text-center text-slate-500">
								<div className="mb-2 text-6xl">🔍</div>
								<div className="text-lg">{t('friendsPage.empty.noUsersFound')}</div>
								<div className="text-sm text-slate-400">{t('friendsPage.empty.tryDifferentTerm')}</div>
							</div>
						)}

						{searchResults.map(result => (
							<div key={result.id} className="mb-3 flex flex-col items-center gap-4 rounded-2xl border border-transparent bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white hover:shadow-md md:flex-row">
								<img
									src={result.avatar ? `${API_URL}${result.avatar}` : `${API_URL}/avatars/default-avatar.svg`}
									alt={t('friendsPage.avatarAlt')}
									className="h-16 w-16 rounded-full border-2 border-indigo-400 object-cover"
								/>
								<div className="flex-1 text-center md:text-left">
									<div className="font-semibold text-slate-800">
										{result.name}
										<span className={`ml-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${result.onlineStatus ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
											{result.onlineStatus ? t('friendsPage.status.online') : t('friendsPage.status.offline')}
										</span>
									</div>
									<div className="text-sm text-slate-500">{result.email}</div>
								</div>
								<button className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600" onClick={() => sendRequest(result.id)}>
									{t('friendsPage.actions.addFriend')}
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
