import { Link } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
	return (
	<div className="min-h-screen flex items-center justify-center">
		<div className="bg-white p-10 rounded-lg shadow-md w-full max-w-md">
        	{/* Header */}
			<h1 className="text-3xl font-bold text-center mb-6">
				Init Session
				</h1>
			{/* Formulario */}
			<LoginForm />
			
			{/* Link a Signup */}
			<p className="mt-4 text-center text-gray-600">
				¿Dont have an account?{' '}
				<Link to="/signup" className="text-blue-500 hover:underline">
				Register Here!
				</Link>
			</p>
		</div>
    </div>
	);
}