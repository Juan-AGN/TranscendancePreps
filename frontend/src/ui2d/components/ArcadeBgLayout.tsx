import type React from 'react';
const arcadeBg = '/images/arcadebg5.png';

type BgProps = {
	children: React.ReactNode
	onBack?: () => void
	showGameHud?: boolean
	player1Name?: string
	player2Name?: string
	player1Score?: number
	player2Score?: number
}

export function ArcadeBgLayout({
	children,
	onBack,
	showGameHud = false,
	player1Name = 'PLAYER 1',
	player2Name = 'PLAYER 2',
	player1Score = 0,
	player2Score = 0
}: BgProps) {
	return (
		<div className="flex items-center justify-center h-full bg-black  w-full">
			<div className="relative h-full w-full max-w-[85rem]">
				<img
					src={arcadeBg}
					alt="Arcade"
					className="w-full h-full object-fill block pointer-events-none"
				/>
				{/* Overlay posicionado relativo a la imagen real, no al contenedor */}
				<div className="arcade-scroll absolute left-[8%] top-[34%] md:top-[35.5%] lg:top-[21%] w-[85%] h-[65%] flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden pt-[8%] md:pt-[7.5%] lg:pt-[7%]">
					{children}
				</div>
				{/* Botón back: siempre top-right relativo a la imagen */}
				{onBack && (
					<button
						onClick={onBack}
						className="absolute top-[5%] right-[6%] z-[80] font-['Press_Start_2P'] text-yellow-400
								cursor-pointer hover:bg-black hover:text-white transition-colors px-2 py-1"
						style={{ fontSize: '2.5vmin' }}>
						← BACK
					</button>
				)}
				{showGameHud && (
					<>
						<div className="absolute bottom-[8%] left-[25%] z-10 font-['Press_Start_2P'] text-yellow-400 max-w-[20%] overflow-hidden"
							style={{ fontSize: '2vmin' }}>
							<span className="block whitespace-nowrap truncate">{player1Name}</span>
						</div>
						<div className="absolute bottom-[8%] right-[25%] font-['Press_Start_2P'] text-yellow-400 max-w-[20%] overflow-hidden"
							style={{ fontSize: '2vmin' }}>
							<span className="block whitespace-nowrap truncate">{player2Name}</span>
						</div>
						<div className="absolute bottom-[7.9%] right-[53%] font-['Press_Start_2P'] text-yellow-400"
							style={{ fontSize: '2vmin' }}>
							<span>{player1Score}</span>
						</div>
						<div className="absolute bottom-[7.9%] left-[54%] font-['Press_Start_2P'] text-yellow-400"
							style={{ fontSize: '2vmin' }}>
							<span>{player2Score}</span>
						</div>
					</>
				)}
			</div>
		</div>
	)

}