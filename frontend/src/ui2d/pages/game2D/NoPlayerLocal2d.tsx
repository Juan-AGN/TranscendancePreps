// ┌────────────────────────────────────────────────────────────┐
// │                    NoPlayerLocal2d.tsx                     │
// ├────────────────────────────────────────────────────────────┤
// │ Local 2D spectator mode page where the match can run without│
// │ direct player control.                                     │
// └────────────────────────────────────────────────────────────┘

import { useNavigate } from "react-router-dom";
import { useState } from 'react'
import { useTranslation } from 'react-i18next';
import { Game2DCanvas } from "../../components/Game2DCanvas";
import { ArcadeBgLayout } from "../../components/ArcadeBgLayout";
import { use2dGameSettingsStore } from '../../../shared/store/game2dSettingsStore';

type SpectatorGameScore = {
	player1: number;
	player2: number;
};

// ════════ COMPONENT: SpectatorMode2d: Render the local spectator game screen. ════════
export function SpectatorMode2d() {
	const navigate = useNavigate();
	const { scoreLimit } = use2dGameSettingsStore();
	const { t } = useTranslation();
	// STEP 1: Store the current score displayed by the arcade HUD.
	const [scores, setScores] = useState<SpectatorGameScore>({
		player1: 0,
		player2: 0,
	});
	// STEP 2: Keep the final score in sync when the spectator match ends.
	const handleGameEnd = (_winner: string, player1Score: number, player2Score: number) => {
		setScores({ player1: player1Score, player2: player2Score });
	};
	// STEP 3: Keep the HUD score updated while the spectator match is running.
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
			{/* STEP 4: Run the 2D canvas in spectator mode. */}
			<Game2DCanvas
				gameMode="spectator"
				maxScore={scoreLimit}
				onScoreChange={handleScoreChange}
				onGameEnd={handleGameEnd}/>
		</ArcadeBgLayout>
	);
}