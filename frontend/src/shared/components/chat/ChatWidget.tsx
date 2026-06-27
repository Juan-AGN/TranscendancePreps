import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Search, SquarePen, X } from 'lucide-react';
import { OlympusButton } from '../Buttons/ProfileButton';
import {
	CHAT_MESSAGE_MAX_LENGTH,
	ChatApiError,
	ChatErrorCode,
	getChatErrorTranslationKey,
} from './chatErrors';

type ConversationItem = {
	id: number;
	members: string[];
	otherUserIds: string[];
	otherUserDeleted: boolean;
	unreadCount: number;
	lastMessage: null | { id: number; senderId: string; content: string; createdAt: string };
	updatedAt: string;
	createdAt: string;
};

type MessageItem = {
	id: number;
	conversationId: number;
	senderId: string;
	content: string;
	createdAt: string;
};

type OnlineUser = {
	id: number;
	name: string;
	email: string;
	avatar?: string | null;
	onlineStatus: boolean;
};

type FriendUser = { id: number; name: string; email: string };

type PendingRequest = {
	id: number;
	requesterId: number;
	requester: { id: number; name: string; email: string };
};

type ResolvedUser = { id: string; name: string; avatar?: string | null };

function getToken(): string | null {
	const t = localStorage.getItem("token");
	return t && t.trim() ? t : null;
}
function getMyUserId(): number | null {
	const u = localStorage.getItem("userId");
	const n = u ? Number(u) : NaN;
	return Number.isFinite(n) ? n : null;
}

const CHAT_API = "/api/chat";
const AUTH_API = "/api/auth";
const CHAT_SYSTEM_SENDER_ID = "__chat_system__";
const CHAT_MEMBER_LEFT_EVENT_PREFIX = "member-left:";

function getMemberLeftUserId(
	message: Pick<MessageItem, "senderId" | "content">,
): string | null {
	if (message.senderId !== CHAT_SYSTEM_SENDER_ID)
		return null;

	if (!message.content.startsWith(CHAT_MEMBER_LEFT_EVENT_PREFIX))
		return null;

	const userId = message.content.slice(CHAT_MEMBER_LEFT_EVENT_PREFIX.length).trim();
	return userId.length > 0 ? userId : null;
}

async function chatApi<T>(path: string, init?: RequestInit): Promise<T> {
	const token = getToken();
	if (!token) {
		throw new ChatApiError(
			ChatErrorCode.AUTH_TOKEN_MISSING,
			401,
			"AUTH_TOKEN_MISSING",
		);
	}

	const headers = new Headers(init?.headers || {});
	headers.set("Content-Type", "application/json");
	headers.set("Authorization", `Bearer ${token}`);

	const res = await fetch(`${CHAT_API}${path}`, { ...init, headers });

	if (!res.ok) {
		let payload: {
			code?: unknown;
			error?: unknown;
			details?: unknown;
		} = {};

		try {
			payload = await res.json() as typeof payload;
		} catch {
			// Older endpoints may return plain text.
		}

		const code = typeof payload.code === "number"
			? payload.code
			: ChatErrorCode.INTERNAL_ERROR;
		const backendName = typeof payload.error === "string"
			? payload.error
			: "INTERNAL_ERROR";
		const details = payload.details && typeof payload.details === "object"
			? payload.details as Record<string, unknown>
			: undefined;

		throw new ChatApiError(code, res.status, backendName, details);
	}

	return (await res.json()) as T;
}

async function usersApi<T>(path: string, init?: RequestInit): Promise<T> {
	const token = getToken();
	if (!token)
		throw new Error("Missing token. Please login first.");

	const headers = new Headers(init?.headers || {});
	headers.set("Authorization", `Bearer ${token}`);

	const res = await fetch(`${AUTH_API}${path}`, { ...init, headers });
	if (!res.ok)
		throw new Error((await res.text().catch(() => "")) || `Users failed (${res.status})`);
	return (await res.json()) as T;
}

