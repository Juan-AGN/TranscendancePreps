
//importamos 2 herramientas desde la libreria RRD.
//createBrowserRouter->para crear el objeto que gestiona la historia y las URLS
//RouterProvider-> componente de React que conecta el enroutador con la interfaz visual.
import { createBrowserRouter, RouterProvider, useNavigate, useParams, Navigate } from "react-router-dom"
// importa un tipo de Typescript, desde local tipes (decimos que propiedades debe tener un objeto de ruta (como path o element))
import type { RouteObject } from './types'
// Layout principal
import { RootLayout } from '../../shared/components/layout/RootLayout'
//Paginas a mdedida que las vamos creando poner aqui!
import { HomePage } from "../../game/ui/pages/HomePage"
import { SplashScreen } from '../../shared/pages/IntroPage'
import { StartGate } from '../../shared/pages/MainPage'
import { Mainpage2 } from '../../shared/pages/SectionsPage'

import { Menu2DPage } from '../../ui2d/pages/Menu2DPage'
import { Game2DPage } from "../../ui2d/pages/Game2DPage"
import { Tournament2DPage } from "../../ui2d/pages/Tournament2DPage"
import { Settings2DPage } from "../../ui2d/pages/Settings2DPage"
import { GameSettings2DPage } from '../../ui2d/pages/settings/GameSettings2DPage'
import { Difficult2DPage } from "../../ui2d/pages/settings/DifficultSettings2DPage"
import { AudioSettings2DPage } from '../../ui2d/pages/settings/AudioSettings2DPage'
import { DisplaySettings2DPage } from '../../ui2d/pages/settings/DisplaySettings2DPage'

// Páginas de juego 2D
import { Player1vsLocal2D } from '../../ui2d/pages/game2D/1PlayerLocal2d'
import { Player2vsLocal2D } from '../../ui2d/pages/game2D/2PlayerLocal2d'
import { SpectatorMode2d } from "../../ui2d/pages/game2D/NoPlayerLocal2d"

import { PrivacyPolicyPage } from "../../shared/pages/PrivacyPolicyPage"
import { TermsOfServicePage } from "../../shared/pages/TermsOfServicePage"

// Paginas de Auth
import { LoginPage } from "../../shared/auth/pages/LoginPage"
import { SignupPage } from "../../shared/auth/pages/SignupPage"
import { ProfilePage } from "../../shared/auth/pages/ProfilePage"
import { ProtectedRoute } from "../../shared/auth/components/ProtectedRoute"


const MainSectionsPage = () => {
	const navigate = useNavigate()
	const { section } = useParams<{ section: 'tech' | '3d' | 'arcade' | 'creators' }>()

	if (section !== 'tech' && section !== '3d' && section !== 'arcade' && section !== 'creators') {
		return <Navigate to="/start" replace />
	}

	return (
		<Mainpage2
			selectedSection={section}
			onStart3D={() => navigate('/home')}
			onGo2DMenu={() => navigate('/menu2D')}
		/>
	)
}

// Página StartGate - usa useNavigate pa navegacion correcta
const StartPage = () => {
	const navigate = useNavigate()

	return (
		<StartGate
			onStart3D={() => navigate('/home')}
			onGo2DMenu={() => navigate('/menu2D')}
			onGoTech={() => navigate('/sections/tech')}
			onGo3D={() => navigate('/sections/3d')}
			onGoArcade={() => navigate('/sections/arcade')}
			onGoCreators={() => navigate('/sections/creators')}
		/>
	)
}

// definimos rutas (mapa)
const routes: RouteObject[] = [
	{
		path: '/',
		element: <SplashScreen />,
	},
	{
		path: '/',
		element: <RootLayout />,
		children: [
			{
				path: 'start',
				element: <StartPage />,
			},
			{
				path: 'sections/:section',
				element: <MainSectionsPage />,
			},
			{
				path: 'menu2D',
				element: <Menu2DPage />,
			},
			{
				path: 'home',
				element: (
					//<ProtectedRoute>
					<HomePage />
					//</ProtectedRoute>
				),
			},
			{
				path: 'game',
				element: (
					//<ProtectedRoute>
					<Game2DPage />
					//</ProtectedRoute>
				),
			},
			{
				path: 'tournament',
				element: (
					//<ProtectedRoute>
					<Tournament2DPage />
					//</ProtectedRoute>
				),
			},
			{
				path: 'settings',
				element: (
					//<ProtectedRoute>
					<Settings2DPage />
					//</ProtectedRoute>
				),
			},
			{
				path: 'gamesettings',
				element: <GameSettings2DPage />,
			},
			{
				path: 'difficultlevel',
				element: <Difficult2DPage />
			},
			{
				path: 'audio',
				element: <AudioSettings2DPage />
			},
			{
				path: 'display',
				element: <DisplaySettings2DPage />
			},
			{
				path: 'play1vsgame',
				element: <Player1vsLocal2D />,
			},
			{
				path: 'play2vsgame',
				element: <Player2vsLocal2D />,
			},
			{
				path: 'playspectator',
				element: <SpectatorMode2d />,
			},
			{
				path: 'login',
				element: <LoginPage />,
			},
			{
				path: 'signup',
				element: <SignupPage />,
			},
			{
				path: 'profile',
				element: (
					//<ProtectedRoute>
					<ProfilePage />
					//</ProtectedRoute>
				),
			},
			{
				path: 'privacy',
				element: <PrivacyPolicyPage />,
			},
			{
				path: 'terms',
				element: <TermsOfServicePage />,
			},
		]
	}
]



//creamos el router, llamaos a createBrowserROuter y le pasamos el array de router.
const router = createBrowserRouter(routes)

//se exporta para usarlo en main.tsx o app.tsx, 
// utlizamos RouterProvider... componente de React, que vigila las URL
// AppRouter es el componente que se encarga de habilitar el sistema de navegacion en la APP.
// y devuelve ROuterprovider, que es la libreria que que gestiona la URL y le pasa,os por prop las routes
// creadas antes con el componente CreateBrowserROutes(routes)
export function AppRouter() {
	return <RouterProvider router={router} />
}