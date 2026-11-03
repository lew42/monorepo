import View, { el, a, div, span } from "../../core/View/View.js";

View.stylesheet(import.meta, "toc.css");

/**
 * toc — this page's own headings, as a nav, with the current one marked.
 *
 *   content(){ toc(); h2("One"); … }
 *
 * ⚠ The headings do not exist yet when this runs — `content()` is still on its first
 * line. So the container is placed SYNCHRONOUSLY, while the captor is still right,
 * and filled in a microtask that names its target. The microtask lands after
 * `render()` returns and before the browser paints, so the rail is never empty
 * on screen. Design record: framework/ext/toc/readme.md.
 */
export default function toc(...args){
	const $toc = el.c("nav", "toc", () => {
		span.c("toc-title h4", "On this page");
	}).assign(...args);

	queueMicrotask(() => fill($toc));

	return $toc;
}

// Headings that are SECTIONS of this page, not headings that happen to be on it.
// `.toc-skip` is the opt-out for what this list cannot guess — a page rendering a
// REAL component whose `.h2` is a value rather than a section title.
const skip = ".demo, .md-details, .toc, .files, .tab-bar, .sidebar, .page-previews, .toc-skip";

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

// Which heading you are reading: the last one past the reading line.
// ⚠ THE REGION SCROLLS, not the page, so the events and the geometry both come from
// `.pages` — a window listener would never fire.
function spy($toc, page, headings){
	const scroller = page.closest(".pages");

	if (!scroller)
		return;

	const links = [...$toc.el.querySelectorAll(".toc-link")];

	const update = () => {
		// ⚠ A hidden page measures every rect at 0,0, so every heading reads as
		// "above the line" and the LAST one wins. A `.page` is display:none until
		// it is in the chain, and `offsetParent` is null exactly then.
		if (!page.offsetParent)
			return;

		const line = scroller.getBoundingClientRect().top + 90;
		let current = 0;

		headings.forEach((node, i) => {
			if (node.getBoundingClientRect().top <= line) current = i;
		});

		links.forEach((link, i) => link.classList.toggle("current", i === current));
		reveal($toc.el, links[current]);
	};

	scroller.addEventListener("scroll", update, { passive: true });

	// Twice: now, and after layout for a page built while still off-screen — a tab
	// panel's default, or a cold load.
	update();
	requestAnimationFrame(update);
}

// Nudge the rail by exactly the overhang, never centring, so a rail that already
// shows the current row does nothing at all.
function reveal(rail, link){
	if (!link) return;

	const box = rail.getBoundingClientRect();
	const row = link.getBoundingClientRect();

	if (row.top < box.top) rail.scrollTop += row.top - box.top;
	else if (row.bottom > box.bottom) rail.scrollTop += row.bottom - box.bottom;
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
