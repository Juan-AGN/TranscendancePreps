import { useTranslation } from 'react-i18next'

export function PrivacyPolicyPage() {
	const { t } = useTranslation()
	return (
		<div className="min-h-screen bg-stone-100 dark:bg-black py-20 px-6 md:px-12 text-stone-800 dark:text-white/80 transition-colors duration-300">
			<div className="max-w-3xl mx-auto space-y-8">
				<div>
					<h1 className="text-4xl font-bold text-stone-900 dark:text-white mb-1">{t('privacy.title')}</h1>
					<p className="text-stone-400 dark:text-white/40 text-sm">{t('privacy.updated')}</p>
				</div>

				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('privacy.s1Title')}</h2>
					<p>{t('privacy.s1Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('privacy.s2Title')}</h2>
					<p>{t('privacy.s2Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('privacy.s3Title')}</h2>
					<p>{t('privacy.s3Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('privacy.s4Title')}</h2>
					<p>{t('privacy.s4Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('privacy.s5Title')}</h2>
					<p>{t('privacy.s5Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('privacy.s6Title')}</h2>
					<p>{t('privacy.s6Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('privacy.s7Title')}</h2>
					<p>{t('privacy.s7Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('privacy.s8Title')}</h2>
					<p>{t('privacy.s8Text')}</p>
				</div>

				<p className="pt-8 border-t border-white/10 text-white/30 text-xs text-center">
					{t('privacy.footer')}
				</p>
			</div>
		</div>
	)
}
