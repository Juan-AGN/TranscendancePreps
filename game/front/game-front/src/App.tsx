import './App.css'
import './css/base.css'

import { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { NotificationProvider, useNotification } from './notifications';
import { LobbyProvider, useLobby } from './lobby';
import { Lobbies } from './game_endpoints/lobbies';

let address = window.location.host;
let noport = "";

if (address.includes(":"))
	noport = address.split(":")[0];

const wsbase = `wss://${noport}:8889`;
const apiBase = `https://${noport}:8889`;

export const useHeldKey = () => {
	const [heldKey, setHeldKey] = useState(null);

	useEffect(() => {
		const keyDownHandler = (e: any) => {
		// Only track the first press, ignore OS repeat
		if (e.repeat) return;
		if (["KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)) {
			setHeldKey(e.code);
		}
		};

		const keyUpHandler = (e: any) => {
		if (heldKey === e.code) {
			setHeldKey(null);
		}
		};

		window.addEventListener("keydown", keyDownHandler);
		window.addEventListener("keyup", keyUpHandler);

		return () => {
		window.removeEventListener("keydown", keyDownHandler);
		window.removeEventListener("keyup", keyUpHandler);
		};
	}, [heldKey]);

	return heldKey;
};

function App() {
	const { addNotification } = useNotification();
	const { lobby, addLobby } = useLobby();

	return (
		<>
			<p>{lobby}</p>
			<div className="fixed inset-0 flex items-center justify-center pointer-events-none">
				<div className="w-[75vw] h-[60vw] landscape:w-[75vw] landscape:h-[60vh] aspect-auto bg-mauve-400/10 backdrop-blur-2xl z-10 pointer-events-auto rounded-2xl m-4">
					<Lobbies/>
				</div> 
				<div className="w-[15vw] h-[60vw] landscape:w-[15vw] landscape:h-[60vh] aspect-auto bg-mauve-400/10 backdrop-blur-2xl z-10 pointer-events-auto rounded-2xl m-4">

				</div>
			</div>
		</>
	);
}

// <div className="  w-[75vw] h-[75vw] landscape:w-[75vh] landscape:h-[75vh] aspect-square bg-blue-800 z-10 pointer-events-auto"></div>    THIS WILL BE USED FOR THE CAMBAS

export default App;

