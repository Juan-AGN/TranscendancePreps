import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
//import para no hardcodear y cambiar rutas
import { Game2DCanvas } from '../../components/Game2DCanvas';
import { ArcadeBgLayout } from '../../components/ArcadeBgLayout';

export function Player2vsLocal2D() {
	const navigate = useNavigate();
	const [scores, setScores] = useState({ player1: 0, player2: 0 });

	const handleGameEnd = (_winner: string, player1Score: number, player2Score: number) => {
		setScores({ player1: player1Score, player2: player2Score });
	};

	const handleScoreChange = (player1Score: number, player2Score: number) => {
		setScores({ player1: player1Score, player2: player2Score });
	};

	return (
		/*<div className="flex flex-col items-center justify-center min-h-screen bg-white">
			<div className="mb-4">
				<button
					onClick={() => navigate('/game')}
					className="px-6 py-2 font-mono text-lg font-bold border-4 border-black hover:bg-black hover:text-white transition-colors"
				>
					← BACK
				</button>
			</div>

			<h1 className="text-4xl font-black font-mono mb-8">2 PLAYER LOCAL</h1>

			<Game2DCanvas
				gameMode="1v1"
				maxScore={5}
				onGameEnd={handleGameEnd}
			/>
		</div>*/
		<> 
		<ArcadeBgLayout 
		showGameHud
		player1Name="PLAYER 1"
		player2Name="PLAYER 2"
		player1Score={scores.player1}
		player2Score={scores.player2}
		onBack={() => navigate('/game')}>	
					<Game2DCanvas
						gameMode="1v1"
						maxScore={5}
						onScoreChange={handleScoreChange}
						onGameEnd={handleGameEnd}
					/>
		</ArcadeBgLayout>
		
		</>
	);
}