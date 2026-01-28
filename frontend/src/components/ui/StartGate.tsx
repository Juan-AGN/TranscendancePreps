interface StartGateProps {
  onStart3D: () => void
  onGo2DMenu?: () => void
}

export function StartGate({ onStart3D, onGo2DMenu }: StartGateProps) {
  return (
    <div className="relative w-full h-[calc(100vh-88px)] flex flex-col">
      {/* Centro */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-5xl font-bold text-black mb-4">
            TRANSCENDENCE 42
          </h1>

          {/* Boton principal */}
          <button
            type="button"
            onClick={onStart3D}
            className="w-full py-4 rounded-2xl font-bold text-lg bg-white text-black hover:opacity-90 transition"
          >
            ENTER 3D WORLD
          </button>

          {/* Boton secundario */}
          <button
            type="button"
            onClick={onGo2DMenu}
            className="mt-4 w-full py-3 rounded-2xl font-semibold text-black/90 border border-white/30 hover:bg-white/10 transition"
          >
            Skip it
          </button>
        </div>
      </div>

      {/* Footer legal */}
      <footer className="w-full px-6 py-4 text-sm text-black/60 flex items-center justify-center gap-6 border-t border-white/10">
        <a href="/privacy" className="hover:text-black transition">Privacy Policy</a>
        <a href="/terms" className="hover:text-black transition">Terms of Service</a>
      </footer>
    </div>
  )
}
