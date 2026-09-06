import { div, span, a } from "../View/View.js";
import { FIXTURES, arrange, tone_of, apply } from "./fixtures.js";

/* ── LayoutRules ───────────────────────────────────────────────────────────────

   Data on the layout page, one checker, one CSS class. No registry, no config
   file, no rules engine — a layout that says nothing accepts anything and goes
   anywhere (`accepts: "any"`, `allowed_in: "any"`), which is the owner's own
   instruction: *you don't want to overly restrict, or have to manage a massive
   whitelist.*

   THE DENY LIST IS THREE ITEMS, and the test for a fourth is one question: CAN CSS
   DO IT? If it can, it is a defect in `framework.css`, not a rule. The measure
   holds and centres, the three spacing ramps follow the box, `auto-fill` counts
   its own tracks — none of that needs a rule. These three are what is left.

     1 · width      a multi-column layout in a box narrower than its floor. Three
                    tracks in 300px is three 100px tracks and no clamp saves it;
                    the only answers are STACK TO THE FALLBACK or REFUSE, and that
                    is a decision the layout's author makes.
     2 · contrast   a dark island inside a dark band. A colour is legal at every
                    width; nothing in the cascade knows two tokens resolved to the
                    same value HERE. It has to be compared.
     3 · nesting    two mechanisms cancelling each other — a `full` inside a `full`,
                    a `sticky` inside an inner scroller. No value of any property
                    un-collapses a doubly-collapsed row.

   ⚠ DEV ONLY, AND IT NEVER BLOCKS. The gate is the same `dev` constant
     `Page.class.js:7` uses. On the static production host the checker never runs
     and `.page-layout-warn` is never stamped, so a rule that is wrong costs an
     agent a red outline and never costs a reader a page.                         */

const dev = ["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost");

export const RULES = {
	width: { title: "Width range", url: "/framework/styles/rules/proportion/" },
	contrast: { title: "Contrast", url: "/framework/styles/stacks/" },
	nesting: { title: "Nesting", url: "/framework/styles/rules/nesting/" },
};

/* ── THE CHECKER ───────────────────────────────────────────────────────────────
   `check(layout, el)` — `el` is the box the layout was placed in. Returns [] or a
   list of `{ rule, says, url }`, where `says` is a plain sentence a newcomer can
   act on and `url` is the page that argues it. A violation CITES its rule page
   rather than restating it. */
