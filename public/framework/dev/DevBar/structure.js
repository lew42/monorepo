import { div, span } from "../../core/View/View.js";
import { section } from "./parts.js";

/* The nested `.page` boxes the active page sits in, then its own children and how each lays out. Record: doc/structure.md. */
export default function structure(app){
	section("structure", () => {
		const $box = div();
		// ⚠ Drawn TWICE and the second is the true one: the rail refreshes from
		// `navigated()`, before the page's stylesheets land, when every child reads block.
		const draw = () => $box.el.closest(".dev-body") && $box.empty(() => tree(app));
		draw();
		setTimeout(draw, 400);
	});
}

// ⚠ The DOM, not `router.chain()` — a page mounts in the nearest ancestor holding a `$pages` region, so the boxes CSS nests are the honest answer.
function tree(app){
	const el = app?.router?.active?.view?.el ?? document.querySelector(".page.active-page");
	if (!el) return void span.c("dev-val off", "no active page");
	const nest = [];
	for (let page = el; page; page = page.parentElement?.closest(".page")) nest.unshift(page);
	nest.forEach((page, i) => page_line(page, i, i === nest.length - 1));
	const kids = [...el.children];
	kids.forEach(kid => kid_line(kid));
	span.c("dev-val off", tally(kids));
}

function page_line(el, depth, here){
	div.c("dev-val", () => {
		// ⚠ NBSP: the indent is the only thing saying "nested", and HTML collapses real spaces.
		if (depth) span.c("muted", "\u00a0\u00a0".repeat(depth) + "↳ ");
		span(slug(el)).ac(!here && "muted");
		if (marks(el)) span.c("muted", " " + marks(el));
	});
}

function kid_line(el){
	const how = mode(el);
	div.c("dev-val", () => {
		span(el.tagName.toLowerCase());
		span.c("muted", " " + ([...el.classList].join(" ") || "—"));
		if (how && !el.classList.contains(how)) span(" " + how);
	});
}

const DULL = new Set(["page", "flow", "active-page", "active-ancestor"]);
const slug = el => [...el.classList].find(c => c.startsWith("page-")) ?? "page";
const marks = el => [...el.classList].filter(c => !DULL.has(c) && !c.startsWith("page-")).join(" ");
const mode = el => {
	const display = getComputedStyle(el).display.replace("inline-", "");
	return ["flex", "grid", "none"].includes(display) ? display
		: el.classList.contains("flow") ? "flow" : "";
};
const tally = kids => {
	const n = how => kids.filter(kid => mode(kid) === how).length;
	return [`${kids.length} ${kids.length === 1 ? "child" : "children"}`,
		n("grid") && `${n("grid")} grid`, n("flex") && `${n("flex")} flex`].filter(Boolean).join(" · ");
};

export { structure };
