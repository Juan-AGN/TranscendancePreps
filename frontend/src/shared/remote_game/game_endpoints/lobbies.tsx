let address = window.location.host;
let noport = "";

if (address.includes(":"))
	noport = address.split(":")[0];

import { useNotification } from '../notifications';
import { useEffect, useState } from "react";
import type { Lobbys, Lobby, Ruleset } from "../types/types"
import { changeErrors } from "../types/types"
const apiBase = `https://${noport}:8889/api/game`;
import { useLobby } from '../lobby';
import { Doubledivgame, Doubledivvert, TextField } from '../commoncomp/commoncomp';
import { useWs } from '../wshandler';

async function listLobbies() {
	try {
		const res = await fetch(`${apiBase}/lobbies`);
		if (!res.ok)
			return (null);
		const data = await res.json();
		return (data);
	}
	catch {
		return (null);
	}
}

async function joinlobby(which: string, handleApiError: (msg: any) => void, addLobby: (id: Lobby | null) => void) {
	const token = localStorage.getItem("token");

	try {
		const res = await fetch(`${apiBase}/lobbies/join`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ "lobbyId": `${which}` }),
		});
		const data = await res.json();
		if (!res.ok) {
			handleApiError(data.message ?? data.error);
			return (null);
		}
		addLobby(data);
		return (data);
	}
	catch (err) {
		handleApiError(err);
		return;
	}
}

async function startgame(which: string, handleApiError: (msg: any) => void) {
	const token = localStorage.getItem("token");

	try {
		const res = await fetch(`${apiBase}/lobbies/start`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ "lobbyId": `${which}` }),
		});
		const data = await res.json();
		if (!res.ok)
			handleApiError(data.message ?? data.error);

		return;
	}
	catch (err) {
		handleApiError(err);
		return;
	}
}

async function fetchrules(which: string, handleApiError: (msg: any) => void, rules: Ruleset) {
	const token = localStorage.getItem("token");

	try {
		const res = await fetch(`${apiBase}/lobbies/ruleset`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ "lobbyId": `${which}`, "ruleset": rules }),
		});
		const data = await res.json();
		if (!res.ok)
			handleApiError(data.message ?? data.error);

		const failedStatus = Object.values(data.status).find(
			(status) =>
				status !== changeErrors.SUCCESS &&
				status !== changeErrors.NOCHANGE
		);
		if (failedStatus) {
			handleApiError(data.message ?? data.error);
			return;
		}

		return;
	}
	catch (err) {
		handleApiError(err);
		return;
	}
}

async function createlobby(which: string, handleApiError: (msg: any) => void, addLobby: (id: Lobby | null) => void) {
	const token = localStorage.getItem("token");

	try {
		const res = await fetch(`${apiBase}/lobbies/create`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ "lobbyId": `${which}` }),
		});
		const data = await res.json();
		if (!res.ok) {
			handleApiError(data.message ?? data.error);
			return;
		}

		addLobby(data);
		return (data);
	}
	catch (err) {
		handleApiError(err);
		return;
	}
}

export async function leavelobby(which: string, handleApiError: (msg: any) => void, addLobby: (id: Lobby | null) => void) {
	const token = localStorage.getItem("token");

	try {
		const res = await fetch(`${apiBase}/lobbies/leave`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ "lobbyId": `${which}` }),
		});
		const data = await res.json();
		if (!res.ok) {
			handleApiError(data.message ?? data.error);
			return;
		}

		addLobby(null);
		return;
	}
	catch (err) {
		handleApiError(err);
		return;
	}
}

async function changetopectator(handleApiError: (msg: any) => void, tlobby: Lobby | null) {
	const token = localStorage.getItem("token");

	if (!tlobby)
		return;

	try {
		const res = await fetch(`${apiBase}/lobbies/change/player`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ "lobbyId": `${tlobby.id}` }),
		});
		const data = await res.json();
		if (!res.ok)
			handleApiError(data.message ?? data.error);

		return;
	}
	catch (err) {
		handleApiError(err);
		return;
	}
}