export function ChatWidget() {
	const { t } = useTranslation();

	function getDisplayError(error: unknown): string {
		if (error instanceof ChatApiError) {
			const maxLength = typeof error.details?.maxLength === "number"
				? error.details.maxLength
				: CHAT_MESSAGE_MAX_LENGTH;
			const maxIds = typeof error.details?.maxIds === "number"
				? error.details.maxIds
				: 50;

			return t(getChatErrorTranslationKey(error.code), {
				max: maxLength,
				maxIds,
			});
		}

		if (error instanceof Error && error.message) {
			return error.message;
		}

		return t('chat.errors.unknown');
	}
	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState<"chats" | "friends" | "online" | "offline">("chats");
	const [messageBadgeCount, setMessageBadgeCount] = useState(0);
	const [pendingBadgeCount, setPendingBadgeCount] = useState(0);
	const [sessionToken, setSessionToken] = useState<string | null>(() => getToken());
	const [myUserId, setMyUserId] = useState<number | null>(() => getMyUserId());
	const [search, setSearch] = useState("");

	// Chat state
	const [conversations, setConversations] = useState<ConversationItem[]>([]);
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const [messages, setMessages] = useState<MessageItem[]>([]);
	const [input, setInput] = useState("");

	// Resolve names for DM/group members
	const [userMap, setUserMap] = useState<Record<string, ResolvedUser>>({});

	// Users/Friends state
	const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
	const [allUsers, setAllUsers] = useState<OnlineUser[]>([]);
	const [friends, setFriends] = useState<FriendUser[]>([]);
	const [pending, setPending] = useState<PendingRequest[]>([]);
	const [sentRequests, setSentRequests] = useState<Record<number, true>>({});

	// UI
	const [error, setError] = useState<string | null>(null);
	const [loadingConvs, setLoadingConvs] = useState(false);
	const [loadingMsgs, setLoadingMsgs] = useState(false);
	const [loadingOnline, setLoadingOnline] = useState(false);
	const [loadingAll, setLoadingAll] = useState(false);
	const [loadingFriends, setLoadingFriends] = useState(false);
	const [loadingPending, setLoadingPending] = useState(false);

	const openRef = useRef(open);
	const selectedIdRef = useRef(selectedId);

	useEffect(() => {
		openRef.current = open;
	}, [open]);

	useEffect(() => {
		selectedIdRef.current = selectedId;
	}, [selectedId]);

	useEffect(() => {
		const updateSession = () => {
			setSessionToken(getToken());
			setMyUserId(getMyUserId());
		};

		window.addEventListener("auth:changed", updateSession);
		window.addEventListener("storage", updateSession);

		return () => {
			window.removeEventListener("auth:changed", updateSession);
			window.removeEventListener("storage", updateSession);
		};
	}, []);

	useEffect(() => {
		const openFromHub = () => setOpen(true);
		window.addEventListener("chat:open", openFromHub as EventListener);

		return () => {
			window.removeEventListener("chat:open", openFromHub as EventListener);
		};
	}, []);


	const onlineSet = useMemo(() => new Set(onlineUsers.map((u) => u.id)), [onlineUsers]);
	const friendSet = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);

	const selected = useMemo(
		() => conversations.find((c) => c.id === selectedId) || null,
		[conversations, selectedId]
	);

	const selectedTitle = useMemo(() => {
		if (!selected)
			return t('chat.selectConversation');
		const otherId = selected.otherUserIds[0];
		if (!otherId)
			return t('chat.userUnavailable');
		return userMap[otherId]?.name || t('chat.userUnavailable');
	}, [selected, userMap, t]);

	const visibleMessages = useMemo(() => {
		return messages.filter((message) => {
			const leftUserId = getMemberLeftUserId(message);

			// The leave notice is shown only to the participant who remained.
			return !(leftUserId && myUserId && leftUserId === String(myUserId));
		});
	}, [messages, myUserId]);

	const filteredConversations = useMemo(() => {
		const value = search.trim().toLowerCase();
		if (!value)
			return conversations;

		return conversations.filter((conversation) => {
			const otherId = conversation.otherUserIds[0];
			const title = otherId
				? (userMap[otherId]?.name || t('chat.userUnavailable'))
				: t('chat.userUnavailable');

			const leftUserId = conversation.lastMessage
				? getMemberLeftUserId(conversation.lastMessage)
				: null;
			const preview = leftUserId
				? t('chat.userLeftConversation', {
					name: userMap[leftUserId]?.name || t('chat.userUnavailable'),
				})
				: (conversation.lastMessage?.content || '');

			return title.toLowerCase().includes(value) || preview.toLowerCase().includes(value);
		});
	}, [conversations, search, t, userMap]);

	const totalBadgeCount = messageBadgeCount + pendingBadgeCount;

	const onlineFriends = useMemo(() => friends.filter((f) => onlineSet.has(f.id)), [friends, onlineSet]);
	const offlineFriends = useMemo(() => friends.filter((f) => !onlineSet.has(f.id)), [friends, onlineSet]);

	const offlineUsers = useMemo(() => {
		return allUsers.filter((u) => {
			if (myUserId && u.id === myUserId) return false;
			return !onlineSet.has(u.id);
		});
	}, [allUsers, onlineSet, myUserId]);

	async function resolveUsers(ids: string[]) {
		const unique = Array.from(new Set(ids.map((x) => String(x).trim()).filter(Boolean))).slice(0, 50);
		if (unique.length === 0)
			return;

		const qs = unique.join(",");
		const data = await chatApi<{ users: ResolvedUser[] }>(`/users/resolve?ids=${encodeURIComponent(qs)}`);

		const map: Record<string, ResolvedUser> = {};
		for (const u of data.users) map[u.id] = u;
		setUserMap((prev) => ({ ...prev, ...map }));
	}

	async function loadConversations() {
		setLoadingConvs(true);
		setError(null);
		try {
			const data = await chatApi<{ conversations: ConversationItem[] }>("/conversations");
			setConversations(data.conversations);
			setMessageBadgeCount(
				data.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0)
			);

			const idsToResolve: string[] = [];
			for (const conversation of data.conversations) {
				for (const id of conversation.members)
					idsToResolve.push(String(id));
			}
			await resolveUsers(idsToResolve);

			setSelectedId((current) => {
				if (current && data.conversations.some((conversation) => conversation.id === current))
					return current;
				return data.conversations[0]?.id ?? null;
			});
		} catch (e: unknown) {
			setError(getDisplayError(e));
		} finally {
			setLoadingConvs(false);
		}
	}

	async function markConversationRead(conversationId: number, messageId: number) {
		try {
			await chatApi(`/conversations/${conversationId}/read`, {
				method: "PATCH",
				body: JSON.stringify({ messageId }),
			});
			setConversations((current) =>
				current.map((conversation) =>
					conversation.id === conversationId
						? { ...conversation, unreadCount: 0 }
						: conversation
				)
			);
			await loadConversations();
		} catch {
			// The next sync will restore the correct unread count.
		}
	}

	async function loadMessages(conversationId: number) {
		setLoadingMsgs(true);
		setError(null);
		try {
			const data = await chatApi<{ messages: MessageItem[]; nextCursor: number | null }>(
				`/conversations/${conversationId}/messages?limit=50`
			);

			setMessages([...data.messages].reverse());

			const newestId = data.messages?.[0]?.id;
			if (newestId && openRef.current)
				await markConversationRead(conversationId, newestId);
		} catch (e: unknown) {
			setError(getDisplayError(e));
		} finally {
			setLoadingMsgs(false);
		}
	}

	async function sendMessage() {
		if (!selectedId) return;
		const content = input.trim();
		if (!content) return;

		if (content.length > CHAT_MESSAGE_MAX_LENGTH) {
			setError(t('chat.errors.messageTooLong', { max: CHAT_MESSAGE_MAX_LENGTH }));
			return;
		}

		setError(null);
		setInput("");

		try {
			const msg = await chatApi<MessageItem>(`/conversations/${selectedId}/messages`, {
				method: "POST",
				body: JSON.stringify({ content }),
			});

			setMessages((prev) => {
				if (prev.some((message) => message.id === msg.id))
					return prev;
				return [...prev, msg];
			});

			await loadConversations();
		} catch (e: unknown) {
			setError(getDisplayError(e));
			setInput(content);
			await loadConversations();
		}
	}

	async function openDmWith(userId: number) {
		setError(null);
		try {
			const data = await chatApi<{ conversationId: number; created: boolean; restored?: boolean }>(`/dm`, {
				method: "POST",
				body: JSON.stringify({ otherUserId: String(userId) }),
			});

			setTab("chats");
			setSelectedId(data.conversationId);

			await loadConversations();
			await loadMessages(data.conversationId);
		} catch (e: unknown) {
			setError(getDisplayError(e));
		}
	}

	async function deleteConversationForMe(conversationId: number) {
		const ok = window.confirm(t('chat.removeConfirm'));
		if (!ok) return;

		try {
			setError(null);

			await chatApi(`/conversations/${conversationId}`, {
				method: "DELETE",
			});

			if (selectedId === conversationId) {
				setSelectedId(null);
				setMessages([]);
			}

			await loadConversations();
		} catch (err: unknown) {
			setError(getDisplayError(err));
		}
	}

	async function loadOnline() {
		setLoadingOnline(true);
		setError(null);
		try {
			const data = await usersApi<{ total: number; users: OnlineUser[] }>(`/users/filter/online`);
			const list = (data.users || []).filter((u) => !myUserId || u.id !== myUserId);
			setOnlineUsers(list);
		} catch (e: unknown) {
			setError(getDisplayError(e));
		} finally {
			setLoadingOnline(false);
		}
	}

	async function loadAllUsers() {
		setLoadingAll(true);
		setError(null);
		try {
			const data = await usersApi<{ total: number; users: OnlineUser[] }>(`/users`);
			setAllUsers(data.users || []);
		} catch (e: unknown) {
			setError(getDisplayError(e));
		} finally {
			setLoadingAll(false);
		}
	}

	async function loadFriends() {
		if (!myUserId) return;
		setLoadingFriends(true);
		setError(null);
		try {
			const data = await usersApi<{ total: number; friends: FriendUser[] }>(`/users/${myUserId}/my_friends`);
			setFriends(data.friends || []);
		} catch (e: unknown) {
			setError(getDisplayError(e));
		} finally {
			setLoadingFriends(false);
		}
	}

	async function loadPending() {
		if (!myUserId) return;
		setLoadingPending(true);
		setError(null);
		try {
			const data = await usersApi<{ total: number; requests: PendingRequest[] }>(`/users/${myUserId}/pending_requests`);
			const requests = data.requests || [];
			setPending(requests);
			setPendingBadgeCount(requests.length);
		} catch (e: unknown) {
			setError(getDisplayError(e));
		} finally {
			setLoadingPending(false);
		}
	}

	async function sendFriendRequest(friendId: number) {
		if (!myUserId) return;
		setError(null);
		try {
			await usersApi(`/users/${myUserId}/send_request/${friendId}`, { method: "POST" });
			setSentRequests((prev) => ({ ...prev, [friendId]: true }));
			await loadPending();
		} catch (e: unknown) {
			setError(getDisplayError(e));
		}
	}

	async function acceptRequest(friendId: number) {
		if (!myUserId) return;
		setError(null);
		try {
			await usersApi(`/users/${myUserId}/accept_request/${friendId}`, { method: "POST" });
			await loadPending();
			await loadFriends();
			await loadOnline();
		} catch (e: unknown) {
			setError(getDisplayError(e));
		}
	}

	async function rejectRequest(friendId: number) {
		if (!myUserId) return;
		setError(null);
		try {
			await usersApi(`/users/${myUserId}/reject_request/${friendId}`, { method: "DELETE" });
			await loadPending();
		} catch (e: unknown) {
			setError(getDisplayError(e));
		}
	}

	// Start notifications as soon as a valid session exists, even with the widget closed.
	useEffect(() => {
		if (!sessionToken) {
			setConversations([]);
			setMessages([]);
			setSelectedId(null);
			setMessageBadgeCount(0);
			setPendingBadgeCount(0);
			return;
		}

		loadConversations();
		loadPending();
	}, [sessionToken, myUserId]);

	// One WebSocket connection per authenticated session.
	useEffect(() => {
		if (!sessionToken) return;

		let stopped = false;
		let reconnectTimer: number | null = null;
		let ws: WebSocket | null = null;

		const connect = () => {
			const protocol = window.location.protocol === "https:" ? "wss" : "ws";
			ws = new WebSocket(
				`${protocol}://${window.location.host}/api/chat/ws?token=${encodeURIComponent(sessionToken)}`
			);

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(String(event.data)) as {
						type?: string;
						conversationId?: number;
						message?: MessageItem;
					};

					if (data.type === "message:new" && data.message && data.conversationId) {
						const isOpenConversation =
							openRef.current && selectedIdRef.current === data.conversationId;

						if (isOpenConversation) {
							setMessages((prev) => {
								if (prev.some((message) => message.id === data.message?.id))
									return prev;
								return [...prev, data.message as MessageItem];
							});
							markConversationRead(data.conversationId, data.message.id);
						} else {
							setMessageBadgeCount((count) => count + 1);
						}

						loadConversations();
						return;
					}

					if (
						data.type === "conversation:new" ||
						data.type === "conversation:member-hidden" ||
						data.type === "conversation:member-restored"
					) {
						loadConversations();
					}
				} catch {
					// Ignore malformed WebSocket payloads.
				}
			};

			ws.onclose = (event) => {
				const errorCode = Number(event.reason);
				const authenticationFailed =
					errorCode === ChatErrorCode.AUTH_TOKEN_MISSING ||
					errorCode === ChatErrorCode.AUTH_TOKEN_INVALID;

				if (authenticationFailed) {
					setError(
						t(getChatErrorTranslationKey(errorCode), {
							max: CHAT_MESSAGE_MAX_LENGTH,
							maxIds: 50,
						}),
					);
					return;
				}

				if (!stopped)
					reconnectTimer = window.setTimeout(connect, 2000);
			};
		};

		connect();

		return () => {
			stopped = true;
			if (reconnectTimer !== null)
				window.clearTimeout(reconnectTimer);
			ws?.close();
		};
	}, [sessionToken]);

	// Load messages only when the widget is open and a chat is selected.
	useEffect(() => {
		if (!open || !selectedId) return;
		loadMessages(selectedId);
	}, [open, selectedId]);

	useEffect(() => {
		if (!open) return;

		if (tab === "chats")
			loadConversations();
		if (tab === "friends") {
			loadFriends();
			loadPending();
			loadOnline();
		}
		if (tab === "online")
			loadOnline();
		if (tab === "offline") {
			loadAllUsers();
			loadOnline();
			loadFriends();
		}
	}, [open, tab]);

	useEffect(() => {
		if (!open || (tab !== "online" && tab !== "friends")) return;

		const id = window.setInterval(loadOnline, 10_000);
		return () => window.clearInterval(id);
	}, [open, tab, myUserId]);

	// Friend-request badge can still use light polling; messages are immediate through WS.
	useEffect(() => {
		if (!sessionToken || !myUserId) return;

		const id = window.setInterval(loadPending, 15_000);
		return () => window.clearInterval(id);
	}, [sessionToken, myUserId]);

	return (
		<>
			{/* Floating button (hidden while chat is open) */}
			{!open && (
				<button onClick={() => setOpen(true)}
					className="fixed bottom-4 right-4 z-[9999] flex h-11 w-11 md:h-14 md:w-14 items-center justify-center rounded-full bg-blue-400/60
								border border-yellow-400 text-2xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]
								transition-all duration-500 hover:bg-yellow-400/50 hover:scale-115"
					aria-label={t('chat.openChat')}
					title={t('chat.title')}>
					<span className="text-lg md:text-2xl">💬</span>
					{totalBadgeCount > 0 && (
						<span className="absolute -top-1 -right-1 rounded-full bg-red-600 text-white text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-[1px] md:py-[2px]">
							{totalBadgeCount > 99 ? "99+" : totalBadgeCount}
						</span>
					)}
				</button>
			)}

			{open && (
				<div onClick={() => setOpen(false)}
					className="fixed inset-0 z-[9998] flex items-center justify-end bg-black/10 p-6
							    backdrop-blur-[2px] transition-all duration-700 max-sm:justify-center max-sm:p-3">
					<div onClick={(e) => e.stopPropagation()}
						className="grid h-[42rem] w-[44rem] max-w-[82vw] max-h-[80vh] grid-rows-[auto_1fr] overflow-hidden rounded-[2rem] border border-white/35
									bg-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-yellow-400/50
									max-sm:h-[calc(100dvh-6rem)] max-sm:w-[calc(100vw-1.5rem)] max-sm:max-w-none max-sm:rounded-[1.5rem]">
						<div className="flex items-center px-4 py-3 border-b border-gray-100 justify-between max-sm:gap-2 max-sm:px-2 max-sm:py-2">
							<div className="flex items-center gap-2 max-sm:min-w-0 max-sm:flex-1 max-sm:gap-1 max-sm:overflow-hidden">
								<OlympusButton
									onClick={() => setTab("chats")}
									className={`max-sm:!h-8 max-sm:!min-w-0 max-sm:!flex-1 max-sm:!px-1 max-sm:!text-[0.52rem] max-sm:!tracking-[0.03em]
											${tab !== "chats" ? "opacity-50" : "bg-yellow-400/70 text-black"}`}>
									{t('chat.tabs.chats')}
								</OlympusButton>
								<OlympusButton
									onClick={() => setTab("friends")}
									className={`max-sm:!h-8 max-sm:!min-w-0 max-sm:!flex-1 max-sm:!px-1 max-sm:!text-[0.52rem] max-sm:!tracking-[0.03em]
											${tab !== "friends" ? "opacity-50" : "bg-yellow-400/70 text-black"}`}>
									{t('chat.tabs.friends')}
								</OlympusButton>
								<OlympusButton
									onClick={() => setTab("online")}
									className={`max-sm:!h-8 max-sm:!min-w-0 max-sm:!flex-1 max-sm:!px-1 max-sm:!text-[0.52rem] max-sm:!tracking-[0.03em]
											${tab !== "online" ? "opacity-50" : "bg-yellow-400/70 text-black"}`}>
									{t('chat.tabs.online')}
								</OlympusButton>
								<OlympusButton
									onClick={() => setTab("offline")}
									className={`max-sm:!h-8 max-sm:!min-w-0 max-sm:!flex-1 max-sm:!px-1 max-sm:!text-[0.52rem] max-sm:!tracking-[0.03em]
											${tab !== "offline" ? "opacity-50" : "bg-yellow-400/70 text-black"}`}>
									{t('chat.tabs.offline')}
								</OlympusButton>
							</div>

							<button
								onClick={() => setOpen(false)}
								className="rounded-full p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
								title={t('chat.close')}>
								<X className="w-4 h-4" />
							</button>
						</div>

						{error && (
							<div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
								{error}
							</div>
						)}

						{/*body*/}
						<div className="grid min-h-0 grid-cols-[16rem_1fr] p-1 max-sm:grid-cols-1">
							<div className={`flex min-h-0 min-w-0 w-full flex-col border-r border-white/35 bg-white/60 max-sm:border-r-0 ${
								selectedId && tab === "chats" ? "max-sm:hidden" : ""
							}`}>
								<div className="border-b border-gray-100 px-4 py-3 flex items-center gap-2
										max-sm:px-2 max-sm:py-2 max-sm:gap-1.5">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
										<input
											id="chat-search-conversations"
											name="chatSearchConversations"
											type="search"
											autoComplete="off"
											value={search}
											onChange={(e) => setSearch(e.target.value)}
											placeholder={t('chat.searchConversations')}
											className="w-full rounded-full bg-gray-100 pl-7 pr-2 py-1.5 text-xs text-gray-600 outline-none max-sm:text-[0.7rem]" />
									</div>
									<button onClick={() => setTab("friends")} className="text-gray-400 hover:text-gray-600 transition-colors" title={t('chat.newConversation')}>
										<SquarePen className="w-4 h-4" />
									</button>
								</div>



								{/* scroll content */}
								<div className="flex-1 overflow-auto p-2 max-sm:p-1.5">

									{/* CHATS */}
									{tab === "chats" && (
										<>
											{loadingConvs && <div className="p-2 text-gray-600">{t('chat.loading')}</div>}
											{!loadingConvs && conversations.length === 0 && <div className="p-2 text-gray-600">{t('chat.noConversationsYet')}</div>}
											{!loadingConvs && conversations.length > 0 && filteredConversations.length === 0 && (
												<div className="p-2 text-gray-600">{t('chat.noSearchResults')}</div>
											)}

											{filteredConversations.map((c) => {
												const active = c.id === selectedId;
												const otherId = c.otherUserIds[0];
												const title = otherId
													? (userMap[otherId]?.name || t('chat.userUnavailable'))
													: t('chat.userUnavailable');
												const leftUserId = c.lastMessage
													? getMemberLeftUserId(c.lastMessage)
													: null;
												const preview = leftUserId
													? t('chat.userLeftConversation', {
														name: userMap[leftUserId]?.name || t('chat.userUnavailable'),
													})
													: (c.lastMessage ? c.lastMessage.content : t('chat.noMessagesPreview'));

												return (
													<div
														key={c.id}
														className={[
															"mb-2 flex items-center gap-2 rounded-xl border px-3 py-2 transition",
															active ? "border-black bg-black text-white" : "border-gray-200 bg-white hover:bg-gray-50",
														].join(" ")}>
														<button
															onClick={() => setSelectedId(c.id)}
															className="min-w-0 flex-1 text-left">
															<div className="mb-1 flex items-center gap-2">
																<div className="min-w-0 flex-1 truncate text-sm font-bold">{title}</div>
																{c.unreadCount > 0 && (
																	<span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
																		{c.unreadCount > 99 ? "99+" : c.unreadCount}
																	</span>
																)}
															</div>
															<div className="truncate text-xs opacity-80">{preview}</div>
														</button>

														<button
															onClick={(e) => {
																e.stopPropagation();
																deleteConversationForMe(c.id);
															}}
															className={[
																"rounded-lg px-2 py-1 text-xs font-bold",
																active ? "bg-white text-black" : "border border-gray-300 text-gray-700",
															].join(" ")}
															title={t('chat.removeConversation')}>
															✕
														</button>
													</div>
												);
											})}
										</>
									)}

									{/* FRIENDS */}
									{tab === "friends" && (
										<>
											<div className="mb-2 text-xs font-bold text-gray-700">{t('chat.pendingRequests')}</div>
											{loadingPending && <div className="p-2 text-gray-600">{t('chat.loadingPending')}</div>}
											{!loadingPending && pending.length === 0 && <div className="mb-3 p-2 text-gray-600">{t('chat.noPendingRequests')}</div>}

											{pending.map((p) => (
												<div key={p.id} className="mb-2 rounded-xl border border-gray-200 bg-white p-2">
													<div className="text-sm font-bold truncate">{p.requester.name}</div>
													<div className="text-xs text-gray-600 truncate">{p.requester.email}</div>
													<div className="mt-2 flex gap-2">
														<button
															onClick={() => acceptRequest(p.requester.id)}
															className="rounded-lg bg-black px-3 py-1 text-xs font-bold text-white">
															{t('chat.accept')}
														</button>
														<button
															onClick={() => rejectRequest(p.requester.id)}
															className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-bold">
															{t('chat.reject')}
														</button>
													</div>
												</div>
											))}

											<div className="mt-4 mb-2 text-xs font-bold text-gray-700">{t('chat.friendsOnline')}</div>
											{loadingFriends && <div className="p-2 text-gray-600">{t('chat.loadingFriends')}</div>}
											{!loadingFriends && onlineFriends.length === 0 && <div className="mb-3 p-2 text-gray-600">{t('chat.noFriendsOnline')}</div>}

											{onlineFriends.map((f) => (
												<div key={f.id} className="mb-2 flex min-w-0 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2
														max-sm:px-2 max-sm:py-2">
													<div className="min-w-0 flex-1">
														<div className="flex items-center gap-2">
															<span className="h-2 w-2 rounded-full bg-green-500" />
															<div className="text-sm font-bold truncate">{f.name}</div>
														</div>
														<div className="text-xs text-gray-600 truncate">{f.email}</div>
													</div>
													<button onClick={() => openDmWith(f.id)} className="ml-2 shrink-0 rounded-lg bg-black px-3 py-1 text-sm font-bold text-white
															max-sm:px-2 max-sm:text-[0.72rem]">
														DM
													</button>
												</div>
											))}

											<div className="mt-4 mb-2 text-xs font-bold text-gray-700">{t('chat.friendsOffline')}</div>
											{!loadingFriends && offlineFriends.length === 0 && <div className="p-2 text-gray-600">{t('chat.noFriendsOffline')}</div>}

											{offlineFriends.map((f) => (
												<div key={f.id} className="mb-2 flex min-w-0 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2
														max-sm:px-2 max-sm:py-2">
													<div className="min-w-0 flex-1">
														<div className="flex items-center gap-2">
															<span className="h-2 w-2 rounded-full bg-gray-300" />
															<div className="text-sm font-bold truncate">{f.name}</div>
														</div>
														<div className="text-xs text-gray-600 truncate">{f.email}</div>
													</div>
													<button onClick={() => openDmWith(f.id)} className="ml-2 shrink-0 rounded-lg border border-gray-300 px-3 py-1 text-sm font-bold
															max-sm:px-2 max-sm:text-[0.72rem]">														DM
													</button>
												</div>
											))}
										</>
									)}

									{/* ONLINE USERS */}
									{tab === "online" && (
										<>
											{loadingOnline && <div className="p-2 text-gray-600">{t('chat.loadingOnlineUsers')}</div>}
											{!loadingOnline && onlineUsers.length === 0 && <div className="p-2 text-gray-600">{t('chat.noOneOnline')}</div>}

											{onlineUsers.map((u) => {
												const isFriend = friendSet.has(u.id);
												return (
													<div key={u.id} className="mb-2 flex min-w-0 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2
																max-sm:px-2 max-sm:py-2">
														<div className="min-w-0 flex-1">
															<div className="flex items-center gap-2">
																<span className="h-2 w-2 rounded-full bg-green-500" />
																<div className="text-sm font-bold truncate">{u.name}</div>
															</div>
															<div className="text-xs text-gray-600 truncate">{u.email}</div>
														</div>

														{isFriend ? (
															<button onClick={() => openDmWith(u.id)}
																className="shrink-0 rounded-lg bg-black px-3 py-1 text-sm font-bold text-white max-sm:px-2 max-sm:text-[0.72rem]">
																DM
															</button>
														) : (
															<button
																onClick={() => sendFriendRequest(u.id)}
																className="shrink-0 rounded-lg border border-gray-300 px-3 py-1 text-sm font-bold max-sm:max-w-[4.6rem] max-sm:overflow-hidden
																		max-sm:text-ellipsis max-sm:px-2 max-sm:text-[0.68rem]"
																disabled={!!sentRequests[u.id]}
																title={sentRequests[u.id] ? t('chat.requestSent') : t('chat.sendFriendRequest')}>
																{sentRequests[u.id] ? t('chat.requested') : t('chat.add')}
															</button>
														)}
													</div>
												);
											})}
										</>
									)}

									{/* OFFLINE USERS */}
									{tab === "offline" && (
										<>
											{loadingAll && <div className="p-2 text-gray-600">{t('chat.loadingOfflineUsers')}</div>}
											{!loadingAll && offlineUsers.length === 0 && <div className="p-2 text-gray-600">{t('chat.noOfflineUsers')}</div>}

											{offlineUsers.map((u) => {
												const isFriend = friendSet.has(u.id);
												return (
													<div key={u.id} className="mb-2 flex min-w-0 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 max-sm:px-2 max-sm:py-2">
														<div className="min-w-0 flex-1">
															<div className="flex items-center gap-2">
																<span className="h-2 w-2 rounded-full bg-gray-300" />
																<div className="text-sm font-bold truncate">{u.name}</div>
															</div>
															<div className="text-xs text-gray-600 truncate">{u.email}</div>
														</div>

														{isFriend ? (
															<button onClick={() => openDmWith(u.id)}
																className="shrink-0 rounded-lg border border-gray-300 px-3 py-1 text-sm font-bold
																	max-sm:max-w-[4.6rem] max-sm:overflow-hidden max-sm:text-ellipsis max-sm:px-2 max-sm:text-[0.68rem]">
																DM
															</button>
														) : (
															<button
																onClick={() => sendFriendRequest(u.id)}
																className="shrink-0 rounded-lg border border-gray-300 px-3 py-1 text-sm font-bold max-sm:px-2 max-sm:text-[0.72rem]"
																disabled={!!sentRequests[u.id]}
																title={sentRequests[u.id] ? t('chat.requestSent') : t('chat.sendFriendRequest')}
															>
																{sentRequests[u.id] ? t('chat.requested') : t('chat.add')}
															</button>
														)}
													</div>
												);
											})}
										</>
									)}
								</div>
							</div>

							{/* RIGHT PANEL (messages) */}
							<div className={`flex flex-col min-h-0 bg-white/60 ${
								selectedId && tab === "chats" ? "max-sm:flex" : "max-sm:hidden"
							}`}>
								<div className="flex items-center gap-2 px-3 py-2 font-bold">
									<button
										onClick={() => setSelectedId(null)}
										className="hidden rounded-full p-1 text-gray-500 hover:bg-gray-100 max-sm:block"
										title={t('chat.back')}>
										<ArrowLeft className="h-4 w-4" />
									</button>
									<span className="truncate">{selectedTitle}</span>
								</div>


								<div className="flex-1 overflow-auto border-1 rounded-[2rem] border-yellow-400/30 p-3">
									{loadingMsgs && <div className="text-gray-600">{t('chat.loadingMessages')}</div>}
									{!loadingMsgs && selectedId && visibleMessages.length === 0 && <div className="text-gray-600">{t('chat.noMessagesYet')}</div>}

									{visibleMessages.map((m) => {
										const leftUserId = getMemberLeftUserId(m);

										if (leftUserId) {
											const userName = userMap[leftUserId]?.name || t('chat.userUnavailable');

											return (
												<div key={m.id} className="mb-3 flex justify-center px-2">
													<div className="max-w-[90%] min-w-0 rounded-full bg-gray-100 px-4 py-2 text-center text-xs text-gray-600
														whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
														{t('chat.userLeftConversation', { name: userName })}
													</div>
												</div>
											);
										}

										const mine = myUserId ? m.senderId === String(myUserId) : false;
										return (
											<div key={m.id} className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}>
												<div
													className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-900"
														}`}>
													<div className="mb-1 text-[11px] opacity-75">
														{(mine ? t('chat.you') : (userMap[m.senderId]?.name || t('chat.userUnavailable')))} · {new Date(m.createdAt).toLocaleString()}
													</div>
													<div className="min-w-0 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{m.content}</div>
												</div>
											</div>
										);
									})}
								</div>

								<div className="px-4 py-3 flex items-end gap-2">
									<div className="min-w-0 flex-1">
										<input
											id="chat-message-input"
											name="chatMessage"
											type="text"
											autoComplete="off"
											value={input}
											maxLength={CHAT_MESSAGE_MAX_LENGTH}
											onChange={(e) => {
												setInput(e.target.value);
												setError(null);
											}}
											placeholder={t('chat.typeMessage')}
											disabled={!selectedId}
											aria-describedby="chat-message-counter"
											className="w-full rounded-full bg-gray-100 px-4 py-2 text-sm outline-none text-gray-700 placeholder-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
											onKeyDown={(e) => {
												if (e.key === "Enter" && !e.nativeEvent.isComposing)
													sendMessage();
											}} />
										<div
											id="chat-message-counter"
											className="mt-1 pr-2 text-right text-[10px] text-gray-500">
											{t('chat.messageCounter', {
												count: input.length,
												max: CHAT_MESSAGE_MAX_LENGTH,
											})}
										</div>
									</div>
									<button
										onClick={sendMessage}
										disabled={!selectedId || input.trim().length === 0}
										title={t('chat.send')}
										className="flex-shrink-0 h-14 w-14 border rounded-full bg-black/80 flex items-center justify-center
													text-white hover:bg-yellow-400/50 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
										<Send className="w-6 h-6" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}