import { Page, View, md, div, section, h1, h2, h3, p, a, span } from "/app.js";
import depth from "/framework/ext/depth/depth.js";

View.stylesheet(import.meta, "resume.css");

// Real contact, provided by the owner 2026-08-31. Email capitalized on purpose —
// "the little l is hard to read".
const CONTACT = [
	["Aurora / Chicago, IL"],
	["Mike@Lew42.com", "mailto:Mike@Lew42.com"],
	["(248) 885 - 7954"],
	["Lew42.com", "https://lew42.com"],
	["github.com/lew42", "https://github.com/lew42"],
	["linkedin.com/in/michael-lewis813", "https://www.linkedin.com/in/michael-lewis813/"],
];

const JOBS = [
	{
		role: "Independent Developer & Designer — Lew42 Framework",
		meta: "Self-employed · Sep 2014 – Present · Aurora, IL",
		did: `- Designed and built an original UI framework in vanilla JavaScript — native ESM imports, no bundler, no JSX, no TypeScript — covering rendering, routing, async module loading, persistence, and an OOP \`View\` component system with a jQuery-like API.
- Iterated the architecture through multiple ground-up rebuilds, balancing simplicity against capability; latest iteration live at [monorepo.lew42.workers.dev](https://monorepo.lew42.workers.dev) and [github.com/lew42/monorepo](https://github.com/lew42/monorepo).
- Built interactive demos including a [three.js flying game](/fly/) and a [3D parallax scroll effect](/framework/ext/depth/) — per-layer depth, scroll-driven motion, mouse-driven lean.
- Produced hundreds of UI/UX designs in Figma — design systems, text styles, navigation, and layouts.
- Daily AI-assisted development: Claude Code, CLAUDE.md conventions, custom skills, multi-agent workflows.
- Freelance client web development throughout, while serving as primary caregiver for my children.`
	},
	{
		role: "Web UI Developer",
		meta: "Thirdwave, LLC · Jan 2014 – Sep 2014 · Chicago, IL",
		did: `- Responsive web UIs for agency clients — HTML/CSS/JS implementation from design comps.`
	},
	{
		role: "Web Developer",
		meta: "Business-Software.com · Aug 2012 – Sep 2013",
		did: `- Developed and maintained front-end features for a high-traffic software review and comparison site.`
	},
	{
		role: "Web Developer",
		meta: "Stone Ward · May 2012 – Jul 2012",
		did: `- Front-end development for advertising agency client campaigns.`
	},
];

export default new Page({
	meta: import.meta,
	title: "Résumé",
	description: "Design engineer — front-end developer and UI designer, 12+ years.",
	icon: "badge",

	/* Own render, and NOT `.standard`: the default emits `h1.page-title` outside
	   content() (the name has to be inside the header block to be its closest
	   layer), and `.standard` is a grid whose main TRACK is the measure while the
	   page stays full width — nothing to centre. */
	render(){
		// ⚠ The page is the SCENE and nothing else — no background. A scene never
		// transforms (perspective applies to its children), so a page that was also
		// the card left that card as the one flat thing on a page about depth.
		// The card is now a layer inside it.
		return this.view ??= div.c("page flow page-resume", () => this.content());
	},

	/* ⚠ `.depth()` BARE, never `.depth(n)` — passing the number writes an inline
	   `--depth` that beats every class rule, so retuning "all the headings" would
	   mean editing every call site. The tiers live in resume.css, one selector each.

	   `--depth` COMPOSES: a nested value is relative to its parent layer, not
	   absolute (ext/depth readme). Every tier is a `.depth-layer`, which is what
	   carries `preserve-3d` — a plain wrapper between two layers would flatten the
	   inner one into its own plane. */
	content(){

		// The résumé has no nav chrome of its own — this is the smallest honest
		// stand-in for it, not a bar: two links out, scrolling away with the page
		// like everything else here. `p`, not `div` — framework.css only dresses
		// a NAVIGATION anchor inside :where(p, li, td, ...); see resume-contact below.
		p.c("resume-links", () => {
			a("lew42").href("/");
			a("Blog").href("/blog/");
		});

		depth().ac("resume-depth pad").style("--pad", "0.4em 0.8em");

		div.c("resume-card flow", () => this.sheet()).depth();
	},

	sheet(){

		div.c("resume-head pad", () => {
			h1("Michael Lewis").depth();
			p.c("resume-role", "Design Engineer · Front-End Developer + UI Designer");

			p.c("resume-contact", () => CONTACT.forEach(([text, href]) =>
				href ? a(text).href(href) : span.c("muted", text)));
		}).depth();

		section.c("resume-section pad", () => {
			h2("Summary").depth();

			md("Front-end developer and UI designer with **12+ years building for the web**, including a decade architecting and iterating an original vanilla-JavaScript UI framework — rendering, routing, async loading, persistence, and a component system, all in native ESM with no bundler. Comfortable across the full design-to-code pipeline: Figma design systems, interactive prototypes, three.js, and AI-assisted development with Claude Code.");
		}).depth();

		section.c("resume-section pad", () => {
			h2("Experience").depth();

			JOBS.forEach(job => div.c("resume-job", () => {
				h3(job.role);
				p.c("resume-meta muted", job.meta);
				md(job.did);
			}).depth());
		}).depth();

		section.c("resume-section pad", () => {
			h2("Selected Work").depth();

			md(`- **[Framework](/framework/)** — vanilla JS Views, routing, rendering, persistence.
- **[3D Parallax Scroll](/framework/ext/depth/)** — layers at declared depths; scroll parallax plus mouse lean. *It is running on this page — drag the slider above.*
- **[Flying Game](/fly/)** — three.js interactive flight demo.`);
		}).depth();

		section.c("resume-section pad", () => {
			h2("Skills").depth();

			md(`- **Code:** JavaScript (vanilla, ES modules), HTML, CSS, three.js, Node.js, Cloudflare Workers, Git/GitHub
- **Architecture:** Component systems, client-side routing, rendering pipelines, async loading, persistence, OOP
- **Design:** Figma (design systems, text styles, components), UI/UX, prototyping
- **AI:** Claude Code — CLAUDE.md, custom skills, agentic multi-step workflows`);
		}).depth();

		section.c("resume-section pad", () => {
			h2("Education").depth();

			md("**University of Missouri–Columbia** — B.S. Business Administration / Economics, 2010");
		}).depth();
	}
});