async function changetoplay(handleApiError: (msg: any) => void, tlobby: Lobby | null) {
	const token = localStorage.getItem("token");

	if (!tlobby)
		return;

	try {
		const res = await fetch(`${apiBase}/lobbies/change/spectator`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ "lobbyId": `${tlobby.id}` }),
		});
		const data = await res.json();
		if (!res.ok)
			handleApiError(data.message ?? data.error);

		return;
	}
	catch (err) {
		handleApiError(err);
		return;
	}
}

export function MiniLobby({ lobbyItem }: { lobbyItem: Lobby }) {
	const { names, addLobby } = useLobby();
	const [name, setName] = useState(`User ${lobbyItem.hostId}`);
	const { handleApiError } = useNotification();
	const lobbyx = lobbyItem.id;

	useEffect(() => {
		names.checknameupdate(lobbyItem.hostId).then(setName);
	}, [lobbyItem.hostId, names]);

	const joinlobbyx = () => {
		joinlobby(lobbyx, handleApiError, addLobby);
	};

	return (
		<button
			type="button"
			onClick={joinlobbyx}
			className="group relative w-full overflow-hidden rounded-xl border border-yellow-500/35 bg-white/60
			p-5 text-left backdrop-blur-sm transition duration-300
			hover:-translate-y-1 hover:border-yellow-500/60 hover:bg-white/70 active:scale-[0.98]">
			<div className="relative z-10 flex items-start gap-4">
				<div
					className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-yellow-500/35 bg-white/55
					text-lg font-black text-yellow-800 transition group-hover:scale-105 ">
					{lobbyItem.id.slice(0, 2).toUpperCase()}
				</div>

				<div className="min-w-0 flex-1">
					<h2 className="truncate text-lg font-black tracking-wide text-yellow-950">
						Lobby {lobbyItem.id}
					</h2>

					<p className="mt-1 truncate text-sm font-medium text-yellow-800/75">
						Host: {name}
					</p>
				</div>

				<div className="rounded-full border border-emerald-300/50 bg-emerald-100/80 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-emerald-700">
					Open
				</div>
			</div>

			<div className="relative z-10 mt-5 grid grid-cols-2 gap-3">
				<div className="rounded-full border border-yellow-500/25 bg-white/45 px-4 py-2 text-sm font-medium text-yellow-900">
					<span className="mr-2 text-yellow-700">♟</span>
					Players: {lobbyItem.players.length}
				</div>

				<div className="rounded-full border border-yellow-500/25 bg-white/45 px-4 py-2 text-sm font-medium text-yellow-900">
					<span className="mr-2 text-yellow-700">◉</span>
					Spectators: {lobbyItem.spectators.length}
				</div>
			</div>

			<div className="relative z-10 mt-4 inline-flex items-center rounded-full border border-yellow-500/25 bg-white/45 px-4 py-2 text-sm font-bold text-yellow-900">
				<span className="mr-2 text-yellow-700">◷</span>
				{lobbyItem.status}
			</div>
		</button>
	);

}
export function Lobbies() {
	const [response, setResponse] = useState<Lobbys | null>(null);

	useEffect(() => {
		async function searchforlobbies() {
			setResponse(await listLobbies());
		}

		searchforlobbies();

		const interval = setInterval(() => {
			searchforlobbies();
		}, 5000);

		return () => clearInterval(interval);
	}, []);

	if (!response) {
		return (
			<div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
				<p className="text-sm text-slate-500">
					Unable to reach lobbies, try again later!
				</p>
			</div>
		);
	}

	return (
		<div className="relative z-10 flex h-full w-full flex-col items-center px-6 py-8 text-yellow-900">

			<div className="mb-8 text-center">
				<h1
					className="text-3xl font-black tracking-[0.45em] text-yellow-900 drop-shadow-sm sm:text-4xl">
					LOBBIES
				</h1>

				<p className="mt-3 text-sm font-medium text-yellow-800/80 sm:text-base">
					Choose a room to join or create a new one below.
				</p>
			</div>

			{!response.all || response.all.length === 0 ? (
				<div className="flex flex-1 items-center justify-center text-center">
					<div
						className=" rounded-full border border-yellow-500/25 bg-white/50 px-7 py-3 text-sm font-medium text-yellow-900/65 backdrop-blur-sm">
						No lobbies available
					</div>
				</div>
			) : (
				<div
					className="grid w-full max-w-4xl grid-cols-1 gap-5 overflow-y-auto px-2 pb-4 sm:grid-cols-2">
					{response.all.map((lobbyItem: Lobby) => (
						<MiniLobby lobbyItem={lobbyItem} key={lobbyItem.id} />
					))}
				</div>
			)}
		</div>
	);

}

