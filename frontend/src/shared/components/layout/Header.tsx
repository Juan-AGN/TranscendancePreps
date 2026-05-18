import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type Submenu = 'arcade' | 'about' | 'profile' | 'user' | null

const linkClass =
	'text-xs md:text-sm lg:text-base font-semibold tracking-wide text-white transition-all duration-200 hover:scale-105 hover:text-amber-300 hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]'

const menuLinkClass =
	'block rounded-lg px-3 py-2 text-sm font-medium text-white/95 transition-all duration-200 hover:scale-105 hover:bg-amber-400/15 hover:text-amber-200'

export function Header() {
	const [menuOpen, setMenuOpen] = useState(false)
	const [openSubmenu, setOpenSubmenu] = useState<Submenu>(null)
	const [langMenuOpen, setLangMenuOpen] = useState(false)
	const { t, i18n } = useTranslation()
	const userName = localStorage.getItem('userName');
	const isLogged = !!localStorage.getItem('token');

	const closeMenu = () => {
		setMenuOpen(false)
		setOpenSubmenu(null)
		setLangMenuOpen(false)
	}

	const toggleMenu = () => {
		setMenuOpen(!menuOpen)
		setOpenSubmenu(null)
		setLangMenuOpen(false)
	}

	const activeLanguage = i18n.resolvedLanguage ?? i18n.language

	const changeLanguage = (code: 'es' | 'en' | 'fr') => {
		i18n.changeLanguage(code)
		setLangMenuOpen(false)
	}

	const FlagLanguageButton = ({
		code,
		src,
		alt,
	}: {
		code: 'es' | 'en' | 'fr'
		src: string
		alt: string
	}) => (
		<button
			type="button"
			onClick={() => changeLanguage(code)}
			className={`block h-10 w-14 bg-transparent p-0 transition-all duration-200 hover:scale-105 ${activeLanguage?.startsWith(code)
				? 'drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]'
				: 'opacity-90 hover:opacity-100'
				}`}
			aria-label={`Cambiar idioma a ${alt}`}>
			<img src={src} alt={alt} className="h-full w-full object-contain" />
		</button>
	)

	const SubmenuButton = ({ name, id, children, }: {
		name: string, id: Exclude<Submenu, null>, children: React.ReactNode
	}) => (
		<div
			className="relative z-30"
			onMouseEnter={() => setOpenSubmenu(id)}
			onMouseLeave={() => setOpenSubmenu(null)} >
			<button
				type="button"
				onFocus={() => setOpenSubmenu(id)}
				className={`flex items-center gap-1  ${linkClass}`}
				aria-expanded={openSubmenu === id} >
				{name}
				<span
					className={`text-xs transition-transform duration-200 ${openSubmenu === id ? 'rotate-180' : ''
						}`}>
					▾
				</span>
			</button>

			<div
				className={`absolute left-1/2 top-full z-50 w-32 -translate-x-1/2 rounded-xl border border-white/20 bg-black/[0.62] p-2 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-200 ${openSubmenu === id
					? 'pointer-events-auto translate-y-0 opacity-100'
					: 'pointer-events-none -translate-y-2 opacity-0'}`}>
				{children}
			</div>
		</div>
	)

	return (
		<header
			className={`absolute left-0 top-0 z-[70] isolate w-full overflow-visible transition-all duration-500 ${menuOpen
				? 'bg-black/[0.12] border-b border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-2xl'
				: 'bg-transparent border-b border-transparent'}`}>
			<div className="relative flex items-center justify-between px-6 py-1 md:px-10 md:py-5">
				<Link to="/start" onClick={closeMenu}>
					<img src="/images/logo242.png"
						alt="logo"
						className="h-16 w-auto object-contain md:h-20" />
				</Link>

				<nav
					className={`absolute left-1/2 top-1/2 z-40 flex -translate-x-1/2 -translate-y-1/2 flex-wrap items-center justify-center gap-3 px-4 md:gap-6 lg:gap-10 transition-all duration-500 ${menuOpen
						? 'pointer-events-auto opacity-100'
						: 'pointer-events-none -translate-y-7 opacity-0'}`}>
					<Link to="/start" onClick={closeMenu} className={linkClass}>
						{t('header.home')}
					</Link>

					<Link to="/home" onClick={closeMenu} className={linkClass}>
						{t('header.world3d')}
					</Link>

					<SubmenuButton name={t('header.arcade')} id="arcade">
						<Link to="/game" onClick={closeMenu} className={menuLinkClass}>
							{t('header.game')}
						</Link>
						<Link to="/play1vsgame" onClick={closeMenu} className={menuLinkClass}>
							{t('header.quickPlay')}
						</Link>
					</SubmenuButton>

					<SubmenuButton name={t('header.about')} id="about">
						<Link to="/sections/tech" onClick={closeMenu} className={menuLinkClass}>
							{t('header.info')}
						</Link>
						<Link to="/sections/creators" onClick={closeMenu} className={menuLinkClass}>
							{t('header.creators')}
						</Link>
					</SubmenuButton>

					<Link to="/settingsUiPage" onClick={closeMenu} className={linkClass}>
						{t('header.settings')}
					</Link>

					{isLogged ? (
						<>
							<Link to="/profile" onClick={closeMenu} className={linkClass}>{t('header.profile')}</Link>

							<SubmenuButton name={userName ?? 'User'} id="user">
								<button
									type="button"
									onClick={() => {
										localStorage.removeItem('token');
										localStorage.removeItem('userId');
										localStorage.removeItem('userName');
										closeMenu();
										window.location.href = '/start';
									}}
									className={menuLinkClass}>
									Logout
								</button>
							</SubmenuButton>
						</>
					) : (
						<Link to="/login" onClick={closeMenu} className={linkClass}>Login</Link>
					)}


				</nav>

				<div className="flex items-center gap-2">
					<div
						className={`relative transition-all duration-300 ${menuOpen
							? 'pointer-events-auto opacity-100'
							: 'pointer-events-none opacity-0'
							}`}>
						<button
							type="button"
							onClick={() => setLangMenuOpen((prev) => !prev)}
							className="flex h-10 w-10 items-center mr-10 justify-center rounded-full border border-white/30 bg-black/20 text-white transition-all duration-200 hover:border-amber-300 hover:text-amber-200"
							aria-label="Cambiar idioma"
							aria-expanded={langMenuOpen}>
							<img
								src="/images/WorldLogo.png"
								alt="Selector de idioma"
								className="h-35 w-35 object-contain"
							/>
						</button>

						<div
							className={`absolute right-[calc(100%+0.5rem)] top-1/2  w-30 -translate-y-1/2 rounded-xl p-1 transition-all duration-300   ${langMenuOpen
								? 'pointer-events-auto opacity-100'
								: 'pointer-events-none opacity-0'
								}`}>
							<div className="flex flex-row items-center">
								<FlagLanguageButton code="en" src="/images/UkFlag.png" alt="English" />
								<FlagLanguageButton code="es" src="/images/spainFlag1.png" alt="Spanish" />
								<FlagLanguageButton code="fr" src="/images/frenchFlag.png" alt="French" />
							</div>
						</div>
					</div>

					<button
						onClick={toggleMenu}
						className="flex h-10 w-10 cursor-pointer items-center justify-center bg-black/10 border border-amber-300/55 rounded-full"
						aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}>
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
			</div>

			<div
				className={`pointer-events-none relative z-0 h-[2px] w-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_12px_rgba(0,0,0,0.55)] transition-all duration-700 ${menuOpen ? 'scale-x-100 opacity-100' : 'scale-x-90 opacity-0'}`} />
		</header>
	)
}