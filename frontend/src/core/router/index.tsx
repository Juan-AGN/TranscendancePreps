// ┌────────────────────────────────────────────────────────────┐
// │                    core/router/index.tsx                   │
// ├────────────────────────────────────────────────────────────┤
// │ Main frontend routing configuration.                       │
// │                                                            │
// │ Responsibilities:                                          │
// │ - Define all application routes.                           │
// │ - Connect React Router with the app layout.                │
// │ - Validate dynamic route parameters.                       │
// │ - Redirect unknown routes to a safe page.                  │
// └────────────────────────────────────────────────────────────┘

//REACT ROUTER
import { createBrowserRouter, RouterProvider, useNavigate, useParams, Navigate } from "react-router-dom";
import type { RouteObject } from './types'

//SHARED LAYOUT
import { RootLayout } from '../../shared/components/layout/RootLayout';

//LANDING & SHARED PAGES
import { SplashScreen } from '../../shared/pages/IntroPage';
import { StartGate } from '../../shared/pages/MainPage';
import { Mainpage2 } from '../../shared/pages/SectionsPage';
import { PrivacyPolicyPage } from '../../shared/pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '../../shared/pages/TermsOfServicePage';
import { SettingsUiPage } from '../../shared/pages/SettingsUiPage';

//3D HUB PAGES
import { HomePage } from "../../game/ui/pages/HomePage";

//2D MENU AND GAME PAGES
import { Menu2DPage } from '../../ui2d/pages/Menu2DPage';
import { Game2DPage } from '../../ui2d/pages/Game2DPage';
import { Player1vsLocal2D } from '../../ui2d/pages/game2D/1PlayerLocal2d';
import { Player2vsLocal2D } from '../../ui2d/pages/game2D/2PlayerLocal2d';
import { SpectatorMode2d } from '../../ui2d/pages/game2D/NoPlayerLocal2d';

//2D SETTINGS PAGE
import { Settings2DPage } from '../../ui2d/pages/Settings2DPage';
import { GameSettings2DPage } from '../../ui2d/pages/settings/GameSettings2DPage';
import { DisplaySettings2DPage } from '../../ui2d/pages/settings/DisplaySettings2DPage';

//AUTHTENTICATION PAGES
import Login from '../../shared/pages/auth/Login';
import Profile from '../../shared/pages/auth/Profile';
import Friends from '../../shared/pages/auth/Friends';

//REMOTEGAME MULTIPLAYER
import { RemoteGame } from "../../shared/remote_game/RemoteGame"


const MAIN_SECTIONS = ['tech', '3d', 'arcade', 'creators'] as const;

type MainSection = (typeof MAIN_SECTIONS)[number];

// STEP 1==>: Validate section route parameters before rendering section pages.
function isMainSection(section: string | undefined): section is MainSection {
	return MAIN_SECTIONS.includes(section as MainSection);
}

// STEP 2==>: Render the selected main section or redirect invalid values.
function MainSectionsPage() {
	const navigate = useNavigate();
	const { section } = useParams<{ section: string }>();

	if (!isMainSection(section))
		return <Navigate to="/start" replace />;

	return (
		<Mainpage2
			selectedSection={section}
			onStart3D={() => navigate('/home')}
			onGo2DMenu={() => navigate('/menu2D')}/>
	);
}

// STEP 3==>: Create the start page callbacks used by the main landing menu.
function StartPage() {
	const navigate = useNavigate();
	return (
		<StartGate
			onStart3D={() => navigate('/home')}
			onGo2DMenu={() => navigate('/menu2D')}
			onGoTech={() => navigate('/sections/tech')}
			onGo3D={() => navigate('/sections/3d')}
			onGoArcade={() => navigate('/sections/arcade')}
			onGoCreators={() => navigate('/sections/creators')}/>
	)
}

// STEP 4==>: Define the full application route map.
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
				element: <HomePage />,
			},
			{
				path: 'game',
				element: <Game2DPage />,
			},
			/*{
				path: 'tournament',
				element: <Tournament2DPage />,
			},*/
			{
				path: 'settings',
				element: <Settings2DPage />,
			},
			{
				path: 'settingsUiPage',
				element: <SettingsUiPage />,
			},
			{
				path: 'gamesettings',
				element: <GameSettings2DPage />,
			},
			/*{
				path: 'audio',
				element: <AudioSettings2DPage />
			},*/
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
				element: <Login />,
			},
			{
				path: 'profile',
				element: <Profile />,
			},
			{
				path: 'friends',
				element: <Friends />,
			},
			{
				path: 'privacy',
				element: <PrivacyPolicyPage />,
			},
			{
				path: 'terms',
				element: <TermsOfServicePage />,
			},
			{
				path: 'remote-game',
				element: <RemoteGame />
			},
			{
				path: '*',
				element: <Navigate to="/start" replace />,
			},
		]
	}
];

// STEP 5 ==>: Create the browser router instance used by the app.
const router = createBrowserRouter(routes)

// STEP 6 ==> Provide the router to the React application.
export function AppRouter() {
	return <RouterProvider router={router} />
}

// ─────────────────────────────────────────────────────────────
// File summary
// This file centralizes the frontend navigation system. It defines the route map, validates dynamic section URLs,
// redirects invalid paths, and exposes AppRouter to the app.
// MD =====>:
// - RouteObject: Type used to describe each route.
// - createBrowserRouter: Creates the browser router from the route map.
// - RouterProvider: Enables React Router in the application.
// - Navigate: Redirects the user to another route.
// - useNavigate: Allows navigation from callbacks.
// - useParams: Reads dynamic URL parameters.
// - RootLayout: Shared layout used by the main pages.
// - AppRouter: Component that provides the router to the app.
