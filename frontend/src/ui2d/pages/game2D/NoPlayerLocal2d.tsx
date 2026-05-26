import { useNavigate } from "react-router-dom";
import { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Game2DCanvas } from "../../components/Game2DCanvas";
import { ArcadeBgLayout } from "../../components/ArcadeBgLayout";
import { use2dGameSettingsStore } from '../../../shared/store/game2dSettingsStore';

export function SpectatorMode2d() {
	const navigate = useNavigate();
	const [scores, setScores] = useState({ player1: 0, player2: 0 });
	const { scoreLimit } = use2dGameSettingsStore();
	const { t } = useTranslation();

	const handleGameEnd = (_winner: string, player1Score: number, player2Score: number) => {
		setScores({ player1: player1Score, player2: player2Score });
	};

	const handleScoreChange = (player1Score: number, player2Score: number) => {
		setScores({ player1: player1Score, player2: player2Score });
	};

	return (
		<ArcadeBgLayout
		showGameHud
		player1Name={t('arcade2d.hud.spectator1')}
		player2Name={t('arcade2d.hud.spectator2')}
		player1Score={scores.player1}
		player2Score={scores.player2}
		onBack={() => navigate('/game')}>	
					<Game2DCanvas
						gameMode="spectator"
						maxScore={scoreLimit}
						onScoreChange={handleScoreChange}
						onGameEnd={handleGameEnd}
					/>
		</ArcadeBgLayout>
	);
}