import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ProtectedRouteProps } from '../types';

/**
 * ProtectedRoute - Componente que protege rutas que requieren autenticación
 * 
 * Si el usuario NO está autenticado, redirige automáticamente al login.
 * Si está autenticado, muestra el contenido (children).
 * 
 * Uso:
 *   <ProtectedRoute>
 *     <HomePage />
 *   </ProtectedRoute>
 */
export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Mientras verifica auth (checkAuth), mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  
  // Si NO está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Si está autenticado, mostrar el contenido protegido
  return <>{children}</>;
}