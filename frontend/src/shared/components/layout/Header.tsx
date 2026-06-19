// ┌────────────────────────────────────────────────────────────┐
// │                         Header.tsx                         │
// ├────────────────────────────────────────────────────────────┤
// │ Global navigation header for the frontend application.     │
// │ It manages the responsive menu, language selector, user    │
// │ submenu, session links and logout action.                  │
// └────────────────────────────────────────────────────────────┘
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { clearSession } from '../../pages/auth/session';

// STEP 2: Define the submenu type used by the desktop user menu.
type Submenu = 'user' | null;

// STEP 3: Define shared Tailwind classes used by desktop, submenu and mobile links.
const linkClass =
	'text-xs md:text-sm lg:text-base font-semibold tracking-wide text-white transition-all duration-200 hover:scale-105 hover:text-amber-300 hover:drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]';

const menuLinkClass =
	'block rounded-lg px-3 py-2 text-sm font-medium text-white/95 transition-all duration-200 hover:scale-105 hover:bg-amber-400/15 hover:text-amber-200';

const mobileLinkClass =
	'rounded-md px-2 py-[0.38rem] text-center text-[0.62rem] font-semibold tracking-[0.05rem] text-white/95 transition-all duration-200 hover:bg-amber-400/15 hover:text-amber-200';

