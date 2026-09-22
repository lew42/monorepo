import { span } from "../../core/View/View.js";
import Socket from "../../dev/Socket/Socket.js";
import { edit } from "../Ask/edit.js";
import Draggable from "../Draggable/Draggable.js";
import Sortable from "../Draggable/Sortable.js";
import { ranked } from "../JSONL/JSONL.js";

/**
 * RANKING — the owner drags a list into the order they want, and the order is
 * one line in that task's own `task.jsonl`.
 *
 * The list keeps the shape it already had. A card stays a card and a row stays
 * a row; all that is added is a **grip** on each one, and the order they are
 * drawn in. That is the whole of it:
 *
 *     const rank = new Ranking({ m, list: "asks" });     // m is the TaskJSONL
 *     items = rank.sort(items);                          // the file's order
 *     div.c("ai-asks", $wall => {
 *         const band = rank.band($wall);
 *         items.forEach(item => div.c("ai-ask", $card => band.grip($card, item.id)));
 *     });
 *
 * A list may be drawn in several **bands** (the Asks tab draws one grid per
 * topic). Each band is its own drop zone — you can reorder inside a topic, not
 * across topics — and a drop writes the whole list's order, band after band, so
 * one line always says everything.
 *
 * ⚠ THE WRITER DOES NOT APPLY ITS OWN LINE. The append goes up the dev socket
 *   and comes back off the wire like anybody else's, so there is one code path
 *   and the server is the only orderer — the rule `/layouts/browse/verdicts.js`
 *   set and the Decisions tab follows. `expect()` is the safety net.
 *
 * ⚠ Off the dev server there is no socket, so no grip is drawn at all. The
 *   order still renders, because the order is in the file. See `doc/ranking.md`.
 */

/* How long the wire gets to hand the writer its own line back. /imagine/stream/
   measures the real round trip at 9 ms. */
const WIRE = 2000;

/** Can this page write to the log at all? The one switch, ext/Ask/edit.js. */
export const writable = () => edit();

/**
 * An ISO timestamp carrying the reader's own offset, so a line says when it was
 * written where it was written — `toISOString()` would silently move it to UTC.
 * Every line this browser appends to a task log is stamped here.
 */
export function stamp(){
	const now = new Date();
	const off = -now.getTimezoneOffset();
	const pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate())
		+ "T" + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds())
		+ (off < 0 ? "-" : "+") + pad(off / 60) + ":" + pad(off % 60);
}

/** One line up the socket, into `m.url`. Answers true when the server took it. */
export async function append(m, entry){
	const reply = await Promise.race([
		Socket.singleton().async_rpc("append", m.url, JSON.stringify(entry)),
		new Promise(done => setTimeout(done, WIRE, null)),
	]);

	if (reply?.response === "append successful") return true;

	console.error("rank: the dev server refused the append — restart it (rpc:append landed 2026-08-31)", reply);
	return false;
}

export class Ranking {

	constructor(...args){ this.assign(...args); this.bands = []; }
	assign(...args){ return Object.assign(this, ...args); }

	/** How an item of this list says its own id. Overridable; every verb uses `id`. */
	id(item){ return item.id; }

	/** The order the log asks for — `[]` until somebody has dragged something. */
	order(){ return this.m?.order?.(this.list) ?? []; }

	/** One band's items, in the file's order. Unranked items keep their place at the end. */
	sort(items){ return ranked(items, this.order(), item => this.id(item)); }

	/** A drop zone over one box of rows. Returns null where there is no dev socket. */
	band($box){
		if (!writable()) return null;

		const band = new this.constructor.Band({ view: $box, ranking: this, handle: false });
		this.bands.push(band);
		return band;
	}

	/** Every band's ids, in the order they are on screen right now — one whole list. */
	ids(){ return this.bands.flatMap(band => band.ids()); }

	/* A drop landed. One `rank` line, the whole list, and then we wait for it to
	   come back off the wire like everybody else's. */
	async moved(){
		const order = this.ids();
		if (await append(this.m, { rank: { list: this.list, at: stamp(), order } })) this.expect(order);
	}

	/* On a working dev server this never fires: the appended line arrives, the
	   page redraws from it, and the list is already in this order. */
	expect(order){
		setTimeout(() => {
			if (String(this.order()) === String(order)) return;
			console.warn("rank: the appended order never came back off the wire — applying it locally.", order);
			this.m.rank({ list: this.list, at: stamp(), order });
			this.redraw?.();
		}, WIRE);
	}
}

/**
 * ONE BAND — a box of rows you can drag within.
 *
 * It is a `Draggable` with `handle: false`, which is `ext/Draggable`'s word for
 * "a drop target, never a grip": it registers the box so a dragged row can find
 * it, and binds no pointer listeners of its own.
 */
