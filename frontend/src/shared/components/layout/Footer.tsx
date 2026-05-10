//foooooter

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {

	const [ t ] = useTranslation();
	
    return (
    <footer className="w-full border-t border-yellow-400/40 rounded-t-[1rem] bg-blue-400/10 
					backdrop-blur-sm px-[clamp(1rem,3vw,2.5rem)] py-[clamp(0.35rem,1vh,0.5rem)]">
			<div className="max-w-7xl mx-auto flex flex-row flex-wrap items-center justify-between gap-6 gap-y-1
							text-[clamp(0.65rem,0.8vw,0.875rem)]">
				{/* Logo / Brand */}
				<div className="flex items-center gap-3  w">
					<span className="font-bold text-black drop-shadow-lg">{t('footer.brand')}</span>
					<span className=" text-black/50">{t('footer.project')}</span>
				</div>

				 {/* Footer legal del subject */}
				 <div className="flex gap-6 items-center">
					 <Link to="/privacy"
					 		className="text-black/50 hover:text-yellow-400 hover:scale-120 hover:translate-y-[-10%]
					 			transition-all duration-300 drop-shadow-md ">
									{t('footer.privacy')}</Link>
								<span className="text-white/40">|</span>
					 
					 <Link to="/terms"
					 className="text-black/50 hover:text-yellow-400 hover:scale-120 hover:translate-y-[-10%]
					 transition-all duration-300 text-sm drop-shadow-md">
						{t('footer.terms')}</Link>
				 </div>

				 {/* Copyright */}
				 <div className="text-black/60 text-center md:text-right">
					{t('footer.copyright')}
				 </div>
			</div>
    </footer>
    )
}