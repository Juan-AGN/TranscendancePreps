import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from "react";

let address = window.location.host;
let noport = "";

if (address.includes(":"))
	noport = address.split(":")[0];

const wsbase = `ws://${noport}:8888`;
const apiBase = `http://${noport}:8888`;

function Log({ user, setUser }) {
	let content;

	if (!user) {
		content = (
  			<form
    			onSubmit={(e) => {
      			e.preventDefault();
      			setUser(e.target.query.value);
    		}}>
    			<input name="query" placeholder="Enter user" />
    			<button type="submit">Set</button>
  			</form>
	);
	} else {
		content = <p>Current user: <strong>{user}</strong></p>;
	}

	return content;
}

function Lob({ lobby, setLobby }) {
	let content;

	if (!lobby) {
		content = (
  			<form
    			onSubmit={(e) => {
      			e.preventDefault();
      			setLobby(e.target.query.value);
    		}}>
    			<input name="query" placeholder="Enter lobby" />
    			<button type="submit">Set</button>
  			</form>
		);
	} else {
		content = (
			<div>
  				<form
    				onSubmit={(e) => {
      				e.preventDefault();
      				setLobby(e.target.query.value);
    			}}>
    				<input name="query" placeholder="Enter lobby" />
    				<button type="submit">Set</button>
  				</form>
				<div>Current lobby: {lobby}</div>
			</div>
		);
	}

	return content;
}

function Lobbyes({ response, setResponse }) {
	if (!response?.all)
		return (<p>No lobbies available</p>);

	return (
		<div id="lobbyes-box">
		{response.all.map((lobbyItem) => (
        	<div className="lobby" key={lobbyItem.id}>
        		<div><strong>Name:</strong> {lobbyItem.id}</div>
        		<div><strong>Host:</strong> {lobbyItem.hostId}</div>
        		<div><strong>Players:</strong> {lobbyItem.players.length}</div>
        		<div><strong>Spectators:</strong> {lobbyItem.spectators.length}</div>
        		<div><strong>Status:</strong> {lobbyItem.status}</div>
			</div>
		))}
    	</div>
	);
}

function Lobby({ response }) {
	return (
		<div id="players-box">
        	<div><strong>Name:</strong> {response.id}</div>
        	<div><strong>Host:</strong> {response.hostId}</div>
   			<div>
        	<strong>Players:</strong>
			<div id="players">
        	{response.players.map((p) => <div key={p} className="player">{p}</div>)}
      		</div>
			</div>
   			<div>
        	<strong>Spectators:</strong>
			<div className="spectators">
        	<p>{response.spectators.map((p) => `${p}     `)}</p>
			</div>
      		</div>
        	<div><strong>Status:</strong> {response.status}</div>
		</div>
	);
}

