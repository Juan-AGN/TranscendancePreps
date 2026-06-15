// ┌────────────────────────────────────────────────────────────┐
// │                    SettingsUiPage.tsx                      │
// ├────────────────────────────────────────────────────────────┤
// │ User interface settings page for visual, social and system │
// │ preferences.                                               │
// └────────────────────────────────────────────────────────────┘
import type { ReactNode } from "react";
import { OlympusButton } from "../components/Buttons/ProfileButton";
import { Palette, Bell, Monitor, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { OptionButton, FlagOptionButton, ToggleButton } from "../components/Buttons/SettingsUiButtons";
import { useTranslation } from 'react-i18next';
import { useAudioStore } from "../store/audioStore";


type ActiveTab = 'general' | 'social' | 'environment' | 'system';
type ThemeMode = "light" | "dark";
type TextSize = "small" | "medium" | "large";
type Language = "english" | "spanish" | "french";
type ProfileVisibility = "public" | "private";

// ════════ COMPONENT: SettingsUiPage: Render the UI settings screen. ════════
export function SettingsUiPage() {
	const { t, i18n } = useTranslation();
	const [activeTab, setActiveTab] = useState<ActiveTab>('general');
	const [themeMode, setThemeMode] = useState<ThemeMode>(
		() => (localStorage.getItem("theme") as ThemeMode) ?? "light"
	);
	const [textSize, setTextSize] = useState<TextSize>(
		() => (localStorage.getItem("textSize") as TextSize) ?? "medium"
	);
	const [language, setLanguage] = useState<Language>(() => {
		const map: Record<string, Language> = {
			en: "english",
			es: "spanish",
			fr: "french",
		};

		return map[i18n.resolvedLanguage ?? "en"] ?? "english";
	});

	const [friendNotifications, setFriendNotifications] = useState(true);
	const [matchNotifications, setMatchNotifications] = useState(true);
	const [profileVisibility, setProfileVisibility] = useState<ProfileVisibility>("public");
	const { masterVolume, effectsSound, setMasterVolume, setEffectsSound } = useAudioStore();

	// STEP 1: Restore the saved text size when the page is mounted.
	useEffect(() => {
		const savedTextSize = localStorage.getItem("textSize") ?? "medium";

		document.documentElement.dataset.fontSize = savedTextSize;
	}, []);

	// STEP 2: Update and persist the selected theme mode.
	const handleThemeChange = (mode: ThemeMode) => {
		setThemeMode(mode);
		document.documentElement.dataset.theme = mode;
		localStorage.setItem("theme", mode);
	};

	// STEP 3: Update and persist the selected text size.
	const handleTextSize = (size: TextSize) => {
		setTextSize(size);
		document.documentElement.dataset.fontSize = size;
		localStorage.setItem("textSize", size);
	};

	// STEP 4: Update the visible language through i18n.
	const handleLanguage = (selectedLanguage: Language) => {
		const map = {
			english: "en",
			spanish: "es",
			french: "fr",
		} as const;

		setLanguage(selectedLanguage);
		i18n.changeLanguage(map[selectedLanguage]);
	};

	return (
		<div
			className="relative min-h-screen bg-cover bg-center bg-no-repeat px-4 pb-6 pt-32 md:px-6"
			style={{ backgroundImage: "url('/images/bg6.png')" }}>
			<div className="hidden dark:block absolute inset-0 bg-black/70 pointer-events-none" />
			<div className="relative z-10 mx-auto min-h-[65vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-yellow-500/45 bg-white/70 dark:bg-white/[0.07]
							backdrop-blur-[50px] shadow-[0_20px_80px_rgba(90,60,20,0.25),inset_0_1px_0_rgba(255,255,255,0.45)] transition-colors duration-300">
				<div className="mt-6 w-full overflow-hidden px-2 text-center font-['Cormorant_Garamond'] text-[2.15rem] font-medium uppercase leading-none tracking-[0.10em] text-[#a67c42]
							sm:text-5xl sm:tracking-[0.18em] md:mt-8 md:text-6xl md:tracking-[0.32em]">
					{t('settingsPage.title')}
				</div>
				<div className="mt-8 flex flex-wrap justify-center gap-3">
					<OlympusButton onClick={() => setActiveTab('general')}>
						<Palette size={15} strokeWidth={2.2} className="text-yellow-700" />
						<span>{t('settingsPage.tabs.general')}</span>
					</OlympusButton>

					<OlympusButton onClick={() => setActiveTab('social')}>
						<Bell size={15} strokeWidth={2.2} className="text-yellow-700" />
						<span>{t('settingsPage.tabs.social')}</span>
					</OlympusButton>

					<OlympusButton onClick={() => setActiveTab('environment')}>
						<Monitor size={15} strokeWidth={2.2} className="text-yellow-700" />
						<span>{t('settingsPage.tabs.environment')}</span>
					</OlympusButton>

					<OlympusButton onClick={() => setActiveTab('system')}>
						<Info size={15} strokeWidth={2.2} className="text-yellow-700" />
						<span>{t('settingsPage.tabs.system')}</span>
					</OlympusButton>
				</div>

				{/* ════════ SECTION: General settings. ════════ */}
				{activeTab === 'general' && (
					<section className="mx-auto mt-8 w-full max-w-4xl space-y-4 px-6 pb-10">
						<p className="text-center text-sm text-black/60">
							{t('settingsPage.general.subtitle')}
						</p>

						<SettingRow
							title={t('settingsPage.general.theme.title')}
							description={t('settingsPage.general.theme.desc')}>
							<div className="flex w-full flex-wrap gap-1 rounded-2xl border border-yellow-500/30 bg-white/20 p-1 sm:w-auto sm:flex-nowrap sm:rounded-full">
								<OptionButton active={themeMode === 'light'} onClick={() => handleThemeChange('light')}>
									{t('settingsPage.general.theme.light')}
								</OptionButton>
								<OptionButton active={themeMode === 'dark'} onClick={() => handleThemeChange('dark')}>
									{t('settingsPage.general.theme.dark')}
								</OptionButton>
							</div>
						</SettingRow>

						<SettingRow
							title={t('settingsPage.general.textSize.title')}
							description={t('settingsPage.general.textSize.desc')}>
							<div className="flex w-full flex-wrap gap-1 rounded-2xl border border-yellow-500/30 bg-white/20 p-1 sm:w-auto sm:flex-nowrap sm:rounded-full">
								<OptionButton active={textSize === 'small'} onClick={() => handleTextSize('small')}>
									{t('settingsPage.general.textSize.small')}
								</OptionButton>
								<OptionButton active={textSize === 'medium'} onClick={() => handleTextSize('medium')}>
									{t('settingsPage.general.textSize.medium')}
								</OptionButton>
								<OptionButton active={textSize === 'large'} onClick={() => handleTextSize('large')}>
									{t('settingsPage.general.textSize.large')}
								</OptionButton>
							</div>
						</SettingRow>

						<SettingRow
							title={t('settingsPage.general.language.title')}
							description={t('settingsPage.general.language.desc')}>
							<div className="flex w-full flex-wrap items-center gap-2 rounded-2xl border border-yellow-500/30 bg-white/20 p-2 sm:w-auto">
								<FlagOptionButton
									active={language === 'english'}
									onClick={() => handleLanguage('english')}
									label="English"
									src="/images/UkFlag.png"
									alt="English" />
								<FlagOptionButton
									active={language === 'spanish'}
									onClick={() => handleLanguage('spanish')}
									label="Spanish"
									src="/images/spainFlag1.png"
									alt="Spanish" />
								<FlagOptionButton
									active={language === 'french'}
									onClick={() => handleLanguage('french')}
									label="French"
									src="/images/frenchFlag.png"
									alt="French" />
							</div>
						</SettingRow>
					</section>
				)}

				{/* ════════ SECTION: Social settings. ════════ */}
				{activeTab === 'social' && (
					<section className="mx-auto mt-8 w-full max-w-4xl space-y-4 px-6 pb-10">
						<p className="text-center text-sm text-black/60">
							{t('settingsPage.social.subtitle')}
						</p>

						<SettingRow
							title={t('settingsPage.social.friends.title')}
							description={t('settingsPage.social.friends.desc')}>
							<ToggleButton enabled={friendNotifications} onClick={() => setFriendNotifications(!friendNotifications)} />
						</SettingRow>

						<SettingRow
							title={t('settingsPage.social.match.title')}
							description={t('settingsPage.social.match.desc')}>
							<ToggleButton enabled={matchNotifications} onClick={() => setMatchNotifications(!matchNotifications)} />
						</SettingRow>

						<SettingRow
							title={t('settingsPage.social.visibility.title')}
							description={t('settingsPage.social.visibility.desc')}>
							<div className="flex w-full flex-wrap gap-1 rounded-2xl border border-yellow-500/30 bg-white/20 p-1 sm:w-auto sm:flex-nowrap sm:rounded-full">
								<OptionButton active={profileVisibility === 'public'} onClick={() => setProfileVisibility('public')}>
									{t('settingsPage.social.visibility.public')}
								</OptionButton>
								<OptionButton active={profileVisibility === 'private'} onClick={() => setProfileVisibility('private')}>
									{t('settingsPage.social.visibility.private')}
								</OptionButton>
							</div>
						</SettingRow>
					</section>
				)}

				{/* ════════ SECTION: Environment settings. ════════ */}
				{activeTab === 'environment' && (
					<section className="mx-auto mt-8 w-full max-w-4xl space-y-4 px-6 pb-10">
						<p className="text-center text-sm text-black/60">
							{t('settingsPage.environment.subtitle')}
						</p>

						<SettingRow
							title={t('settingsPage.environment.volume.title')}
							description={t('settingsPage.environment.volume.desc')}>
							<div className="w-full max-w-xs">
								<div className="mb-2 text-right text-xs font-bold uppercase text-yellow-800/75">
									{masterVolume}%
								</div>
								<input
									type="range"
									min={0}
									max={100}
									step={1}
									value={masterVolume}
									onChange={(event) => setMasterVolume(Number(event.target.value))}
									className="h-2 w-full cursor-pointer appearance-none rounded-full bg-yellow-200/45" />
							</div>
						</SettingRow>

						<SettingRow
							title={t('settingsPage.environment.effects.title')}
							description={t('settingsPage.environment.effects.desc')}>
							<ToggleButton enabled={effectsSound} onClick={() => setEffectsSound(!effectsSound)} />
						</SettingRow>
					</section>
				)}

				{/* ════════ SECTION: System settings. ════════ */}
				{activeTab === 'system' && (
					<section className="mx-auto mt-8 w-full max-w-4xl space-y-4 px-6 pb-10">
						<p className="text-center text-sm text-black/60">
							{t('settingsPage.system.subtitle')}
						</p>

						<SettingRow
							title={t('settingsPage.system.version.title')}
							description={t('settingsPage.system.version.desc')}>
							<span className="rounded-full bg-white/20 px-5 py-2 text-xs font-bold uppercase text-black/55">
								v1.0
							</span>
						</SettingRow>

						<SettingRow
							title={t('settingsPage.system.server.title')}
							description={t('settingsPage.system.server.desc')}>
							<span className="rounded-full bg-emerald-400/20 px-5 py-2 text-xs font-bold uppercase text-emerald-700">
								{t('settingsPage.system.server.connected')}
							</span>
						</SettingRow>
					</section>
				)}
			</div>
		</div>
	);
}

// ════════ COMPONENT: SettingRow: Render one reusable settings row. ════════
function SettingRow({ title, description, children, }: {
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<div className="rounded-2xl border border-yellow-500/25 bg-white/80 dark:bg-white/10 p-5 backdrop-blur-md transition-colors duration-300">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
				<div>
					<h3 className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-700/70">
						{title}
					</h3>
					<p className="mt-5 text-xs text-black/45">
						{description}
					</p>
				</div>

				<div className="w-full md:w-auto">
					{children}
				</div>
			</div>
		</div>
	);
}

