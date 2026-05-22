import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n'
import { NotificationProvider } from './notifications'
import { LobbyProvider } from './lobby';
import { WsProvider } from './wshandler'
import { Handler } from './game_endpoints/lobbies.tsx'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
		<NotificationProvider>
			<LobbyProvider>
				<WsProvider>
					<Handler/>
				</WsProvider>
			</LobbyProvider>
		</NotificationProvider>
		</BrowserRouter>
	</StrictMode>,
)