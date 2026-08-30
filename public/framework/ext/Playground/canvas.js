import { div, span } from "/framework/core/View/View.js";
import { Box, Flex, Grid } from "./items.js";

/* The canvas column — moved out of Playground.js once it passed design §9's ~150-line
 * guide (a move, not a rewrite; every line below was already Playground.js's own).
 * Selection, repaint, `set_viewport` and the properties column stay in Playground.js —
 * `set_viewport` also has to repaint `toolbar.js`'s preset buttons, and importing THAT
 * from here would import canvas.js back from toolbar.js (`code` skill's own warning:
 * a parent↔child cycle breaks only on deep reload). This file only ever touches
 * `.pg-canvas` / `.pg-canvas-body` / `.pg-viewport`.
 *
 * pg-resize: resize handles between adjacent Flex children — `resize_handles()`,
 * `position_handles()`. doc/decisions.md has the rules (grow math, fixed-sidebar,
 * the width-clearing needed to beat `items.js`'s own shorthand-collision).
 *
 * pg-geometry: Grid columns/rows got their own handles (`grid_resize_handles()`,
 * unambiguous templates only — doc/decisions.md), the drag clamp everywhere now reads
 * `.pg-node`'s own min-width live instead of guessing (`floor_px`), and a wrapped Flex
 * gets no handles at all (bound, not fixed — same doc). The grow-commit's own
 * min-width skew (pg-resize) was RE-MEASURED, not re-formulaed — doc/decisions.md. */

// Builds `.pg-canvas`: the delegated click listener (`closest` walks up from whatever
// was actually clicked, so a leaf under your pointer wins on the FIRST click — never the
// enclosing group first (panel-insight §Carry — `focus.js:93`'s counter-example) — and
// `pg.$body`, the node `paint_canvas()`/`Playground.apply_change()` write into.
//
// A `.pg-add` click is checked FIRST and returns early (pg-placeholder brief item 2): the
// + is its own destination, so it must never also fall through to `pg.select()` on the box
// it sits inside. `closest("[data-id]")` from the + always lands on its OWN owning
// `.pg-node` — the + carries no `data-id` itself, so the walk cannot stop early on it.
//
// Shift-click adds a Flex instead of a Box (pg-shift) — explicit beats magic: no
// auto-convert, `e.shiftKey` alone picks the Type, read straight off the native click event
// `add_to` already receives.
export function canvas(pg){
	return pg.$canvas = div.c("pg-canvas", () => {
		pg.$body = div.c("pg-canvas-body").on("click", e => {
			// A handle owns its own pointer events end to end — including the CLICK that
			// never travelled, which `resize_handles` turns into an insert-between. Nothing
			// for this listener to do either way; a handle must never fall through to select.
			if (e.target.closest?.(".pg-resize-handle")) return;

			// The edge inserters (pg-edges). Same early-out shape as `.pg-add`'s: the strip
			// is its own destination, so it must never also select the box it sits on — and
			// carrying no `data-id` itself, `closest("[data-id]")` from it always lands on
			// its OWN owning node. Shift picks a Flex, exactly as both other add paths do.
			const edge = e.target.closest?.(".pg-edge");
			if (edge){
				e.stopPropagation();
				const owner = edge.closest("[data-id]");
				if (owner) pg.insert_at(pg.doc.find(owner.dataset.id), edge.dataset.side, e.shiftKey ? Flex : Box);
				return;
			}

			// `⧉` / `✕`, moved off the toolbar onto the node they act on. Both are verbs on
			// the SELECTION, so the chip selects its owner first — belt and suspenders, since
			// a chip is only ever visible on a node that is already selected.
			const chip = e.target.closest?.(".pg-chip");
			if (chip){
				e.stopPropagation();
				const owner = chip.closest("[data-id]");
				if (!owner) return;
				pg.select(owner.dataset.id);
				chip.dataset.act === "remove" ? pg.remove() : pg.duplicate();
				return;
			}

			const add = e.target.closest?.(".pg-add");
			if (add){
				e.stopPropagation();
				const owner = add.closest("[data-id]");
				if (owner) pg.add_to(pg.doc.find(owner.dataset.id), e.shiftKey ? Flex : Box);
				return;
			}

			const hit = e.target.closest?.("[data-id]");
			if (hit) pg.select(hit.dataset.id);
		});
	});
}

