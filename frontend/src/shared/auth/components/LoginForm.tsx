//Form para q el use inicie sesio (email + pass)

import React, { useState  } from "react";
//remember: hook de React** permite darle memoria a un componente funcinoal**cuando cambia react re-renderiza el comp
import { useAuth } from "../hooks/useAuth";
// hook personlaizdo**creado para no repetir logica
import { useNavigate } from "react-router-dom";
//remember: hook de React para navegar de forma, navegamos cuando ocurre eun evento

export const LoginForm: React.FC = () => {
  //descostrusting hook // crea una variable de estado y una funcion para modificarla
  // email(valor act), setEmail func para cambiarla
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ('') el input empieza vacio, evita undefined o null

  const { login, isLoading, error, clearError } = useAuth();
  //useAuth es el custom hook(devuelve un objetoco y lo desestruc: login,isloading,error,clearerror)
  const navigate = useNavigate();
  //conectamos el login con la navegacion** aqui no hacemos link, navegamos si el login fuce success


  //funcion para navegar el evento. // aync pq tarda  y puede fallar
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
    //e = evento del formulario** React.Formevent = tipo exacto del evento submit
      //e.preventdeafult->evita el comport x defecto del navegador. obligatoria para cualquier form de react
    
    try {
      await login({ email, password });
      navigate('/home');
    } catch (err) {
      //el error ya se guarda en el store., el form no debe duplicar la logica
    }
  };


  return (
  <form onSubmit={handleSubmit} className="space-y-3">
    {/* Mostrar error si existe */}
    {error && (
      <div className="bg-red-500 text-white p-3 rounded">
        {error}
        <button onClick={clearError}> X </button>
      </div>
    )}
    
    {/* Input Email */}
	<div className="flex items-center gap-4">
		<label className="w-34 text-sm font-medium text-gray-700">
			Email
			</label>
		<input
			type="email"
			value={email}
			onChange={(e) => setEmail(e.target.value)}
			required
			disabled={isLoading}
			className="flex-1 px-6 py-0.5 border border-gray-300 rounded-lg
               focus:outline-none focus:ring-2 focus:ring-blue-500
               disabled:opacity-50"
  		/>
	</div>

    
    {/* Input Password */}
    <div className="flex items-center gap-4">
		<label className="w-34 text-sm font-medium text-gray-700">
			Password
			</label>
		<input
			type="password"
			value={password}
			onChange={(e) => setPassword(e.target.value)}
			required
			disabled={isLoading}
			className="flex-1 px-6 py-0.5 border border-gray-300 rounded-lg
               focus:outline-none focus:ring-2 focus:ring-blue-500
               disabled:opacity-50"
  		/>
	</div>

    <button
		type="submit"
		disabled={isLoading}
		className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold
				hover:bg-blue-700 transition"
	>
		{isLoading ? 'Loading...' : 'Init Session'}
  	</button>
  </form>
  );
};