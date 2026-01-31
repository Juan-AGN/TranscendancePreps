
//Bottonaso 3D

import { blackAndWhitePixelShader, NodeGeometryConnectionPoint, NodeRenderGraph, normalizeEnvInfo } from "@babylonjs/core"

// interface es un contrato q define q datos acepta este componente
interface Enter3DButtonProps {
    onClick: ()=> void // prop oblig, no devuelve nada, keremos que el boton ejecute una accion desde fuera (Stargate decide q hace)
    imgSrc?: string
    imgAlt?: string
    ringSrc?: string // imagen del anillo que envuelve el botón
}

export function Enter3DButton({
    onClick,
    imgSrc = '/WorldPong3D.png',
    imgAlt = 'Enter 3D',
    ringSrc = '/ring.png', // ruta de tu imagen de anillo
} : Enter3DButtonProps) { // aseguramos pasar el contrato
    return (
        <div className="relative inline-flex items-center justify-center">
            {/* Anillo que envuelve el botón */}
            {ringSrc && (
                <img
                    src={ringSrc}
                    alt="Ring decoration"
                    className="absolute pointer-events-none select-none"
                    style={{
                        objectFit: 'contain',
                        width: '30rem',
                        height: '30rem',
                        maxWidth: 'none',
                        scale: 1.4,
                        transformOrigin: '50% 50%',
                        animation: 'spin 8s linear infinite',
                        
                    }}
                />
            )}
            
            <button
                type="button"
                onClick={onClick}
                className="
                relative z-10
                w-full py-10
                rounded-2x1
                font-bold
                flex items-center
                justify-center
                transition-transform duration-500 ease-out
                hover:scale-105
                active: scale-95"
            >
                <img
                    src={imgSrc}
                    alt={imgAlt}
                    className="
                    w-90 h-90
                    rounded-full object-cover
                   "
                    style={{ objectPosition:'50% 26%'}}
                />
            </button>
        </div>
    )
}