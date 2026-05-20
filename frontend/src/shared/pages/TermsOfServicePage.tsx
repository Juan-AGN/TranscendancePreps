import { useTranslation } from 'react-i18next'

export function TermsOfServicePage() {
	const { t } = useTranslation()
	return (
		<div className="min-h-screen bg-stone-100 dark:bg-black py-20 px-6 md:px-12 text-stone-800 dark:text-white/80 transition-colors duration-300">
			<div className="max-w-3xl mx-auto space-y-8">
				<div>
					<h1 className="text-4xl font-bold text-stone-900 dark:text-white mb-1">{t('terms.title')}</h1>
					<p className="text-stone-400 dark:text-white/40 text-sm">{t('terms.updated')}</p>
				</div>

				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('terms.s1Title')}</h2>
					<p>{t('terms.s1Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('terms.s2Title')}</h2>
					<p>{t('terms.s2Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('terms.s3Title')}</h2>
					<p>{t('terms.s3Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('terms.s4Title')}</h2>
					<p>{t('terms.s4Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('terms.s5Title')}</h2>
					<p>{t('terms.s5Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('terms.s6Title')}</h2>
					<p>{t('terms.s6Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('terms.s7Title')}</h2>
					<p>{t('terms.s7Text')}</p>
				</div>
				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">{t('terms.s8Title')}</h2>
					<p>{t('terms.s8Text')}</p>
				</div>

				<p className="pt-8 border-t border-white/10 text-white/30 text-xs text-center">
					{t('terms.footer')}
				</p>
			</div>
		</div>
	)
}
