import { useEffect, useMemo, useState } from "react";
import { Paperclip, Smile, Send, Search, SquarePen, MoreVertical, X, MessageCircle } from 'lucide-react';
import { OlympusButton } from '../Buttons/ProfileButton';

type ConversationItem = {
	id: number;
	type: "DM" | "GROUP";
	title: string | null;
	members: string[];
	otherUserIds: string[];
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

async function chatApi<T>(path: string, init?: RequestInit): Promise<T> {
	const token = getToken();
	if (!token) throw new Error("Missing token. Please login first.");

	const headers = new Headers(init?.headers || {});
	headers.set("Content-Type", "application/json");
	headers.set("Authorization", `Bearer ${token}`);

	const res = await fetch(`${CHAT_API}${path}`, { ...init, headers });
	if (!res.ok) throw new Error((await res.text().catch(() => "")) || `Chat failed (${res.status})`);
	return (await res.json()) as T;
}

async function usersApi<T>(path: string, init?: RequestInit): Promise<T> {
	const token = getToken();
	if (!token) throw new Error("Missing token. Please login first.");

	const headers = new Headers(init?.headers || {});
	headers.set("Authorization", `Bearer ${token}`);

	const res = await fetch(`${AUTH_API}${path}`, { ...init, headers });
	if (!res.ok) throw new Error((await res.text().catch(() => "")) || `Users failed (${res.status})`);
	return (await res.json()) as T;
}

export function ChatWidget() {
	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState<"chats" | "friends" | "online" | "offline">("chats");
	const [badgeCount, setBadgeCount] = useState(0);
	const [groupTitle, setGroupTitle] = useState("");
	const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

	const myUserId = getMyUserId();

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
	const [, setError] = useState<string | null>(null);
	const [loadingConvs, setLoadingConvs] = useState(false);
	const [loadingMsgs, setLoadingMsgs] = useState(false);
	const [loadingOnline, setLoadingOnline] = useState(false);
	const [loadingAll, setLoadingAll] = useState(false);
	const [loadingFriends, setLoadingFriends] = useState(false);
	const [loadingPending, setLoadingPending] = useState(false);

	// Permite abrir el chat desde cualquier parte (ej: objeto interactivo del hub)
	useEffect(() => {
		const openFromHub = () => setOpen(true);
		window.addEventListener("chat:open", openFromHub as EventListener);

		return () => {
			window.removeEventListener("chat:open", openFromHub as EventListener);
		};
	}, []);

	// Seen helpers for unread badge
	function getSeenId(convId: number): number {
		const v = localStorage.getItem(`chat:lastSeen:${convId}`);
		return v ? Number(v) : 0;
	}
	function setSeenId(convId: number, msgId: number) {
		localStorage.setItem(`chat:lastSeen:${convId}`, String(msgId));
	}

	const onlineSet = useMemo(() => new Set(onlineUsers.map((u) => u.id)), [onlineUsers]);
	const friendSet = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);

	const selected = useMemo(
		() => conversations.find((c) => c.id === selectedId) || null,
		[conversations, selectedId]
	);

	const selectedTitle = useMemo(() => {
		if (!selected) return "Select a conversation";
		if (selected.type === "GROUP") return selected.title || `Group #${selected.id}`;
		const otherId = selected.otherUserIds[0];
		return userMap[otherId]?.name || `User ${otherId}`;
	}, [selected, userMap]);

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
		if (unique.length === 0) return;

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

			// resolve user ids to names (for DM titles)
			const idsToResolve: string[] = [];
			for (const c of data.conversations) {
				for (const id of c.members) idsToResolve.push(String(id));
			}
			await resolveUsers(idsToResolve);

			if (data.conversations.length && selectedId === null) setSelectedId(data.conversations[0].id);
		} catch (e: any) {
			setError(e?.message || "Failed to load conversations");
		} finally {
			setLoadingConvs(false);
		}
	}

	async function loadMessages(conversationId: number) {
		setLoadingMsgs(true);
		setError(null);
		try {
			const data = await chatApi<{ messages: MessageItem[]; nextCursor: number | null }>(
				`/conversations/${conversationId}/messages?limit=50`
			);

			// Prisma devuelve DESC (más nuevo primero)
			const newestId = data.messages?.[0]?.id;
			if (newestId) setSeenId(conversationId, newestId);

			// UI los muestra ASC
			setMessages([...data.messages].reverse());
		} catch (e: any) {
			setError(e?.message || "Failed to load messages");
		} finally {
			setLoadingMsgs(false);
		}
	}

	async function sendMessage() {
		if (!selectedId) return;
		const content = input.trim();
		if (!content) return;

		setError(null);
		setInput("");

		try {
			const msg = await chatApi<MessageItem>(`/conversations/${selectedId}/messages`, {
				method: "POST",
				body: JSON.stringify({ content }),
			});

			setMessages((prev) => [...prev, msg]);
			// marcar visto el propio mensaje también
			setSeenId(selectedId, msg.id);

			await loadConversations();
		} catch (e: any) {
			setError(e?.message || "Failed to send message");
			setInput(content);
		}
	}

	async function openDmWith(userId: number) {
		setError(null);
		const data = await chatApi<{ conversationId: number; created: boolean }>(`/dm`, {
			method: "POST",
			body: JSON.stringify({ otherUserId: String(userId) }),
		});

		setTab("chats");
		setSelectedId(data.conversationId);

		await loadConversations();
		await loadMessages(data.conversationId);
	}

	async function createGroup(title: string, memberIds: string[]) {
		try {
			setError(null);

			const clean = Array.from(new Set(memberIds.map((s) => String(s).trim()).filter(Boolean)));

			if (!title.trim()) {
				setError("Group title is required");
				return;
			}
			if (clean.length === 0) {
				setError("You must add at least 1 member id");
				return;
			}

			const data = await chatApi<{ conversation: { id: number } }>(`/groups`, {
				method: "POST",
				body: JSON.stringify({ title: title.trim(), memberIds: clean }),
			});

			const convId = data?.conversation?.id;
			if (!convId) throw new Error("Invalid response: missing conversation id");

			setTab("chats");
			setSelectedId(convId);

			await loadConversations();
			await loadMessages(convId);
		} catch (err: any) {
			setError(err?.message || "Failed to create group");
		}
	}
	function toggleGroupFriend(id: number) {
		const value = String(id);

		setSelectedGroupIds((prev) => {
			if (prev.includes(value)) {
				return prev.filter((x) => x !== value);
			}
			return [...prev, value];
		});
	}

	async function createGroupFromFriends() {
		if (!groupTitle.trim()) {
			setError("Group title is required");
			return;
		}

		if (selectedGroupIds.length === 0) {
			setError("Select at least one friend");
			return;
		}

		await createGroup(groupTitle.trim(), selectedGroupIds);

		setGroupTitle("");
		setSelectedGroupIds([]);
	}

	async function deleteConversationForMe(conversationId: number) {
		const ok = window.confirm("Remove this conversation from your chat list?");
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
		} catch (err: any) {
			setError(err?.message || "Failed to delete conversation");
		}
	}

	async function loadOnline() {
		setLoadingOnline(true);
		setError(null);
		try {
			const data = await usersApi<{ total: number; users: OnlineUser[] }>(`/users/filter/online`);
			const list = (data.users || []).filter((u) => !myUserId || u.id !== myUserId);
			setOnlineUsers(list);
		} catch (e: any) {
			setError(e?.message || "Failed to load online users");
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
		} catch (e: any) {
			setError(e?.message || "Failed to load users");
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
		} catch (e: any) {
			setError(e?.message || "Failed to load friends");
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
			setPending(data.requests || []);
		} catch (e: any) {
			setError(e?.message || "Failed to load pending requests");
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
		} catch (e: any) {
			setError(e?.message || "Failed to send friend request");
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
		} catch (e: any) {
			setError(e?.message || "Failed to accept request");
		}
	}

	async function rejectRequest(friendId: number) {
		if (!myUserId) return;
		setError(null);
		try {
			await usersApi(`/users/${myUserId}/reject_request/${friendId}`, { method: "DELETE" });
			await loadPending();
		} catch (e: any) {
			setError(e?.message || "Failed to reject request");
		}
	}

	// Load initial data when opening
	useEffect(() => {
		if (!open) return;
		loadConversations();
		loadOnline();
	}, [open]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(
      `${protocol}://${window.location.host}/api/chat/ws?token=${encodeURIComponent(token)}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "message:new") {
        const msg = data.message;

        if (selectedId === data.conversationId) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === msg.id);
            if (exists) return prev;
            return [...prev, msg];
          });

          setSeenId(data.conversationId, msg.id);
        }

        loadConversations();
      }
    };

    ws.onerror = () => {
      console.log("WebSocket error");
    };

    return () => {
      ws.close();
    };
  }, [selectedId]);
	// Load messages when selecting a conversation
	useEffect(() => {
		if (!open || !selectedId) return;
		loadMessages(selectedId);
	}, [open, selectedId]);

	// Load data when switching tabs
	useEffect(() => {
		if (!open) return;

		if (tab === "friends") {
			loadFriends();
			loadPending();
			loadOnline();
		}
		if (tab === "online") {
			loadOnline();
		}
		if (tab === "offline") {
			loadAllUsers();
			loadOnline();
			loadFriends();
		}
	}, [open, tab]);

	// Refresh online list every 10s when looking at Online or Friends
	useEffect(() => {
		if (!open) return;
		if (tab !== "online" && tab !== "friends") return;

		loadOnline();
		const id = window.setInterval(loadOnline, 10_000);
		return () => window.clearInterval(id);
	}, [open, tab]);

	// Badge polling (unread msgs + pending requests)
	useEffect(() => {
		const t = localStorage.getItem("token");
		if (!t) return;

		let stopped = false;

		const tick = async () => {
			try {
				const convs = await chatApi<{ conversations: ConversationItem[] }>("/conversations");
				let unread = 0;

				const myId = localStorage.getItem("userId") || "";

				for (const c of convs.conversations) {
					if (!c.lastMessage) continue;

					const seen = getSeenId(c.id);
					const lastId = c.lastMessage.id;
					const mine = myId ? c.lastMessage.senderId === String(myId) : false;

					if (!mine && lastId > seen) unread += 1;
				}

				let pendingCount = 0;
				const uid = localStorage.getItem("userId");
				if (uid) {
					const p = await usersApi<{ requests: any[] }>(`/users/${uid}/pending_requests`);
					pendingCount = p.requests?.length || 0;
				}

				if (!stopped) setBadgeCount(unread + pendingCount);
			} catch {
				// ignore
			}
		};

		tick();
		const id = window.setInterval(tick, 10_000);
		return () => {
			stopped = true;
			window.clearInterval(id);
		};
	}, []);

	return (
		<>
			{/* Floating button (hidden while chat is open) */}
			{!open && (
				<button onClick={() => setOpen(true)}
					className="fixed bottom-4 right-4 z-[9999] flex h-11 w-11 md:h-14 md:w-14 items-center justify-center rounded-full bg-blue-400/60
								border border-yellow-400 text-2xl text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]
								transition-all duration-500 hover:bg-yellow-400/50 hover:scale-115"
					aria-label="Open chat"
					title="Chat">
					<span className="text-lg md:text-2xl">💬</span>
					{badgeCount > 0 && (
						<span className="absolute -top-1 -right-1 rounded-full bg-red-600 text-white text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-[1px] md:py-[2px]">
							{badgeCount > 99 ? "99+" : badgeCount}
						</span>
					)}
				</button>
			)}

			{open && (
				<div onClick={() => setOpen(false)}
					className="fixed inset-0 z-[9998] flex items-center justify-end bg-black/10 p-6
							    backdrop-blur-[2px] transition-all duration-700">
					<div onClick={(e) => e.stopPropagation()}
						className="grid h-[42rem] w-[44rem] max-w-[82vw] max-h-[80vh] grid-rows-[auto_1fr] overflow-hidden rounded-[2rem] border border-white/35
									bg-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.25)] ring-1 ring-yellow-400/50">


						<div className="flex items-center px-4 py-3 border-b border-gray-100 justify-between">
							<div className="flex items-center gap-2">
								<OlympusButton
									onClick={() => setTab("chats")}
									className={tab !== "chats" ? "opacity-50" : "bg-yellow-400/70 text-black"}
								>
									Chats
								</OlympusButton>
								<OlympusButton
									onClick={() => setTab("friends")}
									className={tab !== "friends" ? "opacity-50" : "bg-yellow-400/70 text-black"}
								>
									Friends
								</OlympusButton>
								<OlympusButton
									onClick={() => setTab("online")}
									className={tab !== "online" ? "opacity-50" : "bg-yellow-400/70 text-black"}
								>
									Online
								</OlympusButton>
								<OlympusButton
									onClick={() => setTab("offline")}
									className={tab !== "offline" ? "opacity-50" : "bg-yellow-400/70 text-black"}
								>
									Offline
								</OlympusButton>
							</div>

							<button
								onClick={() => setOpen(false)}
								className="rounded-full p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
								title="Close"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
						{/*body*/}
						<div className="grid min-h-0 grid-cols-[16rem_1fr] p-1">
							<div className=" flex min-h-0 flex-col border-r border-white/35 bg-white/60">
								<div className="border-b border-gray-100 px-4 py-3 flex items-center gap-2">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
										<input
											placeholder="Search conversations..."
											className="w-full rounded-full bg-gray-100 pl-8 pr-3 py-1.5 text-xs text-gray-600 outline-none" />
									</div>
									<button className="text-gray-400 hover:text-gray-600 transition-colors">
										<SquarePen className="w-4 h-4" />
									</button>
								</div>



								{/* scroll content */}
								<div className="flex-1 overflow-auto p-2">
									{/* New group only on Friends */}
									{tab === "friends" && (
										<div className="mb-3 rounded-xl border border-gray-200 bg-white p-3">
											<div className="mb-2 text-sm font-bold">Create group</div>

											<input
												value={groupTitle}
												onChange={(e) => setGroupTitle(e.target.value)}
												placeholder="Group name"
												className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
											/>

											<div className="mb-2 max-h-32 overflow-auto rounded-lg border border-gray-100 p-2">
												{friends.length === 0 && (
													<div className="text-xs text-gray-500">
														No friends available
													</div>
												)}

												{friends.map((f) => (
													<label
														key={f.id}
														className="mb-1 flex cursor-pointer items-center gap-2 text-sm"
													>
														<input
															type="checkbox"
															checked={selectedGroupIds.includes(String(f.id))}
															onChange={() => toggleGroupFriend(f.id)}
														/>
														<span>{f.name}</span>
														<span className="text-xs text-gray-500">{f.email}</span>
													</label>
												))}
											</div>

											<button
												onClick={createGroupFromFriends}
												className="w-full rounded-lg bg-black px-3 py-2 text-sm font-bold text-white"
											>
												+ Create group
											</button>
										</div>
									)}

									{/* CHATS */}
									{tab === "chats" && (
										<>
											{loadingConvs && <div className="p-2 text-gray-600">Loading…</div>}
											{!loadingConvs && conversations.length === 0 && <div className="p-2 text-gray-600">No conversations yet</div>}

											{conversations.map((c) => {
												const active = c.id === selectedId;

												let title = "";
												if (c.type === "GROUP") {
													title = c.title || `Group #${c.id}`;
												} else {
													const otherId = c.otherUserIds[0];
													title = userMap[otherId]?.name || `User ${otherId}`;
												}

												const preview = c.lastMessage ? c.lastMessage.content : "(no messages)";

												return (
													<div
														key={c.id}
														className={[
															"mb-2 flex items-center gap-2 rounded-xl border px-3 py-2 transition",
															active ? "border-black bg-black text-white" : "border-gray-200 bg-white hover:bg-gray-50",
														].join(" ")}
													>
														<button
															onClick={() => setSelectedId(c.id)}
															className="min-w-0 flex-1 text-left"
														>
															<div className="text-sm font-bold mb-1 truncate">{title}</div>
															<div className="text-xs opacity-80 truncate">{preview}</div>
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
															title="Remove conversation"
														>
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
											<div className="mb-2 text-xs font-bold text-gray-700">Pending requests</div>
											{loadingPending && <div className="p-2 text-gray-600">Loading pending…</div>}
											{!loadingPending && pending.length === 0 && <div className="mb-3 p-2 text-gray-600">No pending requests</div>}

											{pending.map((p) => (
												<div key={p.id} className="mb-2 rounded-xl border border-gray-200 bg-white p-2">
													<div className="text-sm font-bold truncate">{p.requester.name}</div>
													<div className="text-xs text-gray-600 truncate">{p.requester.email}</div>
													<div className="mt-2 flex gap-2">
														<button
															onClick={() => acceptRequest(p.requester.id)}
															className="rounded-lg bg-black px-3 py-1 text-xs font-bold text-white"
														>
															Accept
														</button>
														<button
															onClick={() => rejectRequest(p.requester.id)}
															className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-bold"
														>
															Reject
														</button>
													</div>
												</div>
											))}

											<div className="mt-4 mb-2 text-xs font-bold text-gray-700">Friends Online</div>
											{loadingFriends && <div className="p-2 text-gray-600">Loading friends…</div>}
											{!loadingFriends && onlineFriends.length === 0 && <div className="mb-3 p-2 text-gray-600">No friends online</div>}

											{onlineFriends.map((f) => (
												<div key={f.id} className="mb-2 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
													<div className="min-w-0">
														<div className="flex items-center gap-2">
															<span className="h-2 w-2 rounded-full bg-green-500" />
															<div className="text-sm font-bold truncate">{f.name}</div>
														</div>
														<div className="text-xs text-gray-600 truncate">{f.email}</div>
													</div>
													<button onClick={() => openDmWith(f.id)} className="ml-2 rounded-lg bg-black px-3 py-1 text-sm font-bold text-white">
														DM
													</button>
												</div>
											))}

											<div className="mt-4 mb-2 text-xs font-bold text-gray-700">Friends Offline</div>
											{!loadingFriends && offlineFriends.length === 0 && <div className="p-2 text-gray-600">No friends offline</div>}

											{offlineFriends.map((f) => (
												<div key={f.id} className="mb-2 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
													<div className="min-w-0">
														<div className="flex items-center gap-2">
															<span className="h-2 w-2 rounded-full bg-gray-300" />
															<div className="text-sm font-bold truncate">{f.name}</div>
														</div>
														<div className="text-xs text-gray-600 truncate">{f.email}</div>
													</div>
													<button onClick={() => openDmWith(f.id)} className="ml-2 rounded-lg border border-gray-300 px-3 py-1 text-sm font-bold">
														DM
													</button>
												</div>
											))}
										</>
									)}

									{/* ONLINE USERS */}
									{tab === "online" && (
										<>
											{loadingOnline && <div className="p-2 text-gray-600">Loading online users…</div>}
											{!loadingOnline && onlineUsers.length === 0 && <div className="p-2 text-gray-600">No one online</div>}

											{onlineUsers.map((u) => {
												const isFriend = friendSet.has(u.id);
												return (
													<div key={u.id} className="mb-2 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
														<div className="min-w-0">
															<div className="flex items-center gap-2">
																<span className="h-2 w-2 rounded-full bg-green-500" />
																<div className="text-sm font-bold truncate">{u.name}</div>
															</div>
															<div className="text-xs text-gray-600 truncate">{u.email}</div>
														</div>

														{isFriend ? (
															<button onClick={() => openDmWith(u.id)} className="rounded-lg bg-black px-3 py-1 text-sm font-bold text-white">
																DM
															</button>
														) : (
															<button
																onClick={() => sendFriendRequest(u.id)}
																className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-bold"
																disabled={!!sentRequests[u.id]}
																title={sentRequests[u.id] ? "Request sent" : "Send friend request"}
															>
																{sentRequests[u.id] ? "Requested" : "Add"}
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
											{loadingAll && <div className="p-2 text-gray-600">Loading offline users…</div>}
											{!loadingAll && offlineUsers.length === 0 && <div className="p-2 text-gray-600">No offline users</div>}

											{offlineUsers.map((u) => {
												const isFriend = friendSet.has(u.id);
												return (
													<div key={u.id} className="mb-2 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2">
														<div className="min-w-0">
															<div className="flex items-center gap-2">
																<span className="h-2 w-2 rounded-full bg-gray-300" />
																<div className="text-sm font-bold truncate">{u.name}</div>
															</div>
															<div className="text-xs text-gray-600 truncate">{u.email}</div>
														</div>

														{isFriend ? (
															<button onClick={() => openDmWith(u.id)} className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-bold">
																DM
															</button>
														) : (
															<button
																onClick={() => sendFriendRequest(u.id)}
																className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-bold"
																disabled={!!sentRequests[u.id]}
																title={sentRequests[u.id] ? "Request sent" : "Send friend request"}
															>
																{sentRequests[u.id] ? "Requested" : "Add"}
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
							<div className="flex flex-col min-h-0 bg-white/60">
								<div className=" px-3 py-2 font-bold">{selectedTitle}</div>

								<div className="flex-1 overflow-auto border-1 rounded-[2rem] border-yellow-400/30 p-3">
									{loadingMsgs && <div className="text-gray-600">Loading messages…</div>}
									{!loadingMsgs && selectedId && messages.length === 0 && <div className="text-gray-600">No messages yet</div>}

									{messages.map((m) => {
										const mine = myUserId ? m.senderId === String(myUserId) : false;
										return (
											<div key={m.id} className={`mb-3 flex ${mine ? "justify-end" : "justify-start"}`}>
												<div
													className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm ${mine ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-900"
														}`}
												>
													<div className="mb-1 text-[11px] opacity-75">
														{(userMap[m.senderId]?.name || `User ${m.senderId}`)} · {new Date(m.createdAt).toLocaleString()}
													</div>
													<div className="whitespace-pre-wrap">{m.content}</div>
												</div>
											</div>
										);
									})}
								</div>

								<div className="px-4 py-3 flex items-center gap-2">	
									<input
										value={input}
										onChange={(e) => setInput(e.target.value)}
										placeholder="Type a message..."
										className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm outline-none text-gray-700 placeholder-gray-400"
										onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
									/>		
									<button
										onClick={sendMessage}
										className="flex-shrink-0 h-14 w-14 border rounded-full bg-black/80 flex items-center justify-center
													text-white  hover:bg-yellow-400/50 transition-all cursor-pointer">
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