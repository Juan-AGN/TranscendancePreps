//REMOTEGAME.TSX
import { NotificationProvider } from './notifications.tsx'
import { LobbyProvider } from './lobby.tsx';
import { WsProvider } from './wshandler.tsx'
import { Handler } from './game_endpoints/lobbies.tsx'
import './../../assets/styles/notifications.css'

export function RemoteGame() {
	return(  
		<NotificationProvider>
			<LobbyProvider>
				<WsProvider>
					<Handler/>
				</WsProvider>
			</LobbyProvider>
		</NotificationProvider>
	)
}