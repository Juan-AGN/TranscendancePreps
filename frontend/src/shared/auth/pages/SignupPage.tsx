import { Link } from 'react-router-dom';
import { SignupForm } from '../components/SingupForm';

export function SignupPage() {
	return (
	<div className="min-h-screen flex items-center justify-center">
		<div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        	{/* Header */}
			<h1 className="text-3xl font-bold text-center mb-6">
				Create Account
			</h1>
			
			{/* Formulario */}
			<SignupForm />
			{/* Link a Login */}
			<p className="mt-4 text-center text-gray-600">
				¿Do you have an account?{' '}
				<Link to="/login" className="text-blue-500 hover:underline">
					Click Here
				</Link>
			</p>
		</div>
	</div>
	);
}