// `.pg-viewport` is the "canvas box" of design §4 — its `width` is the preset, and
// `.pg-canvas-body`'s `justify-content: center` (playground.css) centres it.
export function paint_canvas(pg){
	pg.$body.empty(() => { div.c("pg-viewport", () => { pg.constructor.Canvas.render(pg.doc, pg); }); });
	watch_geometry(pg);
	position_handles(pg.$body.el);
}

/* Handles carry COMPUTED coordinates, so anything that resizes the canvas box without
 * repainting leaves them behind. `Playground.set_viewport()` is exactly that — a preset
 * is one CSS variable, no data change, no repaint — and it put the r2|r3 handle 143.05px
 * from its own gap, measured, with a hover afterwards NOT recovering it. That is the
 * owner's "columnar resizers sometimes appear in the wrong place", and it survives the
 * jank fix because it was never about hovering.
 *
 * One ResizeObserver on `.pg-viewport` answers the whole class at the moment the geometry
 * actually moves — preset change, window resize, a rail grip drag — instead of on every
 * pointer move over the canvas. It cannot loop: `position_handles` only writes `left`/`top`
 * on absolutely positioned children, which are outside their parent's own auto-size.
 * `.pg-viewport` is rebuilt by every repaint, so the ONE observer re-aims at the new box. */
function watch_geometry(pg){
	pg.geometry ??= new ResizeObserver(() => position_handles(pg.$body.el));
	pg.geometry.disconnect();
	pg.geometry.observe(pg.$body.el.firstElementChild);
}

// `static Canvas` — a part, not a method, so a subclass could replace only how the
// canvas draws (`code` skill §3). `render` never reads a framework class — inline style
// beats every `@layer`, and it makes the future readout free (design §4). Attached onto
// `Playground` itself (`Playground.Canvas = Canvas`, back in Playground.js) so
// `pg.constructor.Canvas.render` above still resolves through the live class, not this
// module's lexical binding.
//
/* A node "stacks" when one more block child at the bottom is the natural next slot — a
 * Box (block flow) or a column Flex. Those keep the blocky + IN FLOW and playground.css
 * reserves its room permanently, so revealing it costs zero layout shift (pg-interactions:
 * the old `display: none` -> `block` grew the viewport 37px on EVERY hover, measured).
 * A row Flex or a Grid would have to hand the + a whole column or cell, so theirs is
 * absolutely positioned in the corner instead — the same zero-shift promise, by the other
 * construction the brief allows. Nothing else reads this class; it is purely the switch. */
const stacks = item => !(item instanceof Grid) && (!(item instanceof Flex) || (item.get("direction") || "row") === "column");

// `.pg-add` — every box, not just Flex/Grid (pg-placeholder brief item 3: `is_container`
// only gates the TOOLBAR rule, and a plain Box can parent same as any other item). Always
// the LAST direct child, so a click lands the new item exactly where the ghost sat.
// Revealed purely by `.pg-node.pg-selected:hover > .pg-add` (playground.css) — an
// affordance you only see on the box you have already chosen, which is also the box the
// pointer is still on, so the + lands under the cursor that just selected it. `pg-node-empty`
// gives a real item with zero children a bigger hover target (playground.css's ~2em floor) —
// it is never on the class list otherwise, so a populated box never grows from it.
/* The four edge inserters and the node's own `⧉`/`✕` (pg-edges). Both are `position:
 * absolute` INSIDE the node's own box — never straddling its border: an overhang would push
 * `.pg-canvas-body`'s `overflow: auto` into a scrollbar, and a scrollbar appearing on hover
 * is exactly the 0px-shift promise broken, by the long way round.
 *
 * The STRIP is the click target, not the chip — a 12px band down a whole edge is a target
 * you can hit without aiming, and the chip is only the picture of what the click will do.
 * Order matters: left/right are built LAST, so at the same z-index they win the four
 * corners, which makes the ambiguous corner deterministically a ROW insert.
 *
 * Neither is drawn on the root: it has no siblings to insert beside, and `remove()` refuses
 * it anyway. The root's own affordance is the centre `+`, same as any other container. */
const SIDES = ["top", "bottom", "left", "right"];

