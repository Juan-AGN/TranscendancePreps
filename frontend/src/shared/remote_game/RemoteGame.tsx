//REMOTEGAME.TSX
import { NotificationProvider } from './notifications.tsx'
import { LobbyProvider } from './lobby.tsx';
import { WsProvider } from './wshandler.tsx'
import { Handler } from './game_endpoints/lobbies.tsx'
import './../../assets/styles/notifications.css'

export function RemoteGame() {
	return(  
		<div
			className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: "url('/images/BgBall.png')" }}
		>
			<NotificationProvider>
				<LobbyProvider>
					<WsProvider>
						<Handler/>
					</WsProvider>
				</LobbyProvider>
			</NotificationProvider>
		</div>
	)
}