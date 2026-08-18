/**
 * The homepage's words, verbatim from the Figma (`23-181` / `23-1144`).
 *
 * Split out for the same reason `../web.js` is: `page.js` is a lesson about CLASS
 * STRINGS, and `demo.layout()` prints `layout()` as the definition — so every
 * sentence left in there is a sentence between the reader and the eleven strings
 * they came for.
 *
 * ⚠ NOT rewritten, though standing rule 8 allows it. This is the owner's own
 *   homepage: the question it answers is "does my design survive your framework",
 *   and swapping the copy answers a different question. `../web.js`'s Aurora prose
 *   is the place for words about the framework — this is a client comp.
 */
export default {

	brand: ["LEW", "42"],
	nav: "Digital Strategy · Services · Work · Our Philosophy · Insights",

	hero: {
		eyebrow: "Taking Brands From Chaos to Clarity",
		title: "Quiet hours for your digital growth",
		blurb: "We curate high-performance websites, sharp digital architecture, and rigorous marketing frameworks engineered strictly to scale modern products without the friction.",
		ctas: ["Book Free Blueprint Call", "Explore Case Studies"],
		kpi: ["184%", "Average client conversion increase within 90 days."],
	},

	logos: {
		caption: "Endorsed by leading operators and high-growth ventures",
		marks: "FINTECH.IO · MAVEN CO. · PROTOS LABS · SEEKER INK · LUMEN HEALTH",
	},

	services: {
		badge: "Digital Strategy Umbrella",
		title: "Rigorous execution. Consistent growth.",
		blurb: "We don't do siloed work. True digital strategy requires design that translates, development that endures, and marketing that drives customer intent.",
		cards: [
			["palette", "Digital Product Design",
				"Crafting high-fidelity, interactive systems optimized strictly for user clarity. Responsive web setups, mobile apps, and robust modular design systems.",
				"UI/UX Design · Brand Systems · Interactive Prototyping"],
			["code", "Custom Engineering",
				"Developing pixel-perfect, scalable web structures that load instantly. Expert setups utilizing headless architecture, custom APIs, and native React stacks.",
				"Headless CMS · React/Next.js · Performance Tuning"],
			["trending_up", "Growth Marketing",
				"Driving intentional buyers to your checkout. Rigorous performance advertising, systematic conversion rate optimization (CRO), and content frameworks.",
				"Paid Acquisition · SEO Strategy · Funnel Optimization"],
		],
	},

	philosophy: {
		badge: "Our Philosophy",
		title: "Attention is your most sacred resource",
		blurb: "In a landscape engineered to keep brands screaming for attention, we believe the quietest solutions cut through the loudest noise. We design for clarity, engineer for permanence, and market for sustainable relationships.",
		coda: "We reject temporary trends. Every pixel we place, every line of code we ship, and every growth framework we run is built to last.",
		quote: "A complicated digital setup is a symptom of unresolved strategy. True strategy is the art of letting go of the unnecessary.",
		by: "— Principal Strategist",
	},

	portfolio: {
		badge: "Featured Work",
		title: "Curated case studies",
		cta: "View All Projects",
		cards: [
			["LUMEN DIGITAL", "Design + Next.js Dev", "Headless payment structure for secure transaction"],
			["MAVEN STUDIO", "Brand Strategy + Marketing", "Comprehensive brand transformation and e-commerce launch"],
			["DATAVIS CO", "UI/UX + Headless Integration", "Custom analytical dashboard layout built strictly for data density"],
			["RITUAL TEA", "SEO + Performance Marketing", "Organic acquisition strategy generating 140% growth"],
		],
	},

	highlight: {
		eyebrow: "Deep Dive / Highlight Release",
		title: "The 2026 digital detox course platform",
		blurb: "A blank space designed strictly for mental decompression before screens take over. We engineered, designed, and launched a custom web platform utilizing headless Shopify with custom React modules.",
		stats: [["1.2s", "Average load time"], ["340k+", "Active monthly users"]],
		cta: "Read Deep Dive Case Study",
	},

	testimonials: {
		badge: "Client Testimonials",
		title: "What our partners say",
		cards: [
			["The Lew42 team fundamentally transformed how our business scales online. Their digital strategy umbrella brought a level of technical depth and design quality we couldn't find elsewhere.",
				"Sarah Jenkins", "VP of Marketing, Lumen Digital"],
			["Unlike standard creative agencies, Lew42 is hyper-focused on performance. Our SEO traffic increased by 140% within four months of our brand strategy relaunch.",
				"Marco Bellini", "Founder, Maven Studio"],
			["They don't just deliver mockups. Their engineers built us a lightning-fast custom React application that works seamlessly on every device. Truly remarkable craft.",
				"Dr. Emily Torres", "Lead Engineer, Datavis Co"],
		],
	},

	contact: {
		badge: "Start Your Journey",
		title: "Claim your free digital blueprint",
		blurb: "Ready to scale your digital presence? Send us your current URL and goals. Our principal strategist will audit your site and map out a comprehensive growth path. No pitch, just pure strategy.",
		meta: [["phone", "+1 (800) 420-LEW42"], ["mail", "blueprint@lew42.com"]],
		form: {
			title: "Request Consultation",
			fields: [
				["Your Name", "text", "John Doe"],
				["E-mail Address", "email", "john@company.com"],
				["Current Website URL (Optional)", "url", "www.yourcompany.com"],
			],
			cta: "Book Consultation",
			fine: "Join 4,200+ companies who scale quietly. Unsubscribe instantly.",
		},
	},

	footer: {
		blurb: "Temporary hacks fail. Lasting strategy scales. We curate premium digital experiences built strictly to last.",
		columns: [
			["Services", "Design Strategy · Product Interface · Custom Dev · Paid Media · CRO"],
			["Company", "About Our Mind · Philosophy · Work Showcase · Founder Note · Careers"],
			["Legal", "Privacy Policy · Terms of Service · HIPAA Policy · Secure Sync · Contact"],
		],
		copyright: "© 2026 Lew42. All rights reserved.",
		/* ⚠ PLACEHOLDER. Material Icons ships no brand marks, and standing rule 1 says
		   reuse rather than invent — so four generic glyphs stand in for the four
		   social logos. A real site drops `img.c("icon")` into the same row. */
		social: "public share alternate_email rss_feed",
	},
};
