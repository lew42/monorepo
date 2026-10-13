import { div, span, a } from "../View/View.js";
import { FIXTURES, arrange, tone_of, apply } from "./fixtures.js";

// Layout checking and approval. Details and design: doc/rules-notes.md

const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");

export const RULES = {
	width: { title: "Width range", url: "/framework/styles/rules/proportion/" },
	contrast: { title: "Contrast", url: "/framework/styles/stacks/" },
	nesting: { title: "Nesting", url: "/framework/styles/rules/nesting/" },
};

export const fits = (layout, room) => !room || room >= (layout.widths?.[0] ?? 0) - 1;

export function check(layout, el){
	if (!dev || !el) return [];

	const found = [];
	const room = el.clientWidth;
	const floor = layout.widths?.[0] ?? 0;

	if (room && !fits(layout, room))
		found.push({
			rule: "width", url: RULES.width.url,
			says: `${layout.title} is proven from ${floor}px. This box is ${Math.round(room)}px. `
				+ `Below its floor it stacks to ${layout.fallback ?? "stack"} — and ${layout.fallback ?? "stack"} is what you are looking at.`,
		});

	const clash = same_tone(el);
	if (clash)
		found.push({
			rule: "contrast", url: RULES.contrast.url,
			says: `This box paints ${clash} on the same value its host paints. A colour is legal at every width; `
				+ `two tokens resolving to one value here is the thing no cascade can see.`,
		});

	nesting(layout, el).forEach(says => found.push({ rule: "nesting", url: RULES.nesting.url, says }));

	return found;
}

function same_tone(el){
	const style = getComputedStyle(el);
	const ink = style.color;
	const back = painted(el);

	return back && ink === back ? ink : null;
}

// ⚠ rgba(0, 0, 0, 0) IS what transparent computes to; match the whole form.
const clear = bg => !bg || bg === "transparent" || /^rgba\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*0\s*\)$/.test(bg);

function painted(el){
	for (let node = el; node && node.nodeType === 1; node = node.parentElement){
		const bg = getComputedStyle(node).backgroundColor;
		if (!clear(bg)) return bg;
	}
	return null;
}

function nesting(layout, el){
	const said = [];

	if (layout.room === "solo" && el.closest(".page-w-full"))
		said.push("A full-width layout inside a `full` page collapses a row that is already collapsed — the inner page has no host left to be full of.");

	// ⚠ READ OFF THE DOM, NEVER OFF A TAG — look at what it does, not how it is filed.
	if (sticky(el) && scroller(el.parentElement))
		said.push("This layout sticks something, and an ancestor has its own `overflow: auto` — `position: sticky` sticks to the nearest scrolling ancestor, so it will stick to that box and never to the page.");

	return said;
}

const sticky = el => [...el.querySelectorAll("*")].some(node => getComputedStyle(node).position === "sticky");

function scroller(el){
	for (let node = el; node && node.nodeType === 1; node = node.parentElement){
		const flow = getComputedStyle(node).overflowY;
		if (flow === "auto" || flow === "scroll") return node;
	}
	return null;
}

export function warn($view, found){
	if (!found.length) return $view;

	return $view.ac("page-layout-warn").append(() =>
		div.c("page-layout-warn-badge", () => {
			span(found.length + (found.length === 1 ? " rule" : " rules"));
			found.forEach(one => a.c("page-layout-warn-line", one.says).href(one.url));
		}));
}

export function prove(layout, width){
	if (layout.grows === false && !layout.overflow)
		return [{ width, fixture: "—", kind: "growth", says: "It is a bounded box and says nothing about content longer than it. Declare `overflow: \"scroll\" | \"clip\" | \"truncate\"`." }];

	const found = [];
	const { host, room } = open(width);

	try {
		FIXTURES.forEach(fixture => {
			room.replaceChildren();
			apply({ el: room }, tone_of(fixture));
			room.appendChild(arrange(layout, fixture).el);
			inspect(layout, room, fixture, width).forEach(one => found.push(one));
		});

		if (layout.wraps) [1, 2, 3, 5, 7].forEach(count => {
			room.replaceChildren();
			apply({ el: room }, tone_of(FIXTURES[4]));
			room.appendChild(arrange(layout, FIXTURES[4], count).el);
			const rag = ragged(room);
			if (rag) found.push({ width, fixture: count + " items", kind: "ragged", says: rag });
		});
	} finally {
		host.remove();
	}

	return found;
}