export function check(layout, el){
	if (!dev || !el) return [];

	const found = [];
	const room = el.clientWidth;
	const floor = layout.widths?.[0] ?? 0;

	if (room && floor && room < floor - 1)
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

/* Rule 2, cheapest form that is true: the element's own text colour resolves to the
   same value as the background it is painted on. `styles/stacks/hunt.json` is the
   measured census of the pairs this finds; the checker compares rather than
   restating that file. */
function same_tone(el){
	const style = getComputedStyle(el);
	const ink = style.color;
	const back = painted(el);

	return back && ink === back ? ink : null;
}

/* ⚠ `rgba(0, 0, 0, 0)` IS what a transparent background computes to — and so an
   "ends with , 0)" test calls PURE BLACK transparent and the contrast rule can never
   fire on the one pair it exists for. Match the whole alpha-zero form, nothing less
   (found by a negative control, 2026-09-06). */
const clear = bg => !bg || bg === "transparent" || /^rgba\(\s*[\d.]+,\s*[\d.]+,\s*[\d.]+,\s*0\s*\)$/.test(bg);

function painted(el){
	for (let node = el; node && node.nodeType === 1; node = node.parentElement){
		const bg = getComputedStyle(node).backgroundColor;
		if (!clear(bg)) return bg;
	}
	return null;
}

/* Rule 3 — the two shapes that are real on this site today. Both are read off the
   DOM, never off a declaration: a `full` inside a `full` collapses a row that is
   already collapsed, and `position: sticky` sticks to its nearest SCROLLING
   ancestor, so a sticky rail inside a box with its own `overflow: auto` never
   reaches the page. */
function nesting(layout, el){
	const said = [];

	if (layout.room === "solo" && el.closest(".page-w-full"))
		said.push("A full-width layout inside a `full` page collapses a row that is already collapsed — the inner page has no host left to be full of.");

	/* ⚠ READ OFF THE DOM, NEVER OFF A TAG. This asked `tags.includes("sticky-header")`
	   for one hour and fired on two layouts that stick nothing — a tag is what a
	   layout is FILED under, and a mechanism collision is what it DOES. */
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

/* ── HOW A VIOLATION SHOWS ─────────────────────────────────────────────────────
   Visible, never blocking: a dashed outline and a badge with the count. Clicking
   the badge opens the rule page that argues it. */
export function warn($view, found){
	if (!found.length) return $view;

	return $view.ac("page-layout-warn").append(() =>
		div.c("page-layout-warn-badge", () => {
			span(found.length + (found.length === 1 ? " rule" : " rules"));
			found.forEach(one => a.c("page-layout-warn-line", one.says).href(one.url));
		}));
}

/* ── THE FIXTURE RUN — what "approved" means (deliverable 17) ───────────────────

   A layout is APPROVED when every fixture passes at every strip width. What is
   read back, in order:

     overflow   anything whose scrollWidth beats its clientWidth while its own
                overflow-x is `visible` — content escaping a box that never said
                it could scroll.
     edge       text or a framed box at the host's own edge. The host carries the
                page's gutters, so this fires only when the layout escapes them.
     measure    a paragraph wider than 46em. Every prose slot is capped at the
                measure by the fixture (fixtures.js), so this fires only when a
                layout overrides that — which is the bug it is looking for.
     contrast   the same comparison rule 2 makes, run on every text node.
     growth     the vertical twin of rule 1 (the owner, addendum 4). A layout that
                says `grows: false` must ALSO say what happens to content longer
                than the box — `scroll`, `clip` or `truncate` — and the longest-text
                fixture is the test: the box overflowed, so did the declared thing
                actually happen? A bounded layout that declares nothing is a DRAFT
                with no run needed.
     ragged     wrapping layouts only, at 1 · 2 · 3 · 5 · 7 items. A last row with
                fewer items than the row above is a FINDING, not a failure — for a
                `grid auto-fill` wall it is correct behaviour, and the reader is
                shown the count it happens at rather than a verdict.

   ⚠ A DIV IS NOT A VIEWPORT. The host is a fixed-width box, so a `@media` query
     inside a layout answers the real window and not the width being proven. None
     of the thirty uses one — they are clamps and intrinsic tracks — but the honest
     way to run this is to set the REAL viewport to each strip width, which is what
     the headless probe does and what the recorded `approved:` dates come from. */
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

/* The measured host: the page's own gutters, at the width being proven, hidden but
   still LAID OUT. ⚠ `visibility: hidden`, never `display: none` — a display-hidden
   box is not measured at all, which is the whole thing being bought (Frame.js). The
   clipper around it is what stops a 3440 host from scrolling a 1280 window. */
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

	/* THE DECLARATION HAS TO BE TRUE SOMEWHERE. The spill itself is caught above —
	   a fixed-height box with `overflow: visible` that overflowed is the failure. This
	   asks the other half: a layout that says `overflow: "scroll"` must have a box
	   that actually scrolls, and one that says `"clip"` must have a box that clips.
	   ⚠ Not the root only. In `rows` the ROOT clips (a bounded box is bounded) and it
	     is the BODY that scrolls — two boxes, one contract. */
	if (layout.grows === false && layout.overflow !== "truncate"){
		const render = room.firstElementChild;
		const want = layout.overflow === "scroll" ? ["auto", "scroll"] : ["hidden", "clip"];
		const kept = render && [render, ...render.querySelectorAll("*")]
			.some(el => want.includes(getComputedStyle(el).overflowY));

		if (!kept) say("growth", `It declares \`overflow: "${layout.overflow}"\` and no box in it computes to that — the declaration is not true of the layout.`);
	}

	return found;
}

/* Two children are on ONE line when their vertical ranges OVERLAP — never when
   their `top` values match. Under `align-items: center` two children of different
   heights on the same line have different tops, which read the homepage's one-line
   topbar as three lines (the layout skill, 2026-09-05). */
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

/* Every layout at one width. The verdict is in `found`: a layout with no finding of
   kind `overflow`, `edge`, `measure`, `contrast` or `growth` at any width is
   approved; a `ragged` finding is reported and does not decide anything. */
export function audit(layouts, width){
	return layouts.map(layout => ({ name: layout.name, found: prove(layout, width) }));
}

export const fatal = one => one.kind !== "ragged";

export default check;
