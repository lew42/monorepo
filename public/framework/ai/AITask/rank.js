import { span } from "../../core/View/View.js";
import { edit } from "../../ext/Ask/edit.js";
import Draggable from "../../ext/Draggable/Draggable.js";
import Sortable from "../../ext/Draggable/Sortable.js";
import { ranked } from "../../ext/JSONL/JSONL.js";
import FsFile from "/framework/ext/filesystem/FsFile.js";

// Overview and reasoning: doc/rank-notes.md
const WIRE = 2000;

/** Can this page write to the log at all? The one switch, ext/Ask/edit.js. */
export const writable = () => edit();

export function stamp(){
	const now = new Date();
	const off = -now.getTimezoneOffset();
	const pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate())
		+ "T" + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds())
		+ (off < 0 ? "-" : "+") + pad(off / 60) + ":" + pad(off % 60);
}

export async function append(m, entry){
	const reply = await Promise.race([
		FsFile.append(m.url, entry),
		new Promise(done => setTimeout(done, WIRE, null)),
	]);

	if (reply === true) return true;

	console.error("rank: the dev server refused the append — restart it (rpc:append landed 2026-08-31)", reply);
	return false;
}

export class Ranking {

	constructor(...args){ this.assign(...args); this.bands = []; }
	assign(...args){ return Object.assign(this, ...args); }

	id(item){ return item.id; }
	order(){ return this.m?.order?.(this.list) ?? []; }
	sort(items){ return ranked(items, this.order(), item => this.id(item)); }
	band($box){
		if (!writable()) return null;

		const band = new this.constructor.Band({ view: $box, ranking: this, handle: false });
		this.bands.push(band);
		return band;
	}
	ids(){ return this.bands.flatMap(band => band.ids()); }
	async moved(){
		const order = this.ids();
		if (await append(this.m, { rank: { list: this.list, at: stamp(), order } })) this.expect(order);
	}

	expect(order){
		setTimeout(() => {
			if (String(this.order()) === String(order)) return;
			console.warn("rank: the appended order never came back off the wire — applying it locally.", order);
			this.m.rank({ list: this.list, at: stamp(), order });
			this.redraw?.();
		}, WIRE);
	}
}

Ranking.Band = class RankBand extends Draggable {

	initialize(){
		super.initialize();
		this.$items = this.view.ac("drag-items");
		this.rows = new Map();          // element → the id it carries
	}

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

	wraps(){
		const tops = this.shown().map(el => Math.round(el.offsetTop));
		return new Set(tops).size < tops.length;
	}

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

	row(el){ return el ?? null; }
};

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

	commit(before){
		this.band.place(this.view.el, before);
		this.band.ranking.moved();
	}
};

Ranking.Drag.prototype.band = null;

export default Ranking;