// ⚠ visibility: hidden not display: none — a display-hidden box is never measured.
function open(width){
	const host = document.createElement("div");
	host.className = "page-layout-audit";
	host.style.cssText = "position:fixed;inset:0;overflow:hidden;visibility:hidden;pointer-events:none;z-index:-1";

	const room = document.createElement("div");
	room.style.cssText = `width:${width}px;padding-inline:clamp(1.5em, 3.5%, 3.5em);box-sizing:border-box`;

	host.appendChild(room);
	document.body.appendChild(host);

	return { host, room };
}

function inspect(layout, room, fixture, width){
	const found = [];
	const say = (kind, says) => found.push({ width, fixture: fixture.id, kind, says });

	const edge = room.getBoundingClientRect();
	const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
	const all = room.querySelectorAll("*");

	for (const el of all){
		const style = getComputedStyle(el);

		if (el.scrollWidth > el.clientWidth + 1 && style.overflowX === "visible")
			return say("overflow", `${el.scrollWidth - el.clientWidth}px of content escaped a box that never said it could scroll.`), found;

		if (el.scrollHeight > el.clientHeight + 1 && style.overflowY === "visible" && style.height !== "auto" && el.clientHeight)
			return say("growth", `A box with a fixed height spilled ${el.scrollHeight - el.clientHeight}px, and its overflow is \`visible\`.`), found;

		if (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())){
			const box = el.getBoundingClientRect();

			if (box.width && box.left <= edge.left + 0.5)
				return say("edge", "Text sits on the host's own edge — the layout escaped the page's gutter."), found;

			if (el.tagName === "P" && box.width > 46 * root)
				return say("measure", `A paragraph ran ${Math.round(box.width / root)}em, past the 46em ceiling.`), found;

			if (same_tone(el))
				return say("contrast", `Text and the fill under it resolve to the same value (${getComputedStyle(el).color}).`), found;
		}
	}

	// overflow is caught above; this checks the declaration is satisfied: scroll box scrolls, clip box clips.
	if (layout.grows === false && layout.overflow !== "truncate"){
		const render = room.firstElementChild;
		const want = layout.overflow === "scroll" ? ["auto", "scroll"] : ["hidden", "clip"];
		const kept = render && [render, ...render.querySelectorAll("*")]
			.some(el => want.includes(getComputedStyle(el).overflowY));

		if (!kept) say("growth", `It declares \`overflow: "${layout.overflow}"\` and no box in it computes to that — the declaration is not true of the layout.`);
	}

	return found;
}

// Two children on one line when vertical ranges overlap, never just on matching top values.
function ragged(room){
	const render = room.firstElementChild;
	const box = render?.firstElementChild;
	const items = [...(box?.children ?? [])].map(el => el.getBoundingClientRect()).filter(r => r.width);
	if (items.length < 2) return null;

	const rows = [];
	items.forEach(r => {
		const row = rows.find(line => line.some(o => r.top < o.bottom - 1 && o.top < r.bottom - 1));
		row ? row.push(r) : rows.push([r]);
	});

	if (rows.length < 2) return null;

	const widest = Math.max(...rows.map(row => row.length));
	const last = rows.at(-1).length;

	return last < widest ? `${rows.length} rows, and the last holds ${last} of ${widest}.` : null;
}

export function audit(layouts, width){
	return layouts.map(layout => ({ name: layout.name, found: prove(layout, width) }));
}

export const fatal = one => one.kind !== "ragged";

export default check;
