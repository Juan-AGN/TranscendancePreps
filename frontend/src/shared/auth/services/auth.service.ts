//este file habla con la API-es la capa de Serivicios (API LAYER)
//Aqui se centralizaran todas las llamadas http al backend relacionadas con el auth y perfil: login-signup-token-etc..
//Lo utilizaremos para que tanto 2d y 3d puedan obtener sus datos sin repetir fecth en cada componente, 

import type { LoginFormData, SignupFormData, AuthResponse, User } from "../types";
//importamos solo tipos de TS /type/

const API_URL= import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// import.meta.env es el sistema de variables del entrono VITE(usa la url del back definida en .env) //fallback si falla


//LOGINUSER- Hacer POST /api/auth/login ** enviar mail y password al backend, si es ok devuelve token+user, si no error
//funcion async, la funcion devuelve una promse, fetch es async.
export async function loginUser(credentials: LoginFormData): Promise<AuthResponse> {
    //pasamos los datos recbidios de LoginforData-email-string/password-string.
    // y devuelve promesa para no hacer pending, y al finish dara un authresponse
    
    //Build la URL final*await-> pausa esta funcion hasta el BACK responda*fecth->arranca peticion en red. FRONT->BACK
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        //method->enviando datos(crdenciales)
        headers: {
            'Content-Type' : 'application/json',
        },
        //headers-> tipò, mandamos json
        body: JSON.stringify(credentials),
        //convertimos el objeto JS en texto JSON para enviarlo por HTTP

        //aqui response no es el JSON aun, es un objeto con info.
    });
    //si hay error
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error Invalid credentials');
    }
    //lee el body y lo convierte a objeto JS
    return response.json();
}

//SIGNUPUSER Hacer POST /api/auth/signup
export async function signupUser(userData: SignupFormData) : Promise<AuthResponse> {

	const { confirmPassword, ...datatoSend } = userData;
    //confirmPass solo es para FRont , lo sacamos de de UserData (... es restOperator)
	const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datatoSend),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error init register');
    }
    return response.json();
}

//VERYFYTOKEN--> devulve un user 
export async function verifyToken(token: string): Promise<User> {
    // token q recibimos del login y guardamos en store o localstorage
    //la promesa devilvera un user Real.
    const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',  //get consulta
        headers: {
            'Authorization': `Bearer ${token}`,
            //mandamos el token en la cabecera htpp estandar para auth.
            //bearer es una convencion HTTP(token que se presenta para acceder)
            //va en headers y no body porque GET no lleva body. el token es credencial, no formDATA
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Invalid Token');
    }
    return response.json();
}

//GETCURRENTUSER ->
export async function getCurrentUser(token: string): Promise<User> {

    const response = await fetch(`${API_URL}/users/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Error GerCurrentUser');
    }
    return response.json();
}

//updateUserProfile - Hace PUT /api/users/me
export async function updateUserProfile(
	token: string, 
	data: { username?: string; email?: string; bio?: string }
		): Promise<User> {
			const response = await fetch(`${API_URL}/users/me`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'Error updateprofile');
	}

  return response.json();
}

//uploadAvatar - Hace POST /api/users/avatar
export async function uploadAvatar(token: string, file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_URL}/users/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // NO se pone 'Content-Type' con FormData, el navegador lo pone automático
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al subir avatar');
  }

  return response.json();
}

//*import.meta.env.VITE_API_URL = sist. de variables de Vite(lee valor de .env)
//*await			= pausa la func hasta que la promise termine.(espera respt del back)
//*fecth			= envia peticion al servidor (front<>back)
//*POST/GET/PUT		= envia datos//pide datos//modifica datos
//*headers			= Metadatos// describe como interpre.. la peticion
//*Authorization: Bearer ${token}= Convencion stdar de autenticacion
//	.............	= envia el token como credencial para que back sepa quien es 
//*Bearer			= esquema de Auten.. HTTP. Indica que el token que manda se identifica como usuario autentificado
//*FormData			= Api del navegador para enviar archivos. JSON no sirve para archivos(avatar y 3d)
//*body				= el contenido real de la peticion