export function MiniUser({ user }: { user: number }) {
	const { names, lobby } = useLobby();
	const [username, setUsername] = useState(`User ${user}`);
	const [img, setImg] = useState("");

	async function updtusername() {
		setUsername(await names.checknameupdate(user));
	}

	async function updtimg() {
		setImg(await names.checkimgupdate(user));
	}

	useEffect(() => {
		updtusername();
		updtimg();
	}, [lobby]);

	return (
		<div
			className="flex w-full items-center gap-3 rounded-full border border-yellow-500/30 bg-white/55
				px-4 py-3 text-yellow-950 backdrop-blur-sm">
			{img && img !== "" ? (
				<img
					className="h-10 w-10 rounded-full object-cover border border-yellow-500/25"
					src={img}
				/>
			) : (
				<div className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow-500/25 bg-white/60 text-yellow-700">
					◉
				</div>
			)}

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-bold">{username}</p>
				<p className="text-xs text-yellow-800/65">Player</p>
			</div>
		</div>
	);

}

export function Minimini({ user }: { user: number }) {
	const { names, lobby } = useLobby();
	const [username, setUsername] = useState(`User ${user}`);
	const [img, setImg] = useState("");

	async function updtusername() {
		setUsername(await names.checknameupdate(user));
	}

	async function updtimg() {
		setImg(await names.checkimgupdate(user));
	}

	useEffect(() => {
		updtusername();
		updtimg();
	}, [lobby]);

	return (
		<div
			className="flex w-fit items-center gap-2 rounded-full border border-yellow-500/25 bg-white/45 px-3 py-2
				text-yellow-900 backdrop-blur-smwhitespace-nowrap">
			{img && img !== "" ? (
				<img
					className="h-8 w-8 rounded-full object-cover border border-yellow-500/25"
					src={img}
				/>
			) : (
				<div className="flex h-8 w-8 items-center justify-center rounded-full border border-yellow-500/25 bg-white/60 text-yellow-700 text-xs">
					◉
				</div>
			)}
			<span className="text-sm font-medium">{username}</span>
		</div>
	);

}

type ResProps = {
	place: number;
	user: number;
};

export function Placement({ place, user }: ResProps) {
	const { result } = useWs();
	const [username, setUsername] = useState(`User ${result?.first}`);
	const [img, setImg] = useState("");
	const { names } = useLobby();
	const [colors, setColors] = useState("bg-linear-to-r from-amber-200 to-amber-300");

	async function updtusername() {
		setUsername(await names.checknameupdate(user));
	}

	async function updtimg() {
		setImg(await names.checkimgupdate(user));
	}

	useEffect(() => {
		updtusername();
		updtimg();
		if (place === 1)
			setColors("bg-linear-to-r from-amber-200 to-amber-300");
		else if (place === 2)
			setColors("bg-linear-to-r from-mist-200 to-mist-300");
		else if (place === 3)
			setColors("bg-linear-to-r from-orange-200 to-orange-300");
		else if (place === 4)
			setColors("bg-linear-to-r from-stone-400 to-stone-500");
	});

	if (img && img != "")
		return (<div className={`text-center bg-linear-to-r ${colors} w-fit m-2 p-2 rounded-2xl shadow flex h-10 flex-nowrap whitespace-nowrap justify-center items-center content-center`}><p>{place}º </p><img className="rounded-3xl h-[80%] aspect-square m-2" src={img}></img> {username}</div>);
	else
		return (<div className={`text-center bg-linear-to-r ${colors} w-fit m-2 p-2 rounded-2xl shadow flex h-10 flex-nowrap whitespace-nowrap justify-center items-center content-center`}><p className="m-2">{place}º </p>{username}</div>);
}

