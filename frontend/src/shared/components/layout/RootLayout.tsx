import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function RootLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header fijo en todas las páginas */}
      <Header />
      
      {/* Contenedor de contenido de cada página */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}