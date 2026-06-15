// ┌────────────────────────────────────────────────────────────┐
// │                         Footer.tsx                         │
// ├────────────────────────────────────────────────────────────┤
// │ Global footer displayed at the bottom of shared pages.     │
// │ It shows the project brand, legal links and copyright.     │
// └────────────────────────────────────────────────────────────┘
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ════════ COMPONENT: Footer: Render the global project footer. ════════
export function Footer() {
	// Step 1: Load translated footer texts.
	const { t } = useTranslation();
	
    return (
    <footer className="w-full border-t border-yellow-400/40 rounded-t-[0.6rem] lg:rounded-t-[1rem] bg-blue-400/10 
					backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1 lg:px-[clamp(1rem,3vw,2.5rem)] lg:py-[clamp(0.35rem,1vh,0.5rem)]">
			<div className="max-w-7xl mx-auto flex flex-row flex-wrap items-center justify-center lg:justify-between gap-x-2 gap-y-1
						lg:gap-6 lg:gap-y-1 text-[0.58rem] sm:text-[0.68rem] lg:text-[clamp(0.65rem,0.8vw,0.875rem)]">
				{/* Step 2: Render the project brand and academic project label. */}
				<div className="flex items-center justify-center gap-1.5 lg:gap-3 w-full lg:w-auto">
					<span className="font-bold text-black drop-shadow-lg">{t('footer.brand')}</span>
					<span className=" text-black/50">{t('footer.project')}</span>
				</div>
				{/* Step 3: Render the required legal links for the subject evaluation. */}
				 <div className="flex gap-2 sm:gap-3 lg:gap-6 items-center">
					 <Link to="/privacy"
					 		className="text-black/50 hover:text-yellow-400 hover:scale-120 hover:translate-y-[-10%]
					 			transition-all duration-300 lg:text-sm drop-shadow-md ">
									{t('footer.privacy')}</Link>
								<span className="text-white/40">|</span>
					 
					 <Link to="/terms"
					 	className="text-black/50 hover:text-yellow-400 hover:scale-120 hover:translate-y-[-10%]
					 	transition-all duration-300 lg:text-sm drop-shadow-md">
						{t('footer.terms')}</Link>
				 </div>

				{/* Step 4: Render the project copyright text. */}
				 <div className="text-black/60 text-center md:text-right">
				 	{t('footer.copyright')}
				 </div>
			</div>
    </footer>
    );
}