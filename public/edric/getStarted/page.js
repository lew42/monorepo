import { Page, md, h2, code, toc, div, a, button } from "/app.js";

// Same three sections declared as children below, as cards instead of links.
const cards = [
	{ title: "Framework", url: "/edric/getStarted/framework/", desc: "App and View, the two classes that run everything." },
	{ title: "Style", url: "/edric/getStarted/style/", desc: "framework.css, grouped the way a style guide usually is." },
	{ title: "Custom Components", url: "/edric/getStarted/components/", desc: "Button, Forms, Navbar, Card." },
];

// One card, three tabs. Not Page.tabs() — that switches between real child
// *pages* (routes), and these three are just sections of this one page's prose,
// nothing to navigate to. A small local widget instead: one active index, swap
// the panel's content on click, no routing involved.
function steps(list){
	let $panel, $tabs = [], active = 0;

	const show = i => {
		active = i;
		$tabs.forEach((t, ti) => t.style("background", ti === active ? "var(--prim)" : "var(--subtle)"));
		$panel.empty(list[active].render);
	};

	return div.c("pad flow", () => {
		div.c("flex gap wrap", () => {
			list.forEach((step, i) => {
				$tabs.push(button.c("btn", step.label).style("background", i === 0 ? "var(--prim)" : "var(--subtle)").click(() => show(i)));
			});
		});

		$panel = div.c("flow", list[0].render);
	}).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
}

export default new Page({
	meta: import.meta,
	title: "Get Started",
	description: "Install the framework and build your first page.",

	children: "framework style components",

	content(){
		toc();

		md("New here? No worries, this page will get you up and running in a couple of minutes. No build tools, no config files to fight with.");

		steps([
			{
				label: "Install",
				render(){
					md("Grab [Node.js](https://nodejs.org) if you don't have it, then:");

					code.lang("bash", `git clone https://github.com/lew42/monorepo.git
cd monorepo
npm install
node server.js`);

					md("Open `http://localhost` in your browser.");
				},
			},
			{
				label: "Start Using It",
				render(){
					md("Every folder under `/public/` is its own site, named after whoever built it.");

					md("Every HTML tag is a function from `/app.js`, calling one adds it to the page. Make your own folder, add a `page.js`, and it shows up at that url:");

					code.js(`import { h1, p } from "/app.js";

export default function() {
    h1("Hello World");
    p("Some text");
}`);

					md("No build step, no JSX. Save, refresh, done.");
				},
			},
		]).ac("mb");

		h2("Explore");

		md("Three places to go next, same three as the sidebar's dropdown:");

		// .page-preview is `display: flex` (Page.css): title and desc have to
		// share one flex slot, wrapped, or they sit side by side as two
		// columns instead of desc stacking under the title.
		div.c("page-previews", () => {
			cards.forEach(section => {
				a.c("page-preview").href(section.url).append(() => {
					div(() => {
						div.c("page-preview-title", section.title);
						div.c("page-preview-desc", section.desc);
					});
				});
			});
		});
	}
});