function node_chrome(item){
	if (!item.parent) return;

	SIDES.forEach(side => {
		div.c(`pg-edge pg-edge-${side}`, () => { div.c("pg-edge-add", "+"); })
			.attr("data-side", side)
			.attr("title", `Insert a sibling ${side === "left" || side === "right" ? "beside" : side === "top" ? "above" : "below"} this box — ${FLOW_WORD[side]} (Shift: a Flex)`);
	});

	div.c("pg-chips", () => {
		div.c("pg-chip", "⧉").attr("data-act", "duplicate").attr("title", "Duplicate this box beside itself");
		div.c("pg-chip", "✕").attr("data-act", "remove").attr("title", "Remove this box");
	});
}

const FLOW_WORD = { left: "makes a row", right: "makes a row", top: "makes a column", bottom: "makes a column" };

export class Canvas {
	static render(item, pg){
		return div.c("pg-node", () => {
			if (item.data.label) span.c("pg-node-label", item.data.label);
			item.items.each(kid => this.render(kid, pg));
			if (item instanceof Flex) resize_handles(item, pg);
			if (item instanceof Grid) grid_resize_handles(item);
			node_chrome(item);
			div.c("pg-add", "+");
		})
			.ac(item.items.length === 0 && "pg-node-empty")
			.ac(stacks(item) && "pg-stack")
			.attr("data-id", item.id).attr("style", item.styles());
	}
}

/* Resize handles — one per gap between adjacent Flex children. `position: absolute`
 * (playground.css) is what makes "reserves zero flow space" true by CONSTRUCTION, not
 * by cancelling gap math against a negative margin: an absolutely positioned child is
 * excluded from both the flex layout AND its parent's own auto-size, so sibling rects
 * can never move because a handle exists. Column direction falls out of the same code
 * path for free — `row` just picks which axis/coordinate is "main" throughout.
 *
 * pg-geometry item 3 (wrapped flex): bound, not fixed. A wrapped row's adjacent DOM
 * children can land on different visual lines — the flanking-pair math above assumes a
 * single row/column, so it would pair the wrong boxes. Row-line clustering (group by
 * `offsetTop`) is a real fix but a second geometry model on top of this one; disabling
 * handles on `wrap: "wrap"` is the brief's own fallback and the cheap, correct-by-
 * construction choice for this pass — no handles is provably right, a wrong pairing
 * is not. See doc/decisions.md. */
const HANDLE_MIN = 8;   // px floor during drag — never let a flank collapse through zero (fallback only, see floor_px)
const round2 = v => Math.round(v * 100) / 100;
/* `key` is the MAIN-axis size key of the container being dragged — `width` in a row,
 * `height` in a column. Passing it in is the whole of the pg-interactions drag fix: this
 * read used to be hardcoded to `width`, and so did both commits below, so a VERTICAL drag
 * in a column flex wrote its pixel answer into `width` — which `items.js#size_decls` then
 * renders as the CROSS axis, `width: <len>`. The owner's "vertical resize sometimes
 * strangely changes width" was that, exactly. */
const is_fixed_len = (item, key) => { const v = item.get(key); return !!v && v !== "hug" && v !== "fill"; };

// pg-geometry item 2: `.pg-node`'s own `min-width`/`min-height` (playground.css, shared
// chrome outside this file's fence) is a real floor CSS applies BEFORE distributing grow
// — read live off the flank itself (never hardcoded) so the drag clamp always matches
// whatever the cascade actually enforces, at that element's own font-size.
const floor_px = (el, row) => parseFloat(getComputedStyle(el)[row ? "minWidth" : "minHeight"]) || HANDLE_MIN;

/* pg-edges item 2 — a press that never travels this far is a CLICK, not a resize: it
 * inserts a box between the pair the handle flanks (the owner's "inserting between items"
 * case). A real drag still resizes, and the two can never be confused by accident: 5px is
 * more than a hand's tremor and far less than a deliberate drag. */
const CLICK_SLOP = 5;

