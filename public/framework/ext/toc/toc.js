import View, { el, a, div, span } from "../../core/View/View.js";

View.stylesheet(import.meta, "toc.css");

/**
 * toc — this page's own headings, as a nav, with the current one marked.
 *
 *   content(){
 *       toc();
 *       h2("One");  …
 *   }
 *
 * Call it wherever; it finds the headings itself. Nothing is declared, nothing is
 * registered, and adding a section to a page adds it to the nav.
 *
 * ── Why it fills itself one microtask later ──
 * The headings do not exist yet when `toc()` runs — `content()` is still on its
 * first line. So this places the container SYNCHRONOUSLY (while the captor is
 * still right) and fills it in a microtask, naming its target explicitly. That is
 * the one blessed shape for late content in this framework; the microtask runs
 * after `render()` returns and **before the browser paints**, so the rail is never
 * on screen empty.
 *
 * Design record: framework/ext/toc/readme.md.
 */
export default function toc(...args){
	const $toc = el.c("nav", "toc", () => {
		span.c("toc-title h4", "On this page");
	}).assign(...args);

	queueMicrotask(() => fill($toc));

	return $toc;
}

/* Headings that are SECTIONS of this page — not headings that happen to be on it.
 * A demo renders `h1("Hello")` as its subject, a file tree has labels, a readme in
 * `md.details` has its own outline; none of those is a place to navigate to. */
const skip = ".demo, .md-details, .toc, .files, .tab-bar, .sidebar, .page-previews";

function fill($toc){
	const page = $toc.el.closest(".page");

	if (!page)
		return console.warn("toc(): no enclosing .page — nothing to scan");

	const headings = [...page.querySelectorAll("h2, h3, .h2, .h3")]
		.filter(node => !node.closest(skip));

	if (!headings.length)
		return $toc.remove();

	const seen = new Set();

	headings.forEach(node => node.id ||= unique(slug(node.textContent), seen));

	$toc.append(() => div.c("toc-links", () => headings.forEach(node =>
		a.c("toc-link")
			.ac(node.tagName === "H3" || node.classList.contains("h3") ? "toc-sub" : "")
			.text(node.textContent)
			.href("#" + node.id))));

	spy($toc, page, headings);
}

/* Which heading you are reading: the last one whose top has passed the reading
 * line. Deliberately not an IntersectionObserver — between two widely spaced
 * headings nothing is intersecting, and "no section is current" is never the
 * answer a reader wants.
 *
 * THE REGION SCROLLS, not the page (Page.css), so the scroll events and the
 * geometry both come from `.pages`. A window listener would never fire. */
function spy($toc, page, headings){
	const scroller = page.closest(".pages");

	if (!scroller)
		return;

	const links = [...$toc.el.querySelectorAll(".toc-link")];

	const update = () => {
		/* A hidden page measures every rect at 0,0 — so every heading is "above the
		 * line" and the LAST one wins, which is how the rail first shipped showing
		 * the bottom section selected on arrival. `offsetParent` is null exactly
		 * when an ancestor is `display: none`, which is the whole of the case:
		 * `.page` is display:none until it is in the chain. */
		if (!page.offsetParent)
			return;

		const line = scroller.getBoundingClientRect().top + 90;
		let current = 0;

		headings.forEach((node, i) => {
			if (node.getBoundingClientRect().top <= line) current = i;
		});

		links.forEach((link, i) => link.classList.toggle("current", i === current));
	};

	scroller.addEventListener("scroll", update, { passive: true });

	// Now for the common case, and again after layout for the one where this page
	// is built while still off-screen — a tab panel's default, or a cold load.
	update();
	requestAnimationFrame(update);
}

function slug(text){
	return text.trim().toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.slice(0, 60) || "section";
}

function unique(base, seen){
	let id = base;

	for (let n = 2; seen.has(id); n++) id = `${base}-${n}`;

	seen.add(id);
	return id;
}

export { toc };
