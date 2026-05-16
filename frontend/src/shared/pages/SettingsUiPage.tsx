import { OlympusButton } from "../components/Buttons/ProfileButton"
import { Palette, Bell, Monitor, Info } from 'lucide-react';
import { useState } from 'react';
import { OptionButton, FlagOptionButton, ToggleButton } from "../components/Buttons/SettingsUiButtons";

type ActiveTab = 'general' | 'social' | 'environment' | 'system';

export function SettingsUiPage() {
	const [activeTab, setActiveTab] = useState<ActiveTab>('general');
	const [themeMode, setThemeMode] = useState<'light' | 'dark' >('light');
	const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
	const [language, setLanguage] = useState<'english' | 'spanish' | 'french'>('english');
	const [friendNotifications, setFriendNotifications] = useState(true);
	const [matchNotifications, setMatchNotifications] = useState(true);
	const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');
	const [masterVolume, setMasterVolume] = useState(70);
	const [effectsSound, setEffectsSound] = useState(true);

	return (
		<div
			className="min-h-screen bg-cover bg-center bg-no-repeat px-4 pb-6 pt-32 md:px-6"
			style={{ backgroundImage: "url('/bg6.png')" }}>
			<div className="mx-auto min-h-[65vh] w-full max-w-6xl overflow-hidden rounded-3xl border border-yellow-500/45 bg-white/[0.07]
							backdrop-blur-[50px] shadow-[0_20px_80px_rgba(90,60,20,0.25),inset_0_1px_0_rgba(255,255,255,0.45)]">
				<div className="mt-8 text-center text-6xl font-medium text-[#a67c42] font-['Cormorant_Garamond'] uppercase tracking-[0.32em] md:text-6xl">
					Settings
				</div>
				<div className="mt-8 flex flex-wrap justify-center gap-3">
					<OlympusButton onClick={() => setActiveTab('general')}>
						<Palette size={15} strokeWidth={2.2} className="text-yellow-700" />
						<span>General</span>
					</OlympusButton>

					<OlympusButton onClick={() => setActiveTab('social')}>
						<Bell size={15} strokeWidth={2.2} className="text-yellow-700" />
						<span>Social</span>
					</OlympusButton>

					<OlympusButton onClick={() => setActiveTab('environment')}>
						<Monitor size={15} strokeWidth={2.2} className="text-yellow-700" />
						<span>Environment</span>
					</OlympusButton>

					<OlympusButton onClick={() => setActiveTab('system')}>
						<Info size={15} strokeWidth={2.2} className="text-yellow-700" />
						<span>System</span>
					</OlympusButton>
				</div>

				{/* GENERAL */}
				{activeTab === 'general' && (
					<section className="mx-auto mt-8 w-full max-w-4xl space-y-4 px-6 pb-10">
						<p className="text-center text-sm text-black/60">
							General application preferences
						</p>

						<SettingRow
							title="Theme Mode"
							description="Choose between lightor dark">
							<div className="flex rounded-full border border-yellow-500/30 bg-white/20 p-1">
								<OptionButton active={themeMode === 'light'} onClick={() => setThemeMode('light')}>
									Light
								</OptionButton>
								<OptionButton active={themeMode === 'dark'} onClick={() => setThemeMode('dark')}>
									Dark
								</OptionButton>
							</div>
						</SettingRow>

						<SettingRow
							title="Text Size"
							description="Choose small, medium or large text across the interface.">
							<div className="flex rounded-full border border-yellow-500/30 bg-white/20 p-1">
								<OptionButton active={textSize === 'small'} onClick={() => setTextSize('small')}>
									Small
								</OptionButton>
								<OptionButton active={textSize === 'medium'} onClick={() => setTextSize('medium')}>
									Medium
								</OptionButton>
								<OptionButton active={textSize === 'large'} onClick={() => setTextSize('large')}>
									Large
								</OptionButton>
							</div>
						</SettingRow>

						<SettingRow
							title="Language"
							description="Select the language used across Transcendence.">
							<div className="flex flex-wrap items-center gap-2 rounded-2xl border border-yellow-500/30 bg-white/20 p-2">
								<FlagOptionButton
									active={language === 'english'}
									onClick={() => setLanguage('english')}
									label="English"
									src="/UkFlag.png"
									alt="English"/>
								<FlagOptionButton
									active={language === 'spanish'}
									onClick={() => setLanguage('spanish')}
									label="Spanish"
									src="/spainFlag1.png"
									alt="Spanish"/>
								<FlagOptionButton
									active={language === 'french'}
									onClick={() => setLanguage('french')}
									label="French"
									src="/frenchFlag.png"
									alt="French"/>
							</div>
						</SettingRow>
					</section>
				)}

				{/* SOCIAL */}
				{activeTab === 'social' && (
					<section className="mx-auto mt-8 w-full max-w-4xl space-y-4 px-6 pb-10">
						<p className="text-center text-sm text-black/60">
							Manage your social activity and privacy
						</p>

						<SettingRow
							title="Friend Requests"
							description="Receive notifications when someone sends you a friend request.">
							<ToggleButton enabled={friendNotifications} onClick={() => setFriendNotifications(!friendNotifications)} />
						</SettingRow>

						<SettingRow
							title="Match Invitations"
							description="Get notified when another player invites you to play.">
							<ToggleButton enabled={matchNotifications} onClick={() => setMatchNotifications(!matchNotifications)} />
						</SettingRow>

						<SettingRow
							title="Profile Visibility"
							description="Choose whether your profile is visible to other players.">
							<div className="flex rounded-full border border-yellow-500/30 bg-white/20 p-1">
								<OptionButton active={profileVisibility === 'public'} onClick={() => setProfileVisibility('public')}>
									Public
								</OptionButton>
								<OptionButton active={profileVisibility === 'private'} onClick={() => setProfileVisibility('private')}>
									Private
								</OptionButton>
							</div>
						</SettingRow>
					</section>
				)}

				{/* ENVIRONMENT */}
				{activeTab === 'environment' && (
					<section className="mx-auto mt-8 w-full max-w-4xl space-y-4 px-6 pb-10">
						<p className="text-center text-sm text-black/60">
							Adjust the visual and sound behavior of the interface
						</p>

						<SettingRow
							title="Master Volume"
							description="Control overall game and interface sound level.">
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
									className="h-2 w-full cursor-pointer appearance-none rounded-full bg-yellow-200/45"/>
							</div>
						</SettingRow>

						<SettingRow
							title="Effects Sound"
							description="Enable or disable game effects sounds.">
							<ToggleButton enabled={effectsSound} onClick={() => setEffectsSound(!effectsSound)} />
						</SettingRow>
					</section>
				)}

				{/* SYSTEM */}
				{activeTab === 'system' && (
					<section className="mx-auto mt-8 w-full max-w-4xl space-y-4 px-6 pb-10">
						<p className="text-center text-sm text-black/60">
							Transcendence system information
						</p>

						<SettingRow
							title="Version"
							description="Current application version.">
							<span className="rounded-full bg-white/20 px-5 py-2 text-xs font-bold uppercase text-black/55">
								v1.0
							</span>
						</SettingRow>

						<SettingRow
							title="Server Status"
							description="Backend connection status.">
							<span className="rounded-full bg-emerald-400/20 px-5 py-2 text-xs font-bold uppercase text-emerald-700">
								Connected
							</span>
						</SettingRow>
					</section>
				)}
			</div>
		</div>
	);
}

function SettingRow({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl border border-yellow-500/25 bg-white/10 p-5 backdrop-blur-md">
			<div className="flex items-center justify-between gap-6">
				<div>
					<h3 className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-700/70">
						{title}
					</h3>
					<p className="mt-5 text-xs text-black/45">
						{description}
					</p>
				</div>

				{children}
			</div>
		</div>
	);
}

