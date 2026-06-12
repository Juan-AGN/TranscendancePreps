//HubLoginSettings.tsx para el loginhub

import type { ReactNode } from 'react'; // tipo q repres cualquier cosas q react puede renderizar dentro de un comp
import { useState } from 'react';		//hook para save info q puede cambiar dentro del componente
import { useTranslation } from 'react-i18next';


function LoginOpts({					//funcion  que devuelve un jsx. com reutilizable
	title,
	children
}: {
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

export function HubPanelLogin() {				//comp princpipal de login


	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const { t } = useTranslation();

	function testHandleLogin() {
		void username;
		void password;
	}
	
	return (
		<div className="p-2">
			<LoginOpts title={t('hubPanelLogin.username')}>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder={t('hubPanelLogin.enterUsername')}
					className="w-full rounded border px-3 py-2 outline-none"	
				>
				</input>
			</LoginOpts>

			<LoginOpts title={t('hubPanelLogin.password')}>
				<input
					type="text"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					placeholder={t('hubPanelLogin.enterPassword')}
					className="w-full rounded border px-3 py-2 outline-none"	
				>
				</input>
			</LoginOpts>

			<LoginOpts title="">
				<button
					onClick={testHandleLogin}
					className="rounded border px-4 py-2 font-bold"
				>
					{t('hubPanelLogin.logIn')}
				</button>
			</LoginOpts>
		</div>
    )

}



