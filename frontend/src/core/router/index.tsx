
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

import { Menu2DPage } from '../../ui2d/pages/Menu2DPage'
import { Game2DPage } from "../../ui2d/pages/Game2DPage"
import { Tournament2DPage } from "../../ui2d/pages/Tournament2DPage"
import { Settings2DPage } from "../../ui2d/pages/Settings2DPage"

import { PrivacyPolicyPage } from "../../shared/pages/PrivacyPolicyPage"
import { TermsOfServicePage } from "../../shared/pages/TermsOfServicePage"

// Páginas de Auth
import { LoginPage } from "../../shared/auth/pages/LoginPage"
import { SignupPage } from "../../shared/auth/pages/SignupPage"
import { ProfilePage } from "../../shared/auth/pages/ProfilePage"
import { ProtectedRoute } from "../../shared/auth/components/ProtectedRoute"


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