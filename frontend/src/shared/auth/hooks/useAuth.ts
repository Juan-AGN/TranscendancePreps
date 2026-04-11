//USEAUTH - hook personalized que actua como puente entre /UI/estadoGlobal(Zustand)/API
//centralizamos aqui
//3 things->lee estado del store y lo expone->llama al backend mediante servicios->actualiza sotre para q toda la app se entere
//Pq existe:   - Para NO repetir try/catch/loading/error/fetch en cada componente
//   			- Para que cualquier parte del proyecto (2D o 3D) use auth igual


import { useAuthStore } from '../store/authStore';
//importamos el estado globlas de autenticacion(user,token,isautenticated.)
import { loginUser, signupUser } from '../services/auth.service';
//funciones que hablan con el BACK/normal hacen fetch y devuelven
import type { LoginFormData, SignupFormData } from '../types';
//tipos de datos que viene de los formularios

//hook personalizado useAuth
export function useAuth() {

	const store = useAuthStore();
	//store es el objeto que nos da Austand (estado+acciones)
	//Esto NO "copia" el estado.
	//React se suscribe: si el store cambia, el componente re-renderiza.

    return {
		// Devolvemos una API amigable para la UI//estados del store
		
		user: store.user,
		// user = usuario autenticado o null
		// si user es null => no hay session (o aunn no se ha restaurado)

		token: store.token,
		// token = JWT o null
		// se usa para Authorization: Bearer <token> en endpoints protegidos

		isAuthenticated: store.isAuthenticated,
		// isAuthenticated = true si hay token+user (segun la logic en store.login)
		// se usa para proteger rutas o mostrar botones diferentes en UI

		isLoading: store.isLoading,
		// isLoading = true mientras se hace login/signup
		// se usa para desactivar botones y mostrar spinners

		error: store.error,
		// error = string o null
		// se muestra en la UI como mensaje de error (ej: "Invalid credentials")

		//funciones de login/logout
		login: async (credentials: LoginFormData) => {
			try {
				store.setLoading(true);// trbajando para la UI
				// 1) Activar loading para que la UI muestre "cargando..."
				store.setError(null);// limpiar el error,sino la UI puede mostrar error viejo
				// 2) Limpiar error anterior (evita mostrar un error viejo mientras reintentas)

				// 3) lamamos al back
				const response = await loginUser(credentials);// credential viene del Form

				// 4) si OK, lo guardames en zustan(asi cualquier parte de la app sabe que esta autenticado)
				store.login(response.token, response.user);
				// 5) devolvemos la respuesta por si el componente quiere usarla
				return response;
			} catch (error) {
				const message = error instanceof Error? error.message : 'Error init sesion';
				store.setError(message);
				throw error;
			} finally {
				store.setLoading(false);//pase loq pase apaga, para evitar loading infinitos
			}
		},

		signup: async (userData: SignupFormData) => {
			try {
				store.setLoading(true);
				store.setError(null);
				
				// Llamamos al backend
				const response = await signupUser(userData);
    
			// Si OK, guardamos en el store
				store.login(response.token, response.user);
				return response;
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Error al registrarse';
				store.setError(message);
				throw error;
			} finally {
				store.setLoading(false);
			}
		},
		
		logout: store.logout,
		clearError: store.clearError,
	};
}


//* useAuthStore()		= Hook de Zustand que da acceso al store global (estado + acciones)
//* store				= Objeto devuelto por Zustand con user, token y funciones (login, logout…)
//* LoginFormData		= Datos que escribe el usuario en el form de login (NO es User)
//* SignupFormData		= Datos del form de registro (confirmPassword es solo front)
//* loginUser()			= Service API que hace POST /auth/login (fetch real)
//* signupUser()		= Service API que hace POST /auth/signup
//* finally				= Se ejecuta siempre (success o error)
//* store.setLoading()	= Activa/desactiva loading global (spinner / disable UI)
//* store.setError()	= Guarda mensaje de error para mostrar en UI
//* store.login()		= Guarda token + user y marca isAuthenticated = true
//* instanceof Error	= Comprueba si el valor es un Error real
//* error.message		= Mensaje del error lanzado por backend o el codigo
//* logout				= Action del store que borra session (token + user)
//* clearError			= Limpia el error guardado en el store
//* useAuth				= Wrapper limpio: UI ↔ Zustand ↔ API (fetch)


/*
   FLUJO DE LOGIN (REAL)
  
   LoginForm
     ↓ llama a login(credentials)
   useAuth
     ↓ store.setLoading(true)
     ↓ loginUser(credentials)  -> fetch al backend
     ↓ store.login(token, user)
     ↓ store.setLoading(false)
   Zustand
     ↓ actualiza estado global
   UI
     ↓ re-render automático (isAuthenticated = true)

  
   FLUJO DE SIGNUP

   SignupForm
     ↓ signup(userData)
   Backend
     ↓ crea usuario + devuelve token
   useAuth
     ↓ guarda sesión automáticamente (login)
   UI
     ↓ usuario ya autenticado
*/

