//file para crear un estado global, con Zustand estado global facil y limpio
//sino acabariamos usando un prop dilling.(pasar la info del user de un componente a otro como un package)

import { create } from 'zustand';               // importamos la funcionCreate, con la construiremos el store.
import type { AuthState } from '../types';     //importamos los tipos creados

// Constante para key del localStorage (persistir sesion en el navegador)
const TOKEN_KEY = 'authToken';

//export del hook global useAuthstore.. //create la funcion de Zustand autstate con el generico se TS
//set es la funcion q Zustan da para actualizar el estado del store.//le pedimos a Zustand que actualice el estado.
export const useAuthStore = create<AuthState>((set) => ({
	// estados iniciales
	user: null,
	token: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,

	//acciones
	//login->guarda token en localStorage y actualiza estado
	login: (token, user) => {
		localStorage.setItem(TOKEN_KEY, token);
		set({ token, user, isAuthenticated: true, error: null });
	},
	
	//logout->limpia token del navegador y resetea estado
	logout: () => {
		localStorage.removeItem(TOKEN_KEY);
		set({ user: null, token: null, isAuthenticated: false, error: null });
	},

	//setLoading->util para mostrar spinners mientras carga algo
	setLoading: (isLoading) => set({ isLoading }),

	//setError->guardamos mensajes de error del backend
  	setError: (error) => set({ error }),

	//clearError->limpia el mensaje de error
  	clearError: () => set({ error: null }),

	//updateUser->actualiza datos del perfil (despues de editar username, avatar, etc)
  	updateUser: (userData) => 
		set((state) => ({
			user: state.user ? { ...state.user, ...userData } : null
		})),

	//checkAuth->verifica si hay sesion guardada al abrir la app
	//lee token de localStorage, si existe lo restaura en el estado
	//TODO: cuando unamos/o tengamos backend, hay que validar el token con GET /api/auth/verify
	checkAuth: async () => {
		const token = localStorage.getItem(TOKEN_KEY);
		
		if (!token) {
			set({ isAuthenticated: false });
			return;
		}
		//* restaura la session en memoria usando el token guardado (sin validacion backend)
		set({ token, isAuthenticated: true });
	},
}));


//* create<AuthState>()  = Función de Zustand que crea el store global tipado con AuthState
//* AuthState            = Interface TS que define estado + acciones del store
//* useAuthStore         = Hook global de Zustand (misma instancia en toda la app)
//* set                  = Func interna de Zustand para actualizar el estado del store
//* user: null           = Usuario actual (null si no hay session)
//* token: null          = Token JWT guardado en memoria (y localStorage)
//* isAuthenticated      = Flag fast para saber si hay session valida
//* isLoading            = Flag UI (spinner / disable botones)
//* error                = Mensaje de error global para la UI
//* TOKEN_KEY            = Clave usada para guardar el token en localStorage
//* localStorage         = Almacenamiento persistente del navegador (sesion sobrevive refresh)
//* login(token, user)   = Guarda token en localStorage y marca session activa
//* logout()             = Borra token del navegador y resetea el estado
//* set({ ... })         = actualiz el estado del store (merge parcial)
//* set((state) => ...)  = actualiz basada en el estado anterior
//* updateUser()         = Mezcla datos nuevos con el user existente (perfil/avatar)
//* ...userData          = Spread operator (fusiona propiedades nuevas)
//* spread operator (...)= Copia/expande propiedades de un objeto o array en otro
//* { ...a, ...b }       = a + b (b sobrescribe a si hay claves iguales)
//* checkAuth()          = Restaura session al arrancar leyendo localStorage
//* Zustand              = Estado global sin Provider ni prop drilling
//* prop drilling        = Pasar props por muchos componentes intermedios (evitado HERE)
