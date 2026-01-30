//foooooter

import { Link } from 'react-router-dom'

export function Footer() {
    return (
    <footer className="
			w-full
			border-t
			border-white/20
			rounded-t-[2rem]
			bg-blue-600
			py-15
			px-10
			">
			<div className="
			max-w-7xl
			mx-auto
			flex
			flex-col
			md:flex-row
			items-center
			justify-between
			gap-8
			">
				{/* Logo / Brand */}
				<div className="
				flex
				flex-col
				items-center
				md:items-start
				gap-2
				">
					<h3 className="
					text-2xl
					font-bold
					text-white
					drop-shadow-lg
					">
						TRANSCENDENCE
					</h3>
					<p className="
					text-sm
					text-white/70
					">
						Alumni Project 42 Telefonica
					</p>
				</div>

				 {/* Footer legal del subject */}
				 <div className="
				 flex
				 gap-6
				 items-center
				 ">
					 <Link to="/privacy" className="
					 text-white/80
					 hover:text-white
					 hover:scale-110
					 transition-all
					 duration-300
					 font-medium
					 drop-shadow-md
					 ">Privacy Policy</Link>
					 
					 <span className="text-white/40">|</span>
					 
					 <Link to="/terms" className="
					 text-white/80
					 hover:text-white
					 hover:scale-110
					 transition-all
					 duration-300
					 font-medium
					 drop-shadow-md
					 ">Terms of Service</Link>
				 </div>

				 {/* Copyright */}
				 <div className="
				 text-sm
				 text-white/60
				 text-center
				 md:text-right
				 ">
					© 2026 Transcendence
				 </div>
			</div>
    </footer>
    )
}