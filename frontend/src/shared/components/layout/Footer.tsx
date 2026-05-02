//foooooter

import { Link } from 'react-router-dom'

export function Footer() {
    return (
    <footer className="
			w-full
			border-t
			border-yellow-400/40
			rounded-t-[1rem]
			bg-blue-400/10
			backdrop-blur-sm
			py-2
			px-10
			">
			<div className="
			max-w-7xl
			mx-auto
			flex
			flex-row
			items-center
			justify-between
			gap-4
			">
				{/* Logo / Brand */}
				<div className="flex items-center gap-3">
					<span className="text-sm font-bold text-black drop-shadow-lg">TRANSCENDENCE</span>
					<span className="text-xs text-black/50">Alumni Project 42 Telefonica</span>
				</div>

				 {/* Footer legal del subject */}
				 <div className="
				 flex
				 gap-6
				 items-center
				 ">
					 <Link to="/privacy" className="
					 text-black/50
					 hover:text-white
					 hover:scale-120
					 hover:translate-y-[-10%]
					 transition-all
					 duration-300
					 font-small
					 drop-shadow-md
					 ">Privacy Policy</Link>
					 
					 <span className="text-white/40">|</span>
					 
					 <Link to="/terms" className="
					 text-black/50
					 hover:text-white
					 hover:scale-120
					 hover:translate-y-[-10%]
					 transition-all
					 duration-300
					 font-small
					 drop-shadow-md
					 ">Terms of Service</Link>
				 </div>

				 {/* Copyright */}
				 <div className="
				 text-sm
				 text-black/60
				 text-center
				 md:text-right
				 ">
					© 2026 Transcendence
				 </div>
			</div>
    </footer>
    )
}