function resize_handles(item, pg){
	const kids = item.items.children;
	if (kids.length < 2) return;
	if (item.get("wrap") === "wrap") return;   // pg-geometry item 3 — bound (comment above), doc/decisions.md
	const row = (item.get("direction") || "row") === "row";
	const main = row ? "width" : "height";   // the axis this container's drag actually resizes

	for (let i = 0; i < kids.length - 1; i++){
		const a = kids[i], b = kids[i + 1];
		let elA, elB, fixedSide, startA, startB, startPos, liveA, liveB, floorA, floorB, moved;

		div.c(`pg-resize-handle ${row ? "pg-resize-col" : "pg-resize-row"}`)
			.attr("data-gap", i).attr("title", "Drag to resize — click to insert a box here (Shift: a Flex)")
			.on("pointerdown", function(e){
				e.preventDefault();
				e.stopPropagation();
				this.el.setPointerCapture(e.pointerId);
				this.ac("pg-dragging");
				moved = false;

				const container = this.el.parentElement;
				elA = container.querySelector(`[data-id="${a.id}"]`);
				elB = container.querySelector(`[data-id="${b.id}"]`);
				// Exactly one fixed length -> that one moves. Both fixed -> the brief's
				// "nearer one"; simplest deterministic reading is the first (left/top)
				// flank — an edge-aware version was cut, unproven and unrequested.
				fixedSide = is_fixed_len(a, main) ? a : is_fixed_len(b, main) ? b : null;

				floorA = floor_px(elA, row); floorB = floor_px(elB, row);
				const rectA = elA.getBoundingClientRect(), rectB = elB.getBoundingClientRect();
				startA = row ? rectA.width : rectA.height;
				startB = row ? rectB.width : rectB.height;
				startPos = row ? e.clientX : e.clientY;
				liveA = startA; liveB = startB;
			})
			.on("pointermove", function(e){
				if (!this.hc("pg-dragging")) return;
				const d = (row ? e.clientX : e.clientY) - startPos;
				if (Math.abs(d) >= CLICK_SLOP) moved = true;   // past the slop it is a drag, and stays one

				// Live feedback is a provisional inline `flex` — never the commit (design's
				// own rule, decisions.md): only the fixed side moves in fixed-sidebar mode,
				// its un-fixed neighbour reflows on its own via the browser's flex math.
				// Clamped at each flank's OWN floor (not the generic HANDLE_MIN) so the
				// live rect can never claim a size the CSS floor would refuse to render —
				// the drag "stops where the floor starts" (brief's own phrase, item 2).
				if (fixedSide === a){ liveA = Math.max(floorA, startA + d); elA.style.flex = `0 0 ${liveA}px`; }
				else if (fixedSide === b){ liveB = Math.max(floorB, startB - d); elB.style.flex = `0 0 ${liveB}px`; }
				else {
					liveA = Math.max(floorA, startA + d);
					liveB = Math.max(floorB, startB - d);
					elA.style.flex = `0 0 ${liveA}px`;
					elB.style.flex = `0 0 ${liveB}px`;
				}

				position_handles(this.el.closest(".pg-canvas-body"));
			})
			.on("pointerup", function(e){
				if (!this.hc("pg-dragging")) return;
				this.el.releasePointerCapture(e.pointerId);
				this.rc("pg-dragging");

				if (!moved){
					// A click. Commit NOTHING — an idle `pointermove` may already have written
					// a provisional inline `flex`, so both flanks are re-stamped from their own
					// data first, and no `grow` is ever silently rewritten by a click that only
					// meant "put one here". `insert_between` leaves the selection alone, so this
					// container's other gaps stay lit for the next one.
					elA.setAttribute("style", a.styles());
					elB.setAttribute("style", b.styles());
					pg.insert_between(a, b, e.shiftKey ? Flex : Box);
					return;
				}

				if (fixedSide){
					// The stored LENGTH changes; the other flank's data is never touched
					// (proof (b)) — it reflows because it was already hug/fill, not because
					// we wrote anything onto it. `main`, never a hardcoded `width` — in a
					// column the number under the pointer is a HEIGHT (pg-interactions).
					fixedSide.set(main, Math.round(fixedSide === a ? liveA : liveB) + "px");
				} else {
					// grow_i = px_i / min_px (brief's own formula, pg-resize) — kept AS-IS
					// (pg-geometry item 2's own measuring found no simple closed-form fix:
					// a floor-adjusted "excess above floor" ratio was tried and measured
					// WORSE at an extreme ratio than this plain one, doc/decisions.md's own
					// numbers). The MAIN-axis length is cleared on both flanks for the
					// shorthand-collision reason already documented (items.js#common,
					// decisions.md) — `main`, so a column clears `height` and leaves any
					// cross-axis `width` the box already had completely alone.
					const min = Math.min(liveA, liveB);
					a.set(main, ""); a.set("basis", "0"); a.set("grow", String(round2(liveA / min)));
					b.set(main, ""); b.set("basis", "0"); b.set("grow", String(round2(liveB / min)));
				}

				// Belt-and-suspenders: if every .set() above happened to no-op (same
				// value as before), `change` never fires and the live provisional
				// `flex` override would otherwise be left stuck on the DOM.
				elA.setAttribute("style", a.styles());
				elB.setAttribute("style", b.styles());
				position_handles(this.el.closest(".pg-canvas-body"));
			});
	}
}

