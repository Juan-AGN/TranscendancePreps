import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header fijo en todas las páginas */}
      <Header />
      
      {/* Contenedor de contenido de cada página */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}