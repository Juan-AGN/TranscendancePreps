import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Header() {
	const [menuOpen, setMenuOpen] = useState(false)

	const toggleMenu = () => {
		setMenuOpen(!menuOpen)
	}

	const closeMenu = () => {
		setMenuOpen(false)
	}

	return (
		<>
			{/* header flotando arriba */}
			<header className="absolute top-0 left-0 z-50 w-full">
				<div className="flex items-center justify-between px-8 py-6 md:px-10">

					{/* logo izquierda */}
					<Link to="/start" onClick={closeMenu}>
						<img
							src="/"
							alt="logo"
							className="h-8 w-auto object-contain"
						/>
					</Link>

					{/* hamburguesa derecha */}
					<button
						onClick={toggleMenu}
						className="flex h-10 w-10 items-center justify-center cursor-pointer"
						aria-label="Abrir menu"
					>
						<div className="flex flex-col gap-[5px]">
							<span className="block h-[2px] w-6 bg-white"></span>
							<span className="block h-[2px] w-6 bg-white"></span>
							<span className="block h-[2px] w-6 bg-white"></span>
						</div>
					</button>
				</div>
			</header>

			{/* menu desplegable desde arriba, pero pequeño */}
			<div
				className={`fixed top-0 left-0 z-[70] w-full overflow-hidden bg-white transition-all duration-500 ${menuOpen ? 'h-[15vh] opacity-100' : 'h-0 opacity-0'
					}`}
			>
				{/* misma barra superior dentro del desplegable */}
				<div className="flex items-center justify-between px-8 py-6 md:px-10">
					<Link to="/start" onClick={closeMenu}>
						<img
							src="/msi-logo-black.png"
							alt="logo"
							className="h-8 w-auto object-contain"
						/>
					</Link>

					<button
						onClick={closeMenu}
						className="text-4xl leading-none text-black cursor-pointer"
						aria-label="Cerrar menu"
					>
						×
					</button>
				</div>

				{/* links en horizontal */}
				<nav className="flex items-center justify-center gap-10 px-8 pb-6">
					<Link
						to="/start"
						onClick={closeMenu}
						className="text-base font-medium text-black transition-opacity duration-200 hover:opacity-60"
					>
						Home
					</Link>

					<Link
						to="/tournament"
						onClick={closeMenu}
						className="text-base font-medium text-black transition-opacity duration-200 hover:opacity-60"
					>
						Tournament
					</Link>

					<Link
						to="/game"
						onClick={closeMenu}
						className="text-base font-medium text-black transition-opacity duration-200 hover:opacity-60"
					>
						Game
					</Link>

					<Link
						to="/settings"
						onClick={closeMenu}
						className="text-base font-medium text-black transition-opacity duration-200 hover:opacity-60"
					>
						Settings
					</Link>

					<Link
						to="/login"
						onClick={closeMenu}
						className="text-base font-medium text-black transition-opacity duration-200 hover:opacity-60"
					>
						Login
					</Link>
				</nav>
			</div>
		</>
	)
}