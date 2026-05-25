import { create } from 'zustand';				//create para crear una store(caja global de datos)
import { persist } from 'zustand/middleware';	//persist hace q el estado se guarde automaticamente en localstorage, siempre se queda el volumen q pongamos guardado

interface AudioState {			//definimos la forma que tendra el objeto
	masterVolume: number
	musicEnabled: boolean	//musica de fondo on/off
	sfxEnabled: boolean		//efectos de sonido on/off
	effectsSound: boolean

	setMasterVolume: (v: number) => void
	setMusicEnabled: (v: boolean) => void
	setSfxEnabled: (v: boolean) => void
	setEffectsSound: (v: boolean) => void
}

export const useAudioStore = create<AudioState>() (
	persist(
		(set) => ({
			masterVolume: 70,
			musicEnabled: true,
			sfxEnabled: true,
			effectsSound: true,
			setMasterVolume: (v) => set({ masterVolume: v }),
			setMusicEnabled: (v) => set({ musicEnabled: v }),
			setSfxEnabled: (v) => set({ sfxEnabled: v }),
			setEffectsSound: (v) => set({ effectsSound: v }),
		}),
		{ name: 'audio-settings' }
	)
)