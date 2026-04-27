import type React from 'react'
import arcadeBg from '../../../public/arcadebg5.png'

type BgProps = {
	children: React.ReactNode
	backButton?: React.ReactNode
	showGameHud?: boolean
	player1Name?: string
	player2Name?: string
	player1Score?: number
	player2Score?: number
}

export function ArcadeBgLayout({
	children,
	backButton,
	showGameHud = false,
	player1Name = 'PLAYER 1',
	player2Name = 'PLAYER 2',
	player1Score = 0,
	player2Score = 0
}: BgProps) {
	return (
		<div className="flex items-center justify-center h-full bg-black overflow-hidden w-full">
			<div className="relative h-full w-full max-w-[85rem]">
				<img
					src={arcadeBg}
					alt="Arcade"
					className="w-full h-full object-fill block"
				/>
				{/* Overlay posicionado relativo a la imagen real, no al contenedor */}
				<div className="absolute left-[8%] top-[21%] w-[85%] h-[60%] flex flex-col items-center justify-center overflow-auto">
					{children}
				</div>
				{/* Botón back: siempre top-right relativo a la imagen */}
				{backButton && (
					<div className="absolute top-[5%] right-[6%] z-10 font-['Press_Start_2P'] 
									hover:bg-black hover:text-white transition-colors text-yellow-400"
						style={{ fontSize: '2.5vmin' }}>
						{backButton}
					</div>
				)}
				{showGameHud && (
					<>
						<div className="absolute bottom-[8%] left-[25%] z-10 font-['Press_Start_2P'] text-yellow-400">
							<span>{player1Name}</span>
						</div>
						<div className="absolute bottom-[8%] right-[25%] font-['Press_Start_2P'] text-yellow-400">
							<span>{player2Name}</span>
						</div>
						<div className="absolute bottom-[7.9%] left-[54%] font-['Press_Start_2P'] text-yellow-400">
							<span>{player1Score}</span>
						</div>
						<div className="absolute bottom-[7.9%] right-[53%] font-['Press_Start_2P'] text-yellow-400">
							<span>{player2Score}</span>
						</div>
					</>
				)}
			</div>
		</div>
	)

}