Ranking.Band = class RankBand extends Draggable {

	initialize(){
		super.initialize();
		this.$items = this.view.ac("drag-items");
		this.rows = new Map();          // element → the id it carries
	}

	/** Add the grip to one row, and remember which id that row is. */
	grip($row, id){
		this.rows.set($row.el, id);

		const $grip = span.c("ai-rank-grip", "⠿")
			.attr("title", "drag to rank")
			.attr("aria-label", "drag to rank");

		// ⚠ A DEDICATED GRIP, never the whole row. `Draggable.grab()` calls
		//   `start()` on every pointerdown with no movement threshold, so a
		//   whole-row handle hides and ghosts the row on a plain click — and both
		//   an ask card and a decision row open on a click. `ux/Tree` and
		//   `ext/Panel` both landed on the grip for the same reason.
		// ⚠ And the click that FOLLOWS the drag still bubbles, so a drop on a card
		//   whose body opens a sheet would open the sheet too.
		$grip.on("click", e => e.stopPropagation());

		new this.ranking.constructor.Drag({ view: $row, handle: $grip, band: this, id });
		return $grip;
	}

	/** My rows that are on screen, in DOM order — never the dragged one, which is hidden. */
	shown(){
		return [...this.view.el.children]
			.filter(el => this.rows.has(el) && el.getClientRects().length);
	}

	/* Put a row where the drop asked for.
	   ⚠ Appending to the BOX is not the same as putting it last: the Asks wall
	     keeps its detail sheet as that box's own last child, and a card appended
	     after it would sit below an invisible panel. Land after the last ROW. */
	place(el, before){
		if (before) return void before.before(el);

		const last = this.shown().filter(row => row !== el).at(-1);
		last ? last.after(el) : this.view.el.prepend(el);
	}

	/** The ids I am showing, top to bottom. This is what a `rank` line is made of. */
	ids(){ return [...this.view.el.children].filter(el => this.rows.has(el)).map(el => this.rows.get(el)); }

	/* Does this band WRAP? A grid of cards asks a different question of the cursor
	   than a column of rows does, and the answer is in the layout, not in a flag
	   the caller has to remember to set: two rows sharing a top means it wraps. */
	wraps(){
		const tops = this.shown().map(el => Math.round(el.offsetTop));
		return new Set(tops).size < tops.length;
	}

	/**
	 * The row a drop would land BEFORE, or null to land last.
	 *
	 * In a column, that is the first row whose vertical midpoint the cursor has
	 * not reached. In a WRAPPING grid it is reading order: a card is "after" the
	 * cursor if it starts on a lower line, or shares the cursor's line and its
	 * own midpoint is to the right.
	 */
	before(e, dragged){
		const wraps = this.wraps();

		for (const el of this.shown()){
			if (el === dragged.view.el) continue;
			const box = el.getBoundingClientRect();

			const after = wraps
				? box.top > e.clientY || (box.bottom > e.clientY && box.left + box.width / 2 > e.clientX)
				: e.clientY < box.top + box.height / 2;

			if (after) return el;
		}
		return null;
	}

	/* `Sortable` asks its container for the ELEMENT to insert the placeholder in
	   front of. Its own version looks the row up through a `core/Item` registry
	   this has none of — here the answer already is an element. */
	row(el){ return el ?? null; }
};

/**
 * ONE ROW'S DRAG, on `ext/Draggable`'s `Sortable` — pointer capture, the ghost,
 * the placeholder, Escape and the `.drag-source` display fix, all of it the
 * already-debugged half, kept whole.
 *
 * What is replaced is only where a drop LANDS: `Sortable` commits through
 * `item.move()` against a `core/Item` tree, and a ranked list has no Items —
 * it has ids and a file. `ux/Tree.Drag` overrides the same method for the same
 * reason.
 */
Ranking.Drag = class RankDrag extends Sortable {

	/* You can reorder inside a band, not across them: a drop is only valid over
	   the band this row already belongs to. Dragging an ask into another topic
	   would be a re-topic, which is an edit of the ask, not an order. */
	drop_check(target){ return target === this.band; }

	start(){
		super.start();
		// The ghost HUGS its own ink. `Sortable` clones the row at its real width,
		// which for a full-width decision row is a bar the width of the page sliding
		// around under the cursor (`ux/Tree` measured the same thing at 556px).
		this.ghost.style.maxWidth = "24em";
	}

	release(e){
		const where = this.locate(e);
		this.end();
		if (where) this.commit(where.before);
	}

	/* Put the row where it was dropped — in the DOM only — and let the band read
	   the new order off itself. The line goes to the server; the redraw comes
	   back off the wire. */
	commit(before){
		this.band.place(this.view.el, before);
		this.band.ranking.moved();
	}
};

Ranking.Drag.prototype.band = null;

export default Ranking;
