
//importamos 2 herramientas desde la libreria RRD.
    //createBrowserRouter->para crear el objeto que gestiona la historia y las URLS
    //RouterProvider-> componente de React que conecta el enroutador con la interfaz visual.
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom"
// importa un tipo de Typescript, desde local tipes (decimos que propiedades debe tener un objeto de ruta (como path o element))
import type { RouteObject } from './types'
// Layout principal
import { RootLayout } from '../../shared/components/layout/RootLayout'
//Paginas a mdedida que las vamos creando poner aqui!
import { HomePage } from "../../game/pages/HomePage"
import { SplashScreen } from '../../game/components/SplashScreen'
import { StartGate } from '../../game/components/StartGate'
//import { Menu2DPage } from '../../ui2d/pages/Menu2DPage'

import { PrivacyPolicyPage } from "../../shared/pages/PrivacyPolicyPage"
import { TermsOfServicePage } from "../../shared/pages/TermsOfServicePage"




// componentes del menu


const GamePage = () => <div>Game Page</div>
const TournamentPage = () => <div>Tournament PAge</div>
const SettingsPage = () => <div>Settings Page</div>
const LoginPage = () => <div>Login Page</div>

// Página StartGate - usa useNavigate pa navegacion correcta
const StartPage = () => {
  const navigate = useNavigate()
  
  return (
    <StartGate
      onStart3D={() => navigate('/home')}
      onGo2DMenu={() => navigate('/menu2D')}
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
            /*{
                path: 'menu2D',
                element: <Menu2DPage />,
            },*/
            {
                path: 'home',
                element: <HomePage />,
            },
            {
                path: 'game',
                element: <GamePage />,
            },
            {
                path: 'tournament',
                element: <TournamentPage />,
            },
            {
                path: 'settings',
                element: <SettingsPage />,
            },
            {
                path: 'login',
                element: <LoginPage />
            },
            {
                path:'privacy',
                element: <PrivacyPolicyPage />,
            },
            {
                path:'terms',
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