export function ShowResults() {
	const { result } = useWs();

	return (<div className="flex align-middle justify-center overflow-x-auto">
		<Placement place={1} user={result!.first} />
		<Placement place={2} user={result!.second} />
		{result?.third && result.third !== -1 &&
			<Placement place={3} user={result!.third} />
		}
		{result?.fourth && result.fourth !== -1 &&
			<Placement place={4} user={result!.fourth} />
		}
	</div>)
}

type RulesStateProps = {
	rulesm: number;
	setRulesm: (n: number) => void;
};

type ControlBarProps = {
	setRulesm: (n: number) => void;
};

export function SingLobby({ rulesm, setRulesm }: RulesStateProps) {
	const { result } = useWs();
	const { names, lobby } = useLobby();
	const [host, setHost] = useState(`User ${lobby!.hostId}`);

	async function updthost() {
		setHost(await names.checknameupdate(lobby!.hostId));
	}

	useEffect(() => {
		if (lobby)
			updthost();
	}, [lobby]);

	if (!lobby) {
		return (
			<div className="flex h-full w-full items-center justify-center text-yellow-900">
				Lobby needed
			</div>
		);
	}

	return (
		<div className="flex h-full w-full flex-col gap-6 overflow-auto px-8 py-8 text-yellow-950">

			{rulesm === 1 && <SettingsMenu setRulesm={setRulesm} />}
			{rulesm === 2 && <OnlyRules setRulesm={setRulesm} />}

			{rulesm === 0 && (
				<>

					{result && (
						<div className="rounded-[1.5rem] border border-yellow-500/25 bg-white/35 px-6 py-5">
							<p className="mb-4 text-sm font-black tracking-[0.25em] text-yellow-800 uppercase">
								Last Game Results
							</p>
							<ShowResults />
						</div>
					)}

					<div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
						<div className="rounded-[1.5rem] border border-yellow-500/25 bg-white/35 px-5 py-4">
							<p className="text-xs uppercase tracking-[0.22em] text-yellow-700/70">Lobby</p>
							<p className="mt-2 text-xl font-black">{lobby.id}</p>
						</div>

						<div className="rounded-[1.5rem] border border-yellow-500/25 bg-white/35 px-5 py-4">
							<p className="text-xs uppercase tracking-[0.22em] text-yellow-700/70">Owner</p>
							<p className="mt-2 text-xl font-bold">{host}</p>
						</div>

						<div className="rounded-[1.5rem] border border-yellow-500/25 bg-white/35 px-5 py-4">
							<p className="text-xs uppercase tracking-[0.22em] text-yellow-700/70">Players</p>
							<p className="mt-2 text-xl font-black">{lobby.players.length}</p>
						</div>

						<div className="rounded-[1.5rem] border border-yellow-500/25 bg-white/35 px-5 py-4">
							<p className="text-xs uppercase tracking-[0.22em] text-yellow-700/70">Spectators</p>
							<p className="mt-2 text-xl font-black">{lobby.spectators.length}</p>
						</div>
					</div>

					<div className="rounded-[1.5rem] border border-yellow-500/25 bg-white/35 px-6 py-5">
						<p className="mb-4 text-sm font-black tracking-[0.25em] text-yellow-800 uppercase">
							Players
						</p>

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
							{lobby.players.map((user: number) => (
								<MiniUser user={user} key={user} />
							))}
						</div>
					</div>

					{lobby.spectators.length > 0 && (
						<div className="rounded-[1.5rem] border border-yellow-500/25 bg-white/35 px-6 py-5">
							<p className="mb-4 text-sm font-black tracking-[0.25em] text-yellow-800 uppercase">
								Spectators
							</p>

							<div className="flex flex-wrap gap-3">
								{lobby.spectators.map((user: number) => (
									<Minimini user={user} key={user} />
								))}
							</div>
						</div>
					)}

				</>
			)}
		</div>
	);

}

type SettingsProps = {
	setRulesm: (n: number) => void;
};

const limits = {
	waitingnewball: { min: 500, max: 100000 },
	maxx: { min: 600, max: 2000 },
	maxy: { min: 600, max: 2000 },
	ballhitbox: { min: 5, max: 200 },
	playerhitbox: { min: 30, max: 300 },
	ballspeed: { min: 1, max: 30 },
	playerspeed: { min: 1, max: 20 },
	speedrandom: { min: 0, max: 15 },
	hitboxrandom: { min: 0, max: 100 },
	maxballs: { min: 0, max: 999 },
};

