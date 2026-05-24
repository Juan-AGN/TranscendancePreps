import { create } from 'zustand';				//create para crear una store(caja global de datos)
import { persist } from 'zustand/middleware';	//persist hace q el estado se guarde automaticamente en localstorage, siempre se queda el volumen q pongamos guardado

interface AudioState {			//definimos la forma que tendra el objeto
	masterVolume: number
	effectsSound: boolean

	setMasterVolume: (v: number) => void
	setEffectsSound: (v: boolean) => void
}

export const useAudioStore = create<AudioState>() (
	persist(
		(set) => ({
			masterVolume: 70,
			effectsSound: true,
			setMasterVolume: (v) => set({ masterVolume: v }),
			setEffectsSound: (v) => set({ effectsSound: v }),
		}),
		{ name: 'audio-settings' }
	)
)