/* Grid resize handles (pg-geometry item 1) — same `pg-resize-handle` shape, dragging
 * the CONTAINER's own `columns`/`rows` template instead of a child's flex properties.
 * A track's pixel size is read off the CONTAINER's own computed `grid-template-columns`/
 * `-rows` (the browser has already resolved every `fr`/`%` to real px) rather than off
 * sibling rects — a spanning or multi-row child breaks DOM-adjacency, tracks never do.
 * Only two authored template shapes are unambiguous enough to drag: every track a
 * literal length, or every track `fr` (`grid_track_mode`) — `auto`, `minmax()`,
 * `repeat()` and mixed units get NO handles, the brief's own bound rather than a
 * guessed drag (doc/decisions.md). Rows fell out free — same math, the other axis. */
const TRACK_LEN = /^[\d.]+(px|em|rem|%|ch|vw|vh)$/;
const TRACK_FR = /^[\d.]+fr$/;
const grid_track_mode = str => {
	const tokens = (str || "").trim().split(/\s+/).filter(Boolean);
	if (tokens.length < 2) return null;
	if (tokens.every(t => TRACK_LEN.test(t))) return "len";
	if (tokens.every(t => TRACK_FR.test(t))) return "fr";
	return null;   // auto / minmax() / repeat() / mixed units — semantically ambiguous
};
const track_px = (el, prop) => getComputedStyle(el)[prop].split(" ").map(parseFloat);

function grid_resize_handles(item){
	[["columns", "gridTemplateColumns", true], ["rows", "gridTemplateRows", false]].forEach(([key, cssProp, isCol]) => {
		const mode = grid_track_mode(item.get(key));
		if (!mode) return;
		const count = item.get(key).trim().split(/\s+/).length;

		for (let i = 0; i < count - 1; i++){
			let container, startA, startB, startPos, liveA, liveB, floor;

			div.c(`pg-resize-handle pg-resize-grid ${isCol ? "pg-resize-col" : "pg-resize-row"}`)
				.attr("data-gap", i).attr("data-axis", key).attr("title", "Drag to resize")
				.on("pointerdown", function(e){
					e.preventDefault();
					e.stopPropagation();
					this.el.setPointerCapture(e.pointerId);
					this.ac("pg-dragging");

					container = this.el.parentElement;
					// Same `.pg-node` floor Flex's own handle is clamped to (pg-geometry
					// item 2's fix) — a fixed-length track can't render below its own
					// item's min-width either, discovered proving item 1's own fixture. One
					// sample child stands for the row: every cell shares the same class and
					// (in every fixture this ships with) the same font-size context.
					const sample = container.querySelector(":scope > [data-id]");
					floor = sample ? floor_px(sample, isCol) : HANDLE_MIN;
					const px = track_px(container, cssProp);
					startA = px[i]; startB = px[i + 1];
					startPos = isCol ? e.clientX : e.clientY;
					liveA = startA; liveB = startB;
				})
				.on("pointermove", function(e){
					if (!this.hc("pg-dragging")) return;
					const d = (isCol ? e.clientX : e.clientY) - startPos;
					liveA = Math.max(floor, startA + d);
					liveB = Math.max(floor, startB - d);

					// Live feedback: the OTHER tracks keep their own current computed px
					// (re-read fresh, not just the two flanks) so a mid-drag repaint of a
					// sibling handle can never desync from what's actually on screen.
					const px = track_px(container, cssProp);
					px[i] = liveA; px[i + 1] = liveB;
					container.style[cssProp] = px.map(v => `${round2(v)}px`).join(" ");
					position_handles(this.el.closest(".pg-canvas-body"));
				})
				.on("pointerup", function(e){
					if (!this.hc("pg-dragging")) return;
					this.el.releasePointerCapture(e.pointerId);
					this.rc("pg-dragging");

					// Fresh split of the LIVE data (never the `mode` closure's own stale
					// snapshot) — a second drag on a different handle, after the first
					// already committed, must not resurrect the pre-first-drag tokens.
					const tokens = item.get(key).trim().split(/\s+/);
					if (mode === "len"){
						// Already clamped to `floor` on every pointermove, so the committed
						// length can never ask for less room than the track's own occupant
						// will render at — WYSIWYG by construction, same as the fixed-
						// sidebar Flex case.
						tokens[i] = `${Math.round(liveA)}px`;
						tokens[i + 1] = `${Math.round(liveB)}px`;
					} else {
						// Same px_i/min_px formula as the Flex grow commit (item 2's own
						// finding: a floor-adjusted ratio measured WORSE at an extreme ratio,
						// doc/decisions.md) — an `fr` template inherits the identical,
						// documented, kept-as-is boundary.
						const min = Math.min(liveA, liveB);
						tokens[i] = `${round2(liveA / min)}fr`;
						tokens[i + 1] = `${round2(liveB / min)}fr`;
					}
					item.set(key, tokens.join(" "));

					// Belt-and-suspenders (same reason as the Flex handle's own): a no-op
					// `.set()` never fires `change`, so the live provisional inline
					// template has to be cleared explicitly either way.
					container.style[cssProp] = "";
					container.setAttribute("style", item.styles());
					position_handles(this.el.closest(".pg-canvas-body"));
				});
		}
	});
}