export function RulesSetter({
	rules,
	setRules,
}: {
	rules: Ruleset;
	setRules: React.Dispatch<React.SetStateAction<Ruleset>>;
}) {
	const handleChange = (
		key: keyof Ruleset,
		value: number
	) => {
		setRules((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const ruleList = [
		{ key: "waitingnewball", label: "Time for new ball" },
		{ key: "ballspeed", label: "Ball speed" },
		{ key: "playerhitbox", label: "Player hitbox" },
		{ key: "playerspeed", label: "Player speed" },
		{ key: "ballhitbox", label: "Ball hitbox" },
		{ key: "hitboxrandom", label: "Ball hitbox modifier" },
		{ key: "speedrandom", label: "Ball speed modifier" },
		{ key: "maxx", label: "Border X" },
		{ key: "maxy", label: "Border Y" },
		{ key: "maxballs", label: "Max nº of balls (0 for infinite)" },
	] as const;

	return (
		<div className="flex max-h-[44vh] w-full flex-col items-center justify-start overflow-y-auto pr-1">
			{ruleList.map((rule) => (
				<div
					key={rule.key}
					className="bg-linear-to-r from-mist-400 to-mist-500  w-[90%] rounded-xl p-2 mb-1 flex flex-col"
				>
					<div className="flex justify-between text-xs mb-1">
						<span>{rule.label}</span>
						<span>{rules[rule.key]}</span>
					</div>

					<input
						type="range"
						min={limits[rule.key].min}
						max={limits[rule.key].max}
						value={rules[rule.key]}
						onChange={(e) =>
							handleChange(rule.key, Number(e.target.value))
						}
						className="w-full"
					/>
				</div>
			))}
		</div>
	);
}

export function Crules() {
	const { lobby } = useLobby();
	if (!lobby)
		return null;

	const rules = lobby.rules;
	const maxBalls = rules.maxballs === 0 ? "Infinite" : `${rules.maxballs}`;
	const collision = rules.collision ? "Enabled" : "Disabled";

	const rows = [
		{ label: "Time for new ball", value: `${rules.waitingnewball} ms` },
		{ label: "Ball speed", value: `${rules.ballspeed}` },
		{ label: "Player collision", value: collision },
		{ label: "Player hitbox", value: `${rules.playerhitbox}` },
		{ label: "Player speed", value: `${rules.playerspeed}` },
		{ label: "Ball hitbox", value: `${rules.ballhitbox}` },
		{ label: "Hitbox modifier", value: `${rules.hitboxrandom}` },
		{ label: "Speed modifier", value: `${rules.speedrandom}` },
		{ label: "Border X", value: `${rules.maxx}` },
		{ label: "Border Y", value: `${rules.maxy}` },
		{ label: "Max balls", value: maxBalls },
	];

	return (
		<div className="w-full rounded-[1.2rem] border border-yellow-500/20 bg-white/45 p-4 shadow-[0_10px_35px_rgba(90,60,20,0.12)]">
			<div className="mb-3 flex items-center justify-between">
				<p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-800/70">
					Current Rules
				</p>
				<span className="rounded-full border border-yellow-500/25 bg-white/70 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-yellow-800">
					Live
				</span>
			</div>

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{rows.map((row) => (
					<div key={row.label} className="rounded-xl border border-yellow-500/18 bg-gradient-to-r from-white/80 to-yellow-50/55 px-3 py-2 text-left">
						<p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-yellow-800/70">{row.label}</p>
						<p className="mt-1 text-sm font-black text-yellow-950">{row.value}</p>
					</div>
				))}
			</div>
		</div>
	)
}

export function Prerules({ srules }: { srules: Ruleset }) {
	const maxBalls = srules.maxballs === 0 ? "Infinite" : `${srules.maxballs}`;
	const collision = srules.collision ? "Enabled" : "Disabled";

	const rows = [
		{ label: "Time for new ball", value: `${srules.waitingnewball} ms` },
		{ label: "Ball speed", value: `${srules.ballspeed}` },
		{ label: "Player collision", value: collision },
		{ label: "Player hitbox", value: `${srules.playerhitbox}` },
		{ label: "Player speed", value: `${srules.playerspeed}` },
		{ label: "Ball hitbox", value: `${srules.ballhitbox}` },
		{ label: "Hitbox modifier", value: `${srules.hitboxrandom}` },
		{ label: "Speed modifier", value: `${srules.speedrandom}` },
		{ label: "Border X", value: `${srules.maxx}` },
		{ label: "Border Y", value: `${srules.maxy}` },
		{ label: "Max balls", value: maxBalls },
	];

	return (
		<div className="w-full rounded-[1.2rem] border border-cyan-400/25 bg-cyan-50/35 p-4 shadow-[0_10px_35px_rgba(35,87,111,0.10)]">
			<div className="mb-3 flex items-center justify-between">
				<p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-900/75">
					Preview Rules
				</p>
				<span className="rounded-full border border-cyan-500/25 bg-white/70 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.18em] text-cyan-800">
					Template
				</span>
			</div>

			<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
				{rows.map((row) => (
					<div key={row.label} className="rounded-xl border border-cyan-500/18 bg-gradient-to-r from-white/80 to-cyan-50/50 px-3 py-2 text-left">
						<p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-cyan-900/65">{row.label}</p>
						<p className="mt-1 text-sm font-black text-cyan-950">{row.value}</p>
					</div>
				))}
			</div>
		</div>
	)
}

const defaultrules: Ruleset = {
	waitingnewball: 5000,
	maxx: 1000,
	maxy: 750,
	ballhitbox: 50,
	playerhitbox: 90,
	ballspeed: 10,
	playerspeed: 10,
	speedrandom: 10,
	hitboxrandom: 0,
	maxballs: 0,
	collision: true,
}

const bullethell: Ruleset = {
	waitingnewball: 500,
	maxx: 800,
	maxy: 800,
	ballhitbox: 5,
	playerhitbox: 60,
	ballspeed: 1,
	playerspeed: 10,
	speedrandom: 0,
	hitboxrandom: 10,
	maxballs: 0,
	collision: true,
}

const macrobullethell: Ruleset = {
	waitingnewball: 500,
	maxx: 2000,
	maxy: 2000,
	ballhitbox: 5,
	playerhitbox: 90,
	ballspeed: 1,
	playerspeed: 10,
	speedrandom: 0,
	hitboxrandom: 10,
	maxballs: 0,
	collision: true,
}

const closequarters: Ruleset = {
	waitingnewball: 5000,
	maxx: 600,
	maxy: 600,
	ballhitbox: 40,
	playerhitbox: 40,
	ballspeed: 5,
	playerspeed: 10,
	speedrandom: 5,
	hitboxrandom: 10,
	maxballs: 0,
	collision: true,
}

const lopghall: Ruleset = {
	waitingnewball: 4000,
	maxx: 2000,
	maxy: 600,
	ballhitbox: 90,
	playerhitbox: 90,
	ballspeed: 15,
	playerspeed: 15,
	speedrandom: 10,
	hitboxrandom: 30,
	maxballs: 0,
	collision: true,
}

const giantball: Ruleset = {
	waitingnewball: 3000,
	maxx: 2000,
	maxy: 1800,
	ballhitbox: 200,
	playerhitbox: 100,
	ballspeed: 3,
	playerspeed: 10,
	speedrandom: 10,
	hitboxrandom: 100,
	maxballs: 0,
	collision: true,
}

export function SettingsMenu({ setRulesm }: SettingsProps) {
	const { handleApiError } = useNotification();
	const { lobby } = useLobby();

	const [nrules, setNrules] = useState(lobby!.rules);
	const [nshow, setNshow] = useState(0);

	function closethebox() {
		setRulesm(0);
	}

	function sendrules() {
		fetchrules(lobby!.id, handleApiError, nrules);
	}

	function applyDefaultRules() {
		setNrules(defaultrules);
		setNshow(1);
	}

	const handleChange = (value: string) => {
		if (value === "custom") {
			setNshow(0);
			return;
		}
		else if (value === "default")
			setNrules(defaultrules);
		else if (value === "bullethell")
			setNrules(bullethell);
		else if (value === "mbullethell")
			setNrules(macrobullethell);
		else if (value === "closequarters")
			setNrules(closequarters);
		else if (value === "lopghall")
			setNrules(lopghall);
		else if (value === "giantball")
			setNrules(giantball);
		setNshow(1);
	}

	return (
		<div className="mt-3 w-full basis-full">
			<div className="relative mx-auto flex w-full max-w-6xl flex-col rounded-2xl border border-yellow-500/35 bg-white/60 p-4 shadow-2xl backdrop-blur-xl max-h-[62vh]">
				<button
					type="button"
					className="absolute right-3 top-3 h-9 w-9 rounded-full border border-yellow-500/35 bg-white/70 text-sm font-black text-yellow-900 transition hover:bg-white"
					onClick={closethebox}
				>
					X
				</button>

				<div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto pr-1 lg:grid-cols-2">
					<div className="flex min-h-0 flex-col items-center rounded-2xl border border-yellow-500/20 bg-white/40 p-3 text-center overflow-y-auto">
						<p><b>CHANGE RULES</b></p>
						{nshow !== 0 &&
							<Prerules srules={nrules} />
						}
						{nshow === 0 &&
							<RulesSetter rules={nrules} setRules={setNrules} />
						}
					</div>

					<div className="flex min-h-0 flex-col items-center rounded-2xl border border-yellow-500/20 bg-white/40 p-3 text-center overflow-y-auto">
						<p><b>CURRENT RULES</b></p>
						<Crules />
					</div>
				</div>

				<div className="mt-4 flex shrink-0 flex-wrap items-center justify-center gap-2 rounded-2xl border border-yellow-500/20 bg-white/35 p-3">
					<button
						type="button"
						className="h-10 min-w-[11.5rem] rounded-full border border-yellow-400/60 bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 px-5 text-xs font-black tracking-[0.16em] text-yellow-950 shadow-[0_10px_28px_rgba(171,128,38,0.28)] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.98]"
						onClick={sendrules}
					>
						SUBMIT RULES
					</button>

					<button
						type="button"
						className="h-10 min-w-[11.5rem] rounded-full border border-yellow-500/40 bg-gradient-to-r from-white/95 to-yellow-100 px-5 text-xs font-black tracking-[0.16em] text-yellow-900 shadow-[0_10px_28px_rgba(171,128,38,0.16)] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 active:scale-[0.98]"
						onClick={applyDefaultRules}
					>
						DEFAULT RULES
					</button>

					<select onChange={(e) => handleChange(e.currentTarget.value)} className="h-10 min-w-[14rem] rounded-full border border-yellow-500/40 bg-gradient-to-r from-white/95 to-yellow-100 px-4 text-xs font-semibold tracking-[0.06em] text-yellow-900 shadow-[0_8px_22px_rgba(171,128,38,0.16)] transition hover:brightness-105">
						<option value="custom">Custom sliders</option>
						<option value="custom">Custom rules</option>
						<option value="bullethell">Bullet hell</option>
						<option value="mbullethell">Macro bullet hell</option>
						<option value="closequarters">Close quarters</option>
						<option value="lopghall">Long hall</option>
						<option value="giantball">Giant ball</option>
					</select>
				</div>
			</div>
		</div>
	);
}

export function OnlyRules({ setRulesm }: SettingsProps) {
	function closethebox() {
		setRulesm(0);
	}

	return (
		<div className="mt-3 w-full basis-full">
			<div className="relative mx-auto w-full max-w-3xl rounded-2xl border border-yellow-500/35 bg-white/60 p-4 shadow-2xl backdrop-blur-xl max-h-[62vh] overflow-y-auto">
				<button
					type="button"
					className="absolute right-3 top-3 h-9 w-9 rounded-full border border-yellow-500/35 bg-white/70 text-sm font-black text-yellow-900 transition hover:bg-white"
					onClick={closethebox}
				>
					X
				</button>

				<div className="flex flex-col items-center rounded-2xl border border-yellow-500/20 bg-white/40 p-3 text-center">
					<p><b>CURRENT RULES</b></p>
					<Crules />
				</div>
			</div>
		</div>
	);
}

export function ControlBar({ setRulesm }: ControlBarProps) {
	const { names, lobby, addLobby } = useLobby();
	const [pos, setPos] = useState(-1);
	const { handleApiError } = useNotification();
	const [host, setHost] = useState(-1);

	async function openrulesm() {
		setRulesm(1);
	}

	async function openrulesmsee() {
		setRulesm(2);
	}

	function tospectchange() {
		setRulesm(0);
		changetopectator(handleApiError, lobby);
	}

	function toplaychange() {
		setRulesm(0);
		changetoplay(handleApiError, lobby);
	}

	function leavelob() {
		setRulesm(0);
		leavelobby(lobby!.id, handleApiError, addLobby);
	}

	function strtgame() {
		setRulesm(0);
		startgame(lobby!.id, handleApiError);
	}

	async function updthost() {
		setHost(await names.getme());
	}

	async function checkplaystate() {
		const me = await names.getme();
		const indexs = lobby?.spectators.indexOf(me);
		const indexp = lobby?.players.indexOf(me);

		if (indexp != undefined && indexp > -1)
			setPos(1);
		else if (indexs != undefined && indexs > -1)
			setPos(2);
		else
			setPos(-1);
	}

	useEffect(() => {
		checkplaystate();
		if (lobby)
			updthost();
	}, [lobby]);

	const btnClass =
		"w-[11.5rem] flex-none rounded-full border border-yellow-500/30 bg-white/55 px-4 py-3 text-center text-sm font-bold tracking-[0.18em] text-yellow-950 backdrop-blur-sm transition hover:bg-white/70 hover:border-yellow-500/50";

	const btnPrimary =
		"w-[11.5rem] flex-none rounded-full border border-yellow-400/50 bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 px-4 py-3 text-center text-sm font-black tracking-[0.18em] text-yellow-950 shadow-[0_8px_25px_rgba(217,170,40,0.25)] transition hover:brightness-105";

	const btnRed =
		"w-[11.5rem] flex-none rounded-full border border-red-300/50 bg-red-50/70 px-4 py-3 text-center text-sm font-bold tracking-[0.18em] text-red-700 transition hover:bg-red-100/80";

	return (
		<div className="relative flex h-full w-full flex-wrap items-center justify-center gap-3 overflow-visible p-1 text-xs">
			{(host === -1 || host === lobby!.hostId) && (
				<button type="button" className={btnPrimary} onClick={strtgame}>
					START GAME
				</button>
			)}

			<button
				type="button"
				className={btnClass}
				onClick={pos === 2 ? toplaychange : tospectchange}
			>
				{pos === 2 ? "TO PLAYER" : "TO SPECTATOR"}
			</button>

			{(host === -1 || host === lobby!.hostId) && (
				<button type="button" className={btnClass} onClick={openrulesm}>
					CHANGE RULES
				</button>
			)}

			{host !== -1 && host !== lobby!.hostId && (
				<button type="button" className={btnClass} onClick={openrulesmsee}>
					SEE RULES
				</button>
			)}

			<button type="button" className={btnRed} onClick={leavelob}>
				LEAVE
			</button>
		</div>
	);

}

function Lobcreator() {
	const [lobname, setLobname] = useState("");
	const { addNotification, handleApiError } = useNotification();
	const { addLobby } = useLobby();

	function creator() {
		if (lobname === "" || lobname.trim().length === 0 || lobname.length > 20) {
			addNotification("Bad lobby name input.");
			return;
		}

		createlobby(lobname, handleApiError, addLobby);
	}

	return (
		<div className="flex h-full w-full items-center justify-center">
			<TextField
				value={lobname}
				onChange={setLobname}
				text="CREATE"
				submit={creator}
			/>
		</div>
	);
}

export function Handler() {
	const { lobby } = useLobby();
	const [rulesm, setRulesm] = useState(0);

	const BigLobby = () => (
		<SingLobby rulesm={rulesm} setRulesm={setRulesm} />
	);

	const TopControls = () => (
		<ControlBar setRulesm={setRulesm} />
	);

	if (!lobby)
		return (<Doubledivvert ComponentBig={Lobbies} ComponentSmall={Lobcreator} />);
	else
		return (<Doubledivgame ComponentBig={BigLobby} ComponentSmall={TopControls} />)
}