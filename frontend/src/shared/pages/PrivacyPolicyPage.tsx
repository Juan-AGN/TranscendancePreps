export function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen bg-black py-20 px-6 md:px-12 text-white/80">
			<div className="max-w-3xl mx-auto space-y-8">
				<div>
					<h1 className="text-4xl font-bold text-white mb-1">Privacy Policy</h1>
					<p className="text-white/40 text-sm">Last updated: May 7, 2026</p>
				</div>

				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">1. Who We Are</h2>
					<p>Transcendence is a non-commercial student project built at 42 School. It features a 3D hub, a competitive Pong game and user accounts. Contact: transcendence@student.42.es</p>
				</div>

				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">2. Data We Collect</h2>
					<p>Username, email, hashed password, profile info, game stats and session tokens. We do not collect payment or location data.</p>
				</div>

				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">3. How We Use Your Data</h2>
					<p>Only to manage your account, authenticate you, display your profile and enable game features. We never sell or share your data with third parties.</p>
				</div>

				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">4. Cookies</h2>
					<p>We use session cookies only to keep you logged in. No tracking or advertising cookies are used. Log out to clear your session.</p>
				</div>

				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">5. Security</h2>
					<p>Passwords are hashed before storage. Data runs in a Docker environment with reasonable security measures. As a student project, enterprise-grade security is not guaranteed — do not reuse passwords from other services.</p>
				</div>

				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">6. Your Rights</h2>
					<p>You may access, correct or delete your data at any time. Contact us at transcendence@student.42.es to exercise these rights.</p>
				</div>

				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">7. Data Retention</h2>
					<p>Account data is kept while your account is active. After a deletion request, data is removed within 30 days.</p>
				</div>

				<div>
					<h2 className="text-amber-300 font-semibold uppercase tracking-widest mb-2">8. Changes</h2>
					<p>This policy may change during development. Continued use after changes means you accept the updated policy.</p>
				</div>

				<p className="pt-8 border-t border-white/10 text-white/30 text-xs text-center">
					Transcendence — 42 School Student Project · May 7, 2026
				</p>
			</div>
		</div>
	)
}