function App() {
	const [lobby, setLobby] = useState("");
	const [clobby, setClobby] = useState("");
	const [user, setUser] = useState("");
	const [ws, setWs] = useState(null);
	const [notification, setNotification] = useState([]);
	const [response, setResponse] = useState("");
	const clobbyRef = useRef(clobby);

	useEffect(() => {
		clobbyRef.current = clobby;
	}, [clobby]);

	function NotificationBox({notification}) {
		if (notification.length == 0)
			return (<></>);
		return (
		<div className="notification-box">
    		{notification.map((p, index) => (
        	<div key={index} className="notification">
          		{p}
        	</div>
      ))}
		</div>);
	}

	async function createLobby() {
		try {
				const res = await fetch(`${apiBase}/lobbies/create`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ lobbyId: lobby, hostId: user })
				});
				if 	(!res.ok) {
					const text = await res.text();
    				throw new Error(`HTTP ${res.status}: ${text}`);
    			}
				const data = await res.json();
				setClobby(data.id);
				setResponse(data);
			}
		catch (error)
		{
			console.log(error);
		}
	}

	async function stateLobby() {
		try {
			const res = await fetch(`${apiBase}/lobbies/checkout`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ lobbyId: clobbyRef.current, hostId: user })
			});
			if (!res.ok) {
				const text = await res.text();
    			throw new Error(`HTTP ${res.status}: ${text}`);
    		}
			const data = await res.json();
			setResponse(data);
		}
		catch (error)
		{
			console.log(error);
		}
	}

	async function isinlobby() {
		try {
			const res = await fetch(`${apiBase}/lobbies/checkout`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ lobbyId: "", hostId: user })
			});
			if (!res.ok) {
				const text = await res.text();
    			throw new Error(`HTTP ${res.status}: ${text}`);
    		}
			const data = await res.json();
			setLobby(data.id);
			setClobby(data.id);
			setResponse(data);
		}
		catch (error)
		{
			console.log(error);
		}
	}

	async function joinLobby() {
		try {
			const res = await fetch(`${apiBase}/lobbies/join`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ lobbyId: lobby, hostId: user  })
			});
			if (!res.ok) {
    			const text = await res.text();
    			throw new Error(`HTTP ${res.status}: ${text}`);
    		}
			const data = await res.json();
			setClobby(data.id);
			setResponse(data);
		}
		catch (error)
		{
			console.log(error);
		}
	}

	async function listLobbies() {
		const res = await fetch(`${apiBase}/lobbies`);
		const data = await res.json();
		setResponse(data);
	}

	async function leaveLobby() {
		try {
			const res = await fetch(`${apiBase}/lobbies/leave`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ lobbyId: clobby, hostId: user })
			});
			if (!res.ok) {
    			const text = await res.text();
    			throw new Error(`HTTP ${res.status}: ${text}`);
    		}
			const data = await res.json();
			setClobby("");
			listLobbies();
		}
		catch (error)
		{
			console.log(error);
		}
	}

	useEffect(() => {
    	if (!user) return;
	
    	const socket = new WebSocket(`${wsbase}?userId=${user}`);

    	socket.onopen = () => {
      		console.log("WebSocket connected as", user);

			isinlobby();
    	};

		socket.onmessage = (event) => {
			const msg = JSON.parse(event.data);

			if (msg.type == "LOBBYUPDATE")
			{
				if (msg.action == "LEAVE")
				{
					if (msg.user == user)
					{
						setClobby("")
						listLobbies();
						return ;
					}
				}
				console.log(`${msg.lobby} ${msg.user} ${msg.action}`)
				setNotification(prev => [...prev, `${msg.user} ${msg.action}`]);
				setTimeout(() => {
					setNotification(prev => prev.slice(1));
				}, 4000);
				stateLobby();
			}
		};

		socket.onclose = () => console.log("WebSocket disconnected");

		setWs(socket);

		return () => {
			socket.close();
		};
	}, [user]);


	useEffect(() => {
		listLobbies();
	}, [])

	return (
	<div>
		<NotificationBox notification={notification}/>
		<h1>Lobby Test</h1>

		<Log user={user} setUser={setUser}/>
		<Lob lobby={lobby} setLobby={setLobby}/>
		{user && lobby && !clobby &&
		
			<div>
				<h2>Create Lobby</h2>
				<button onClick={createLobby}>Create Lobby</button>
				<h2>Join Lobby</h2>
				<button onClick={joinLobby}>Join Lobby</button>
			</div>
		}
		{!clobby && (!user || !lobby) && <div>Set user and lobby to access all lobby functionality.</div> }
		{clobby ?
			<div>
				<h2>Leave Lobby</h2>
				<button onClick={leaveLobby}>Leave Lobby</button>

				<h2>Response</h2>
				<Lobby response={response} setResponse={setResponse}/>
			</div>
		:
			<div>
				<h2>List Lobbies</h2>
				<button onClick={listLobbies}>Refresh List</button>
				{response &&
					<div>
						<h2>Response</h2>
						<Lobbyes response={response} setResponse={setResponse}/>
					</div>
				}
			</div>
		}
	</div>
	);
}

export default App;
