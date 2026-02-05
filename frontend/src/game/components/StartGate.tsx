//stargate.tsx
import { Footer } from '../../shared/components/Footer'
import { Enter3DButton } from './Button3DWorld'


interface StartGateProps {
  onStart3D: () => void
  onGo2DMenu?: () => void
}

export function StartGate({ onStart3D, onGo2DMenu }: StartGateProps) {
  
  const handleSkip = () => {
    console.log('Skip button clicked')
    if (onGo2DMenu) {
      console.log('Calling onGo2DMenu')
      onGo2DMenu()
    } else {
      console.log('onGo2DMenu is undefined')
    }
  }

  return (
  	<div className="relative w-full h-[calc(100vh-88px)] flex flex-col">
    	{/* Centro */}
    	<div className="flex-1 flex items-center justify-center px-6">
			<div className="w-full max-w-xl text-center">
				<h1 className="text-5xl font-bold text-black mb-4">
					TRANSCENDENCE
				</h1>
				
				{/* Boton principal */}
				<div className ="animate-fade-in-up-pro delay-150">
					<Enter3DButton onClick={onStart3D} />
				</div>
				{/* Boton secundario */}
				<button
				type="button"
				onClick={handleSkip}
				className="mt-4 w-full py-3 rounded-2xl font-semibold text-black/90 border border-white/30 hover:bg-white/10 transition"
				>
					Skip it
				</button>
			</div>
      	</div>

      {/* Footer legal */}
      <Footer />
    </div>
  )
}
