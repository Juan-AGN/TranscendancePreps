// aqui es donde usamos Zustand para UI y 3D.
// liberia Zustand... para el estado global de REACT
//// Evita el "Prop Drilling" (pasar variables de padre a hijo a nieto).
import { create } from 'zustand'

// sala de control el gamestore.ts
// creamos interfza, definimos que datos existen en nuestra app!
// como un struct de c
interface GameState {
  // Estado del juego Vital para UX: Mientras cargan los modelos 3D pesados, bloqueamos la interaccia
  isLoading: boolean
  loadingProgress: number
  loadingLabel: string
  
  //Estado del usuario (preparado para implement futura)
  // requisito 3.3 del subject en el pdf, gestion usuaruis, aqui guardamos el token para NestJS o datos
  isAuthenticated: boolean
  username: string | null // nombre user o null nadie log In
  
  // Estado del Hub 3D
  isHubReady: boolean
  currentScene: 'hub' | 'game' | null
  
  // Acciones
  setLoading: (isLoading: boolean) => void
  setLoadingProgress: (progress: number, label?: string) => void
  setHubReady: (ready: boolean) => void
  setCurrentScene: (scene: 'hub' | 'game' | null) => void
  
  //Usuario (preparado para backend)
  login: (username: string) => void
  logout: () => void
}


//Creamos el store   -- useGameStore se usa como un hook en React
//                    -- set es la fun q deja actualizar el estado.
export const useGameStore = create<GameState>((set) => ({
  // Estado inicial d elos valores
  isLoading: true,
  loadingProgress: 0,
  loadingLabel: 'Inicial en gamestore....',
  isAuthenticated: false,
  username: null,
  isHubReady: false,
  currentScene: null,

  //implemtacion de acciones
  // esto es como state.isLoading = isLoading en c
  // React detecta  este cambio y re-renderizara SOLO los componentes afectados
  setLoading: (isLoading) => 
	set({ isLoading }),

  setLoadingProgress: (progress, label) => 
    set((state) => ({
      loadingProgress: progress,
      loadingLabel: label || state.loadingLabel
    })),
  
  setHubReady: (ready) => 
	set({ isHubReady: ready }),
  
  setCurrentScene: (scene) =>
	set({ currentScene: scene }),
  //  En the futuro, esta función será 'async' y hará un 'fetch' al Backend.
  login: (username) => 
    set({
      isAuthenticated: true,
      username
    }),
    
  logout: () =>
    set({
      isAuthenticated: false,
      username: null
    }),
}))



