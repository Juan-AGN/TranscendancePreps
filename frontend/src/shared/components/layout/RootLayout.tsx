import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function RootLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-stone-100 dark:bg-neutral-950 transition-colors duration-300">
      {/* Header fijo en todas las páginas */}
      <Header />
      
      {/* Contenedor de contenido de cada página */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}