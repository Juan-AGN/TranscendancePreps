import { useState } from 'react'
import { Link } from 'react-router-dom'

type Submenu = 'arcade' | 'about' | null

const linkClass =
	'text-base font-semibold tracking-wide text-white transition-all duration-200 hover:scale-105 hover:text-amber-300 hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'

const menuLinkClass =
	'block rounded-lg px-3 py-2 text-sm font-medium text-white/95 transition-all duration-200 hover:scale-105 hover:bg-amber-400/15 hover:text-amber-200'

export function Header() {
	const [menuOpen, setMenuOpen] = useState(false)
	const [openSubmenu, setOpenSubmenu] = useState<Submenu>(null)

	const closeMenu = () => {
		setMenuOpen(false)
		setOpenSubmenu(null)
	}

	const toggleMenu = () => {
		setMenuOpen(!menuOpen)
		setOpenSubmenu(null)
	}

	const SubmenuButton = ({
		name,
		id,
		children,
	}: {
		name: string
		id: Exclude<Submenu, null>
		children: React.ReactNode
	}) => (
		<div
			className="relative"
			onMouseEnter={() => setOpenSubmenu(id)}
			onMouseLeave={() => setOpenSubmenu(null)}
		>
			<button
				type="button"
				onFocus={() => setOpenSubmenu(id)}
				className={`flex items-center gap-1 ${linkClass}`}
				aria-expanded={openSubmenu === id}
			>
				{name}
				<span
					className={`text-xs transition-transform duration-200 ${
						openSubmenu === id ? 'rotate-180' : ''
					}`}
				>
					▾
				</span>
			</button>

			<div
				className={`absolute left-1/2 top-full z-20 w-32 -translate-x-1/2 rounded-xl border border-white/20 bg-black/[0.62] p-2 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-200 ${
					openSubmenu === id
						? 'pointer-events-auto translate-y-0 opacity-100'
						: 'pointer-events-none -translate-y-2 opacity-0'
				}`}
			>
				{children}
			</div>
		</div>
	)

	return (
		<header
			className={`absolute left-0 top-0 z-[70] w-full overflow-visible transition-all duration-500 ${
				menuOpen
					? 'bg-black/[0.12] border-b border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-2xl'
					: 'bg-transparent border-b border-transparent'
			}`}
		>
			<div className="relative flex items-center justify-between px-6 py-1 md:px-10 md:py-5">
				<Link to="/start" onClick={closeMenu}>
					<img
						src="/logo242.png"
						alt="logo"
						className="h-16 w-auto object-contain md:h-20"
					/>
				</Link>

				<nav
					className={`absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-10 transition-all duration-500 lg:flex ${
						menuOpen
							? 'pointer-events-auto opacity-100'
							: 'pointer-events-none -translate-y-7 opacity-0'
					}`}
				>
					<Link to="/start" onClick={closeMenu} className={linkClass}>
						Home
					</Link>

					<Link to="/home" onClick={closeMenu} className={linkClass}>
						3D World
					</Link>

					<SubmenuButton name="Arcade" id="arcade">
						<Link to="/game" onClick={closeMenu} className={menuLinkClass}>
							Game
						</Link>
						<Link to="/play1vsgame" onClick={closeMenu} className={menuLinkClass}>
							Quick Play
						</Link>
					</SubmenuButton>

					<SubmenuButton name="About" id="about">
						<Link to="/sections/tech" onClick={closeMenu} className={menuLinkClass}>
							Info
						</Link>
						<Link to="/sections/creators" onClick={closeMenu} className={menuLinkClass}>
							Creators
						</Link>
					</SubmenuButton>

					<Link to="/settings" onClick={closeMenu} className={linkClass}>
						Settings
					</Link>

					<Link to="/login" onClick={closeMenu} className={linkClass}>
						Login
					</Link>
				</nav>

				<button
					onClick={toggleMenu}
					className="flex h-10 w-10 cursor-pointer items-center justify-center bg-black/10 border border-amber-300/55 rounded-full"
					aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
				>
					{menuOpen ? (
						<span className=" relative -top-[5px] text-5xl leading-none text-white">×</span>
					) : (
						<div className="flex flex-col gap-[5px]">
							<span className="block h-[2px] w-6 bg-white" />
							<span className="block h-[2px] w-6 bg-white" />
							<span className="block h-[2px] w-6 bg-white" />
						</div>
					)}
				</button>
			</div>

			<div
				className={`pointer-events-none h-[2px] w-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_12px_rgba(0,0,0,0.55)] transition-all duration-700 ${
					menuOpen ? 'scale-x-100 opacity-100' : 'scale-x-90 opacity-0'
				}`}
			/>
		</header>
	)
}