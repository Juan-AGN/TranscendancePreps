// ┌────────────────────────────────────────────────────────────┐
// │                HubLoginPanel.tsx                           │
// ├────────────────────────────────────────────────────────────┤
// │ Hub login panel component.                                 │
// │ Renders username/password inputs and login action button.  │
// │ Uses i18n labels for translated UI text.                   │
// └────────────────────────────────────────────────────────────┘

// STEP 1: Import React and translation dependencies

import type { ReactNode } from 'react'; // Type for any renderable React children content
import { useState } from 'react';		// Hook for mutable component-local state
import { useTranslation } from 'react-i18next';


// STEP 2: Reusable row component for label + control
function LoginOpts({ title, children }: {
	title: string;
	children: ReactNode
}) {
	return (
		<div className="flex items-center justify-between p-3">
			<span>{title}</span>
			<div className="w-56">{children}</div>		
		</div>
	);
}

// STEP 3: Main login panel component
export function HubPanelLogin() {

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const { t } = useTranslation();

	// STEP 4: Placeholder login handler (wire real auth later)
	function testHandleLogin() {
		void username;
		void password;
	}
	
	return (
		<div className="p-2">
			<LoginOpts title={t('hubPanelLogin.username')}>
				<input
					id="hub-login-username"
					name="hubLoginUsername"
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder={t('hubPanelLogin.enterUsername')}
					className="w-full rounded border px-3 py-2 outline-none">
				</input>
			</LoginOpts>

			<LoginOpts title={t('hubPanelLogin.password')}>
				<input
					id="hub-login-password"
					name="hubLoginPassword"
					type="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder={t('hubPanelLogin.enterPassword')}
					className="w-full rounded border px-3 py-2 outline-none">
				</input>
			</LoginOpts>

			<LoginOpts title="">
				<button
					onClick={testHandleLogin}
					className="rounded border px-4 py-2 font-bold">
					{t('hubPanelLogin.logIn')}
				</button>
			</LoginOpts>
		</div>
    )
}

// ===== MINI DICTIONARY =====
// i18n -> internationalization system for localized text
// placeholder -> helper text displayed in empty input
// local state -> component-scoped data managed via useState