// A pure-DOM pass, run after the tree it measures is fully built and styled (never
// from inside `Canvas.render` — the node's OWN `style` attribute, which is what makes
// it a flex container at all, is only set AFTER its children are built, `.attr()`
// chained on the return value). Reads `:scope > [data-id]` for the flanking kids —
// that selector already excludes handles and `.pg-add` (neither carries `data-id`),
// so no separate filtering is needed.
export function position_handles(root){
	if (!root) return;

	root.querySelectorAll(".pg-resize-handle").forEach(handle => {
		if (handle.classList.contains("pg-resize-grid")){ position_grid_handle(handle); return; }

		const container = handle.parentElement;
		const kids = container.querySelectorAll(":scope > [data-id]");
		const i = Number(handle.getAttribute("data-gap"));
		const a = kids[i], b = kids[i + 1];
		if (!a || !b) return;

		const box = container.getBoundingClientRect();
		const rectA = a.getBoundingClientRect(), rectB = b.getBoundingClientRect();

		// `box` is the BORDER box, but `left`/`top` on an absolutely positioned child
		// resolve against the containing block's PADDING box — so every handle sat exactly
		// one border-width (1.00px, measured on all five) past its gap's true centre.
		// `clientLeft`/`clientTop` IS that border width, and costs no style resolve.
		if (handle.classList.contains("pg-resize-col")){
			const mid = (rectA.right - box.left + rectB.left - box.left) / 2;
			handle.style.left = `${mid - container.clientLeft}px`;
		} else {
			const mid = (rectA.bottom - box.top + rectB.top - box.top) / 2;
			handle.style.top = `${mid - container.clientTop}px`;
		}
	});
}

// Grid's own position pass reads the CONTAINER's template directly (track pixel widths
// + gap + padding), never sibling rects — the same "spans and multi-row layouts break
// DOM-adjacency" reasoning `grid_resize_handles` is already built on.
function position_grid_handle(handle){
	const container = handle.parentElement;
	const key = handle.getAttribute("data-axis");
	const isCol = key === "columns";
	const i = Number(handle.getAttribute("data-gap"));
	const cs = getComputedStyle(container);
	const px = track_px(container, isCol ? "gridTemplateColumns" : "gridTemplateRows");
	const gap = parseFloat(isCol ? cs.columnGap : cs.rowGap) || 0;
	const pad = parseFloat(isCol ? cs.paddingLeft : cs.paddingTop) || 0;

	const offset = pad + px.slice(0, i + 1).reduce((sum, v) => sum + v, 0) + gap * i + gap / 2;
	handle.style[isCol ? "left" : "top"] = `${offset}px`;
}

export default canvas;
