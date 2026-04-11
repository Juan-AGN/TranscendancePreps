// src/shared/auth/types/index.ts
// file de TIPOS de auth (solo TypeScript), this file describe como deben ser los datos
// aqui definimos "contratos" entre front y back
// esto NO se ejecuta en runtime, solo sirve pa que TS valide formas de datos
// asi evitamos bugs, y no mezclamos password dentro del User

// USER -> usuario real (viene del backend)
export interface User {
	id: string;            // id unico del backend (normalmente UUID)
	username: string;      // nombre visible (display)
	email: string;         // email (login / contacto)
	avatarUrl?: string;    // opcional: puede no existir (ponemos avatar default en UI)
	createdAt: string;     // fecha ISO en string (JSON siempre llega como string)
	updatedAt?: string;    // opcional: ultima modificacion (si backend lo manda)

	// extras (opcionales) por si los usas en perfil / stats
	bio?: string;          // mini bio del user
	isOnline?: boolean;    // estado online (si backend lo soporta)
	wins?: number;         // stats: victorias
	losses?: number;       // stats: derrotas
}

// FORM DATA -> lo que escribe el user en los forms
// (esto NO es User)

// login -> payload para POST /api/auth/login
export interface LoginFormData {
	email: string;         // lo que escribe en el input
	password: string;      // password del form (nunca se guarda en User)
}

// signup -> payload del form de registro
// confirmPassword es solo front (validacion), no se envia al backend
export interface SignupFormData {
	username: string;
	email: string;
	password: string;
	confirmPassword: string; // solo front
}

// update perfil -> lo que permites editar (normalmente sin password aqui)
export interface UpdateProfileData {
	username?: string;     // opcional: mandas solo lo que cambia
	email?: string;
	bio?: string;
  // password mejor en endpoint separado (change-password)
}

// RESPUESTAS BACK -> lo que devuelve el backend
// respuesta ok de login/signup (token + user)
export interface AuthResponse {
	success: boolean;      // flag rapido pa UI
	user: User;            // user sin datos sensibles
	token: string;         // JWT (o token) para Authorization
	message: string;       // mensaje pa toast / UI
}

// respuesta de error (si tu backend la usa asi)
export interface ErrorResponse {
	success: false;        // si es error, siempre false
	error: string;         // tipo/codigo de error (ej: "VALIDATION_ERROR")
	message: string;       // texto humano
	statusCode: number;    // HTTP status (400/401/409/etc)
	errors?: {
		// errores por campo (ej: email ya existe)
		[field: string]: string;
	};
}


// AUTH STATE -> para Zustand (estado global)
export interface AuthState {
	// estado
	user: User | null;          // null si no hay sesion
	token: string | null;       // token o null
	isAuthenticated: boolean;   // true si hay sesion valida
	isLoading: boolean;         // spinner en login/signup
	error: string | null;       // mensaje de error (UI)

	// acciones (firmas) -> se implementan en authStore.ts
	login: (token: string, user: User) => void;           // set token+user
	logout: () => void;                                   // reset session
	setLoading: (loading: boolean) => void;               // flags UI
	setError: (error: string | null) => void;             // set error msg
	clearError: () => void;                               // limpiar error
	updateUser: (userData: Partial<User>) => void;        // merge parcial de user
	checkAuth: () => Promise<void>;                       // restaurar sesion al arrancar
}

// HELPERS UI -> props de componentes

// props de ProtectedRoute (wrapper de rutas privadas)
// children = lo que va dentro (la page protegida)
export interface ProtectedRouteProps {
	children: React.ReactNode;
	redirectTo?: string; // destino si no hay auth (default /login)
}



//*interface	= descripcion del objeto y modelar datos(ideal para data q viene del BACK)
//*export		= Para usar en otros archivos.	
//*:  &  ? & |	= : tipado	// ? la propiedad puede existir o no. // | Union types (OR de tipos)
//*Partial<User>= El objeto puede tener solo alguna propiedades de user

//* errors?		= objeto opcional (puede no existir)
//* [field: string]    = clave dinamica (no sabemos el nombre del campo)
//* : string           = el valor es un mensaje de error en texto
//* se usa para errores por campo que vienen del backend

//* children           = contenido que va dentro del componente
//* React.ReactNode    = cualquier cosa que React puee renderizar (componentes, texto, JSX)(UI envuelta)
//* se usa en wrappers como ProtectedRoute

