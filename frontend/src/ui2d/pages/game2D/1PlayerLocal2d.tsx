// ┌────────────────────────────────────────────────────────────┐
// │                    1PlayerLocal2d.tsx                      │
// ├────────────────────────────────────────────────────────────┤
// │ Local 2D game page where Player 1 plays against the fakeAI.│
// └────────────────────────────────────────────────────────────┘
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Game2DCanvas } from '../../components/Game2DCanvas';
import { ArcadeBgLayout } from '../../components/ArcadeBgLayout';
import { use2dGameSettingsStore } from '../../../shared/store/game2dSettingsStore';

type LocalGameScore = {
	player1: number;
	player2: number;
};

// ════════ COMPONENT: Player1vsLocal2D: Render the 1 player vs FakeAI game screen. ════════
export function Player1vsLocal2D() {
	const navigate = useNavigate();
	const { scoreLimit } = use2dGameSettingsStore();
	const { t } = useTranslation();
	// STEP 1: Store the current score displayed by the arcade HUD.
	const [scores, setScores] = useState<LocalGameScore>({
		player1: 0,
		player2: 0,
	});
	// STEP 2: Keep the final score in sync when the game ends.
	const handleGameEnd = (_winner: string, player1Score: number, player2Score: number) => {
		setScores({ player1: player1Score, player2: player2Score });
	};
	// STEP 3: Keep the HUD score updated while the game is running.
	const handleScoreChange = (player1Score: number, player2Score: number) => {
		setScores({ player1: player1Score, player2: player2Score });
	};

	return (
		<ArcadeBgLayout
			showGameHud
			player1Name={t('arcade2d.hud.player1')}
			player2Name={t('arcade2d.hud.computer')}
			player1Score={scores.player1}
			player2Score={scores.player2}
			onBack={() => navigate('/game')}>
			{/* STEP 4: Run the 2D canvas in Player 1 vs AI mode. */}
			<Game2DCanvas
				gameMode="1vIA"
				maxScore={scoreLimit}
				onScoreChange={handleScoreChange}
				onGameEnd={handleGameEnd} />
		</ArcadeBgLayout>
	);
}
