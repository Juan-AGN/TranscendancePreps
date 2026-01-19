import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from "react";

let address = window.location.host;
let noport = "";

if (address.includes(":"))
	noport = address.split(":")[0];

const wsbase = `ws://${noport}:8888`;
const apiBase = `http://${noport}:8888`;

export const useInputEvent = () => {
  const [key, setKey] = useState(null);
  useEffect(() => {
    const keyDownHandler = ({ code }) => setKey(code);
    const keyUpHandler = () => setKey(null);
    global.addEventListener('keydown', keyDownHandler);
    global.addEventListener('keyup', keyUpHandler);
    return () => {
      global.removeEventListener("keydown", keyDownHandler);
      global.removeEventListener("keyup", keyUpHandler)
    }
  }, []);
  return key;
}

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

	return (content);
}

function Res({ result }) {
	return (<p>{result}</p>);
}

function Roulx({ rules }) {
	return (<p>{rules}</p>);
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

	return (content);
}

function Ruleset({ Crules, setCrules, changeRules }) {
	const handleChange = (e) => {
		const { name, value } = e.target;

		setCrules(prev => ({
			...prev,
			[name]: Number(value),
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		changeRules();
	};

	return (
		<form onSubmit={handleSubmit}>
			<p>Ball cooldown</p>
			<input
				name="waitingnewball"
				value={Crules.waitingnewball}
				onChange={handleChange}
			/>

			<p>Max X</p>
			<input
				name="maxx"
				value={Crules.maxx}
				onChange={handleChange}
			/>

			<p>Max Y</p>
			<input
				name="maxy"
				value={Crules.maxy}
				onChange={handleChange}
			/>

			<p>Ball hitbox</p>
			<input
				name="ballhitbox"
				value={Crules.ballhitbox}
				onChange={handleChange}
			/>

			<p>Player hitbox</p>
			<input
				name="playerhitbox"
				value={Crules.playerhitbox}
				onChange={handleChange}
			/>

			<p>Ball speed</p>
			<input
				name="ballspeed"
				value={Crules.ballspeed}
				onChange={handleChange}
			/>

			<p>Player speed</p>
			<input
				name="playerspeed"
				value={Crules.playerspeed}
				onChange={handleChange}
			/>

			<p>Speed random</p>
			<input
				name="speedrandom"
				value={Crules.speedrandom}
				onChange={handleChange}
			/>

			<p>Hitbox random</p>
			<input
				name="hitboxrandom"
				value={Crules.hitboxrandom}
				onChange={handleChange}
			/>

			<button type="submit">Apply Rules</button>
		</form>
	);
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
	const [game, setGame] = useState("");
	const [clobby, setClobby] = useState("");
	const [user, setUser] = useState("");
	const [sizex, setSizex] = useState("1000");
	const [sizey, setSizey] = useState("1000");
	const [ws, setWs] = useState(null);
	const [notification, setNotification] = useState([]);
	const [response, setResponse] = useState("");
	const [gameState, setGameState] = useState(null);
	const [result, setResults] = useState("");
	const [rules, setRules] = useState("");
	const clobbyRef = useRef(clobby);
	const sizexRef = useRef(sizex);
	const sizeyRef = useRef(sizey);
	const userRef = useRef(user);
	const canvasRef = useRef(null);

	const [Crules, setCrules] = useState({
		waitingnewball: 5000,
		maxx: 1000,
		maxy: 750,
		ballhitbox: 50,
		playerhitbox: 90,
		ballspeed: 10,
		playerspeed: 10,
		speedrandom: 10,
		hitboxrandom: 0,
	});


	useEffect(() => {
    	if (!gameState) return;
    		drawgame(gameState);
	}, [gameState]);

	useEffect(() => {
		clobbyRef.current = clobby;
	}, [clobby]);

	useEffect(() => {
		sizexRef.current = sizex;
	}, [sizex]);

	useEffect(() => {
		sizeyRef.current = sizey;
	}, [sizey]);

	useEffect(() => {
		userRef.current = user;
	}, [user]);

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

	function drawgame(msg) {
		const c = canvasRef.current;
 		if (!c) return;
    	const ctx = c.getContext("2d");
    	if (!ctx) return;
	
		ctx.clearRect(0, 0, sizexRef.current, sizeyRef.current);
		ctx.moveTo(0,0);
		ctx.lineTo(sizexRef.current, 0);
		ctx.lineTo(sizexRef.current, sizeyRef.current);
		ctx.lineTo(0, sizeyRef.current);
		ctx.moveTo(0,0);
		ctx.fill();

		for (let player of msg.game.alive)
		{
			ctx.beginPath();
			ctx.strokeStyle = "blue";
			ctx.fillStyle = "purple";
			ctx.arc(player.x, player.y, player.hitbox / 2, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
			if (player.player == userRef.current)
			{
				ctx.beginPath();
				ctx.strokeStyle = "blue";
				ctx.fillStyle = "blue";
				ctx.arc(player.x, player.y, player.hitbox / 2, 0, 2 * Math.PI);
				ctx.arc(player.x, player.y, player.hitbox / 3, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.beginPath();
				ctx.arc(player.x, player.y, player.hitbox / 3, 0, 2 * Math.PI);
				ctx.fill();
				ctx.stroke();
			}
		}
		for (let ball of msg.game.ball)
		{
			ctx.beginPath();
			ctx.fillStyle = "red";
			ctx.strokeStyle = "grey";
			ctx.arc(ball.x, ball.y, ball.hitbox / 2, 0, 2 * Math.PI);
			ctx.fill();
			ctx.stroke();
		}
		ctx.fillStyle= "black";
		ctx.strockeStyle = "black";
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
			setGame("");
			listLobbies();
		}
		catch (error)
		{
			console.log(error);
		}
	}

	async function changeRules() {
		try {
			const res = await fetch(`${apiBase}/lobbies/ruleset`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ lobbyId: clobby, hostId: user, ruleset: Crules })
			});
			if (!res.ok) {
    			const text = await res.text();
    			throw new Error(`HTTP ${res.status}: ${text}`);
    		}
			const data = await res.json();
			setRules(JSON.stringify(data, null, 2));
		}
		catch (error)
		{
			console.log(error);
		}
	}

	async function startGame() {
		try {
			const res = await fetch(`${apiBase}/lobbies/start`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ lobbyId: clobby, hostId: user })
			});
			const data = await res.json();
			setNotification(prev => [...prev, `${data.message}`]);
			setTimeout(() => {
				setNotification(prev => prev.slice(1));
			}, 4000);
		}
		catch (error)
		{
			console.log(error);
		}
	}

	/*
	function Game({ ws }) {
		useEffect(() => {
			const handleKeyDown = (e) => {
    			switch (e.key.toUpperCase()) {
    				case "W":
    					ws?.send("W");
    					break;
    				case "A":
    					ws?.send("A");
    					break;
    				case "S":
    					ws?.send("S");
      					break;
    				case "D":
        				ws?.send("D");
						break;
				}
			};

  			document.addEventListener('keydown', handleKeyDown);
  			return () => {
				window.removeEventListener("keydown", handleKeyDown);
			};
		}, [ws]);
	}*/

	function UseControlls() {
		const key = useInputEvent();

		useEffect(() => {
			console.log(key);
    		switch (key) {
    			case "KeyW":
    				ws?.send("W");
    				break;
    			case "KeyA":
    				ws?.send("A");
    				break;
    			case "KeyS":
    				ws?.send("S");
    				break;
    			case "KeyD":
       				ws?.send("D");
					break;
			}
		}, [ws][key]);
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
			if (msg.type == "GAMESTATE")
			{
				setGame(msg.context);
				if (msg.game.borderx != sizexRef.current)
					setSizex(msg.game.borderx);
				if (msg.game.bordery != sizeyRef.current)
					setSizey(msg.game.bordery);
				setGameState(msg);
			}
			if (msg.type == "GAMERESULT")
			{
				setGame("");
				isinlobby();
				setResults(JSON.stringify(msg.results, null, 2));
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
		{result &&
			<div>
				<h2>Last results:</h2>
				<Res result={result}/>
			</div>
		}
		{!game && (<>
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
				<button onClick={startGame}>Start Game</button>
				<h2>Response</h2>
				<Lobby response={response} setResponse={setResponse}/>
				<h2>Rules stuff</h2>
				<Roulx rules={rules}/>
				<Ruleset Crules={Crules} setCrules={setCrules} changeRules={changeRules}/>
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
		</>)}
		{game &&
			<div>
				<button onClick={leaveLobby}>Leave Lobby</button>
    			<canvas ref={canvasRef} width={Number(sizex)} height={Number(sizey)}/>
				<UseControlls/>
			</div>
		}
		</div>
	);
}
//<Game ws={ws}/>

export default App;
