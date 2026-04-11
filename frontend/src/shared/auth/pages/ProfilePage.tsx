import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
	const { user, logout, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	// Si no esta autenticado, redirigir
	if (!isAuthenticated || !user) {
		navigate('/login');
		return ;
	}

	const handleLogout = () => {
		logout();
		navigate('/login');
	};
	
	return (
	<div className="min-h-screen bg-gray-100 py-12 px-4">
		<div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">My Profile</h1>
				<button 
				onClick={handleLogout}
				className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
				>
					Close Session
				</button>
			</div>
		
			{/* Avatar */}
			<div className="flex items-center mb-8">
				<div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-4xl">
					{user.avatarUrl ? (
						<img 
						src={user.avatarUrl} 
						alt="Avatar" 
						className="w-24 h-24 rounded-full object-cover"
						/>
					) : (
					<span>{user.username[0].toUpperCase()}</span>
					)}
				</div>
			
				<div className="ml-6">
					<h2 className="text-2xl font-bold">{user.username}</h2>
					<p className="text-gray-600">{user.email}</p>
				</div>
			</div>

			{/* user inforamcion */}
			<div className="space-y-4">
				<div className="border-t pt-4">
					<h3 className="text-lg font-semibold mb-4">Information</h3>
				
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-gray-600">User</p>
							<p className="font-medium">{user.username}</p>
						</div>
						<div>
							<p className="text-gray-600">Email</p>
							<p className="font-medium">{user.email}</p>
						</div>
					
						<div>
							<p className="text-gray-600">Member since</p>
							<p className="font-medium">
								{new Date(user.createdAt).toLocaleDateString()}
							</p>
						</div>
              
						{/* Stats opcionales , aun nada */}
						{user.wins !== undefined && (
						<div>
							<p className="text-gray-600">Wins</p>
							<p className="font-medium">{user.wins}</p>
						</div>
						)}
					</div>
        		</div>
          
         		 {/*button (opcional, para + tarde) */}
				 <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mt-6">
           		 	Edit profile
          		</button>
			</div>
      </div>
    </div>
  );
}