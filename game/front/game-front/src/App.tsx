import './App.css'
import './css/base.css'

import { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { NotificationProvider, useNotification } from './notifications';
import { LobbyProvider, useLobby } from './lobby';
import { Lobbies } from './game_endpoints/lobbies';
import { Singledivgame, Doubledivgame, Doubledivvert } from './commoncomp/commoncomp';
import { div } from 'framer-motion/client';

let address = window.location.host;
let noport = "";

if (address.includes(":"))
	noport = address.split(":")[0];

const wsbase = `wss://${noport}:8889`;
const apiBase = `https://${noport}:8889`;

function App() {
	const { addNotification } = useNotification();
	const { addLobby, lobby } = useLobby();

	return (
		<>
			
		</>
	);
}

// <div className="  w-[75vw] h-[75vw] landscape:w-[75vh] landscape:h-[75vh] aspect-square bg-blue-800 z-10 pointer-events-auto"></div>    THIS WILL BE USED FOR THE CAMBAS

export default App;

