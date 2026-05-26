import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { ChatWidget } from '../chat/ChatWidget'
import { useEffect } from 'react'

function useSetOfflineOnClose() {
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")

    // Si no hay sesión, no hacemos nada
    if (!token || !userId) return

    const url = `/api/auth/users/${userId}/status`

    const handler = () => {
      // keepalive permite que la request se intente enviar al cerrar pestaña
      fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ onlineStatus: false }),
        keepalive: true,
      }).catch(() => {})
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])
}

export function RootLayout() {
  useSetOfflineOnClose()

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-stone-100 dark:bg-neutral-950 transition-colors duration-300">
      {/* Header fijo en todas las páginas */}
      <Header />

      {/* Contenedor de contenido de cada página */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* Chat global */}
      <ChatWidget />
    </div>
  )
}