// ════════ COMPONENT: Header: Render the global responsive navigation header. ════════
export function Header() {
	// Step 1: Create the local UI states used by the header menus.
	const [menuOpen, setMenuOpen] = useState(false)
	const [openSubmenu, setOpenSubmenu] = useState<Submenu>(null)
	const [langMenuOpen, setLangMenuOpen] = useState(false)

	// Step 2: Load translation helpers and read the current stored session.
	const { t, i18n } = useTranslation()
	const userName = localStorage.getItem('userName');
	const isLogged = !!localStorage.getItem('token');

	// Step 3: Detect touch devices to avoid hover-only submenu behavior.
	const isTouchDevice = typeof window !== 'undefined'
		? window.matchMedia('(hover: none), (pointer: coarse)').matches
		: false;

	// ════════ FCT: closeMenu: Close all header menus. ════════
	const closeMenu = () => {
		setMenuOpen(false);
		setOpenSubmenu(null);
		setLangMenuOpen(false);
	}

	// ════════ FCT: toggleMenu: Open or close the main navigation menu. ════════
	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
		setOpenSubmenu(null);
		setLangMenuOpen(false);
	}

	// ════════ FCT: toggleSubmenu: Open or close a submenu on touch devices. ════════
	const toggleSubmenu = (id: Exclude<Submenu, null>) => {
		setOpenSubmenu((prev) => (prev === id ? null : id));
	}

	// Step 4: Resolve the currently active language.
	const activeLanguage = i18n.resolvedLanguage ?? i18n.language;

	// ════════ FCT: changeLanguage: Change the active i18n language. ════════
	const changeLanguage = (code: 'es' | 'en' | 'fr') => {
		i18n.changeLanguage(code);
		setLangMenuOpen(false);
	}

	// ════════ COMPONENT: FlagLanguageButton: Render one flag button for language switching. ════════
	const FlagLanguageButton = ({ code, src, alt, }: {
		code: 'es' | 'en' | 'fr';
		src: string;
		alt: string;
	}) => (
		<button
			type="button"
			onClick={() => changeLanguage(code)}
			className={`block h-5 w-7 md:h-7 md:w-10 bg-transparent p-0 transition-all duration-200 hover:scale-105 ${activeLanguage?.startsWith(code)
				? 'drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]'
				: 'opacity-90 hover:opacity-100'
				}`}
			aria-label={t('header.languageChangeTo', { language: alt })}>
			<img src={src} alt={alt} className="h-full w-full object-contain" />
		</button>
	)

	// ════════ COMPONENT: SubmenuButton: Render a desktop submenu controlled by hover or touch. ════════
	const SubmenuButton = ({ name, id, children, }: {
		name: string, id: Exclude<Submenu, null>, children: ReactNode
	}) => (
		<div
			className="relative z-30"
			onMouseEnter={() => {
				if (!isTouchDevice)
					setOpenSubmenu(id);
			}}
			onMouseLeave={() => {
				if (!isTouchDevice)
					setOpenSubmenu(null);
			}} >
			<button
				type="button"
				onFocus={() => {
					if (!isTouchDevice)
						setOpenSubmenu(id);
				}}
				onClick={() => {
					if (isTouchDevice)
						toggleSubmenu(id);
				}}
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
				? 'pointer-events-auto bg-black/[0.12]  border-b border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.2)] backdrop-blur-2xl'
				: 'pointer-events-none bg-transparent border-b border-transparent'}`}>
			<div className="relative flex pointer-events-none items-center justify-between px-6 py-1 md:px-10 md:py-5">
				<Link to="/start" onClick={closeMenu} className="-ml-2 pointer-events-auto md:-ml-1 lg:ml-0">
					<img src="/images/InitTranscendenceIcon.png"
						alt="logo"
						className="h-12 w-auto object-contain md:h-14 lg:h-20" />
				</Link>

				<nav
					className={`absolute left-1/2 top-1/2 z-40 hidden -translate-x-1/2 -translate-y-1/2 flex-wrap items-center justify-center content-center
							 gap-x-3 gap-y-2 px-2 text-center sm:flex sm:w-auto sm:max-w-none sm:gap-5 sm:px-4 lg:gap-10 transition-all duration-500 ${menuOpen
							? 'pointer-events-auto opacity-100'
							: 'pointer-events-none -translate-y-7 opacity-0'}`}>

					<Link to="/home" onClick={closeMenu} className={linkClass}>
						{t('header.world3d')}
					</Link>

					<Link to="/game" onClick={closeMenu} className={linkClass}>
						{t('header.game')}
					</Link>

					<Link to="/sections/tech" onClick={closeMenu} className={linkClass}>
						{t('header.info')}
					</Link>

					<Link to="/sections/creators" onClick={closeMenu} className={linkClass}>
						{t('header.creators')}
					</Link>


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
										clearSession();
										closeMenu();
										window.location.href = '/start';
									}}
									className={menuLinkClass}>
									{t('header.logout')}
								</button>
							</SubmenuButton>
						</>
					) : (
						<Link to="/login" onClick={closeMenu} className={linkClass}>{t('header.login')}</Link>
					)}
				</nav>

				<nav
					className={`absolute left-1/2 top-full z-[90] w-[calc(100vw-1rem)] max-w-[22rem] -translate-x-1/2 rounded-xl border border-yellow-400/40 bg-black/[0.55]
							px-1 py-1 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300 sm:hidden ${menuOpen
							? 'pointer-events-auto translate-y-0 opacity-100'
							: 'pointer-events-none -translate-y-2 opacity-0'}`}>
					<div className="grid grid-cols-4 items-center">

						<Link to="/home" onClick={closeMenu} className={mobileLinkClass}>
							3D
						</Link>

						<Link to="/game" onClick={closeMenu} className={mobileLinkClass}>
							{t('header.arcade')}
						</Link>

						<Link to="/sections/tech" onClick={closeMenu} className={mobileLinkClass}>
							{t('header.info')}
						</Link>

						<Link to="/settingsUiPage" onClick={closeMenu} className={mobileLinkClass}>
							{t('header.settings')}
						</Link>

						<Link to="/sections/creators" onClick={closeMenu} className={mobileLinkClass}>
							{t('header.creators')}
						</Link>

						{isLogged ? (
							<Link to="/profile" onClick={closeMenu} className={mobileLinkClass}>
								{t('header.profile')}
							</Link>
						) : (
							<Link to="/login" onClick={closeMenu} className={mobileLinkClass}>
								{t('header.login')}
							</Link>
						)}

						{isLogged ? (
							<button
								type="button"
								onClick={() => {
									clearSession()
									closeMenu()
									window.location.href = '/start'
								}}
								className={mobileLinkClass}>
								{t('header.logout')}
							</button>
						) : (
							<span className="hidden" />
						)}
					</div>
				</nav>

				<div className="relative z-[80] flex pointer-events-auto items-center gap-1 -mr-1 md:gap-2 md:mr-0">
					<div
						className={`relative transition-all duration-300 ${menuOpen
							? 'pointer-events-auto opacity-100'
							: 'pointer-events-none opacity-0'}`}>
						<button
							type="button"
							onClick={() => setLangMenuOpen((prev) => !prev)}
							className="flex h-7 w-7 md:h-9 md:w-9 items-center mr-0 md:mr-3 justify-center rounded-full border border-white/30 bg-black/20 text-white transition-all duration-200
								hover:border-amber-300 hover:text-amber-200"
							aria-label={t('header.languageSwitch')}
							aria-expanded={langMenuOpen}>
							<img
								src="/images/WorldLogo.png"
								alt="Selector de idioma"
								className="h-4 w-4 md:h-6 md:w-6 object-contain" />
						</button>

						<div
							className={`absolute right-[calc(100%+0.35rem)] top-1/2 z-[90] w-auto -translate-y-1/2 rounded-xl border border-white/20 bg-black/[0.72]
									p-1 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300
									sm:right-0 sm:top-full sm:mt-2 sm:translate-y-0 lg:right-[calc(100%+0.35rem)] lg:top-1/2 lg:mt-0 lg:-translate-y-1/2 ${langMenuOpen
									? 'pointer-events-auto opacity-100'
									: 'pointer-events-none opacity-0'}`}>
							<div className="flex flex-row items-center gap-0 sm:flex-col sm:gap-1 lg:flex-row lg:gap-0">
								<FlagLanguageButton code="en" src="/images/UkFlag.png" alt="English" />
								<FlagLanguageButton code="es" src="/images/spainFlag1.png" alt="Spanish" />
								<FlagLanguageButton code="fr" src="/images/frenchFlag.png" alt="French" />
							</div>
						</div>
					</div>

					<button
						type="button"
						onClick={toggleMenu}
						className="flex h-7 w-7 md:h-10 md:w-10 cursor-pointer items-center justify-center bg-black/10 border border-amber-300/55 rounded-full"
						aria-label={menuOpen ? t('header.closeMenu') : t('header.openMenu')}
						aria-expanded={menuOpen}>
						{menuOpen ? (
							<span className=" relative -top-[2px] md:-top-[5px] text-2xl md:text-5xl leading-none text-white">×</span>
						) : (
							<div className="flex flex-col gap-[2px] md:gap-[5px]">
								<span className="block h-[2px] w-3 md:w-6 bg-white" />
								<span className="block h-[2px] w-3 md:w-6 bg-white" />
								<span className="block h-[2px] w-3 md:w-6 bg-white" />
							</div>
						)}
					</button>
				</div>
			</div>
			<div className={`pointer-events-none relative z-0 h-[2px] w-full bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_12px_rgba(0,0,0,0.55)]
				transition-all duration-700 ${menuOpen ? 'scale-x-100 opacity-100' : 'scale-x-90 opacity-0'}`} />
		</header>
	)
}