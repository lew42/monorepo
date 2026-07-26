import app, { Page2, div, h1, h2, h3, h4, h5, h6, p, a, button, hr, ul, li, code } from "/app.js";

// app.$body.ac("theme-1"); throws?

export default new Page2({
	meta: import.meta,
	title: "Branding",
	content(){

	a.c("page-back", "Back").href("/");

	p("Sandbox for comparing style-doc ideas out loud. Nothing here is final, and it adds no new CSS — it only rearranges classes already defined in `framework.css` / `styles.css`.");

	hr();

	h2("Site nav (for comparison)");

	p("This is `app.nav()` — fixed, minimal, identical on every page. Kept separate from the branding card below on purpose: if CTA buttons and nav links shared one visual slot, they'd start reading as the same kind of thing.");

	app.nav();

	hr();

	h2("Basic Branding — compact, one screen");

	p("A single card: logo, one heading, one paragraph, the button set, one inline link. If a style doesn't earn a place here, that's a prompt to ask whether it's essential.");

	div.c("pad", () => {
		div.c("flex split v-center gap mb", () => {
			div("Lew42").style({ "font-weight": "700", "font-size": "1.4em" });
			div.c("flex gap", () => {
				button.c("btn prim", "Primary");
				button.c("btn bg", "Secondary");
				button.c("btn", "Plain");
			});
		});
		h1("The one heading you show");
		p("Body copy sample — the quick brown fox jumps over the lazy dog. A ", a("plain text link").href("#"), " sits inline, styled like text, not like a button.");
	}).style({ border: "1px solid var(--subtle)", "border-radius": "0.5em", "max-width": "32em" });

	hr();

	h2("Try the layout utilities live");

	p("Toggle classes on the button row below — this is `View.ctrl()`, already built into the framework, unused anywhere until now:");

	div.c("flex gap", () => {
		button.c("btn prim", "Primary");
		button.c("btn bg", "Secondary");
		button.c("btn", "Plain");
	}).ctrl("wrap reverse split h-center v-center");

	hr();

	h2("Full breakdown — categorized reference");

	p("The exhaustive version: every level, every variant, grouped into elements / layout / components / sections. Useful as a reference to link *into* from the card above — not as the first thing a visitor sees.");

	h3("Elements");
	h1("Heading 1"); h2("Heading 2"); h3("Heading 3"); h4("Heading 4"); h5("Heading 5"); h6("Heading 6");
	p("A paragraph with `inline code` and a ", a("plain link").href("#"), ".");
	ul(() => {
		li("List item one");
		li("List item two");
	});

	h3("Layout");
	div.c("flex gap pad", () => {
		div("flex item 1").style({ background: "var(--prim)", color: "white", padding: "1em" });
		div("flex item 2").style({ background: "var(--prim)", color: "white", padding: "1em" });
		div("flex item 3").style({ background: "var(--prim)", color: "white", padding: "1em" });
	});

	h3("Components");
	div.c("flex gap", () => {
		button.c("btn prim", "Primary");
		button.c("btn bg", "Secondary");
		button.c("btn", "Plain");
	});

	h3("Sections — assembled");
	div.c("pad", () => {
		h2("Example section");
		p("Sections = elements + layout + components, composed — this block reuses ", code(".pad"), " from above, nothing new.");
		button.c("btn prim", "Call to action");
	}).style({ background: "var(--bg)", color: "white", "border-radius": "0.5em" });
	}
});
