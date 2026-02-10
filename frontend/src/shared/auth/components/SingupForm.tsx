import { useState } from "react";
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function SignupForm() {
  // Hooks de auth y navegacion
  const { signup, error, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Estados locales del formulario
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

const validateForm = () => {
  if (password !== confirmPassword) {
    setValidationError('Password not match');
    return false;
  }
  if (password.length < 4) {
    setValidationError('Password at least 4 characters');
    return false;
  }
  setValidationError('');
  return true;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm())
	return;
  
  try {
    await signup({ username, email, password, confirmPassword });
    navigate('/home');
  } catch (err) {
    // Error ya está en el store
  }
};



return (
    <form onSubmit={handleSubmit}/*noValidate->quitar mesanje del navegador*/ className="space-y-5">
      {(error || validationError) && (
        <div className="bg-red-400 text-white p-3 rounded-lg">
          {validationError || error}
        </div>
      )}

      {/* Username */}
      <div className="flex items-center gap-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          disabled={isLoading}
          className="flex-1 px-4 py-0.5 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50"
        />
      </div>

      {/* Email */}
      <div className="flex items-center gap-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="flex-1 px-4 py-0.5 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50"
        />
      </div>

      {/* Password */}
      <div className="flex items-center gap-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={4}
          disabled={isLoading}
          className="flex-1 px-4 py-0.5 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50"
        />
      </div>

      {/* Confirm Password */}
      <div className="flex items-center gap-4">
        <label className="w-32 text-sm font-medium text-gray-700">
          Confirm
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
          className="flex-1 px-4 py-0.5 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50"
        />
      </div>

      {/* Botón */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold
                   hover:bg-blue-700 transition
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}