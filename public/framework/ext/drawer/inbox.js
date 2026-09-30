import { div, span, button, input, small } from "/framework/core/View/View.js";
import { servex_base, servex_fetch } from "/framework/ai2/inbox.js";

/* THE PAGE'S INBOX, at the top of the drawer's AI tab (page-inbox, 2026-09-30).
 *
 * Any agent (Servex's `drop` tool) or the owner (the "Leave a note" button here, which
 * posts to `POST /api/inbox/drop`) can leave a note on any page. This draws the open
 * ones, newest first: from · text · age · Clear. Nothing at all when there are none.
 * The notes live in `<page>/ai/log.jsonl`; Servex is the only writer and answers the
 * reads too (`GET /api/inbox`), so off the dev machine the inbox simply isn't drawn.
 * Docs: doc/inbox.md · Servex/doc/inbox.md. */

// A page's folder path: the url without its query or hash, ending in "/".
export const folder = page => String(page ?? location.pathname).split(/[?#]/)[0].replace(/\/?$/, "/");

// The open notes on a page, newest first; [] when Servex is not running.
export async function notes(page){
	try {
		const r = await servex_fetch(`${servex_base()}/api/inbox?path=${encodeURIComponent(folder(page))}`);
		return r.ok ? ((await r.json()).open ?? []) : [];
	} catch { return []; }
}

// How many are open — the count on the AI tab's label.
export const count = page => notes(page).then(n => n.length);

// "3m", "2h", "4d": how long ago a note was left.
export function age(at){
	const s = Math.max(0, (Date.now() - Date.parse(at)) / 1000);
	return s < 60 ? "now" : s < 3600 ? `${Math.floor(s / 60)}m` : s < 86400 ? `${Math.floor(s / 3600)}h` : `${Math.floor(s / 86400)}d`;
}

export class DrawerInbox {
	constructor(...args){ this.assign({ page: location.pathname, open: [] }, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	post(verb, body){
		return servex_fetch(`${servex_base()}/api/inbox/${verb}`, { method: "POST",
			headers: { "content-type": "application/json" }, body: JSON.stringify({ path: folder(this.page), ...body }) })
			.then(r => r.json());
	}

	// Tell the tab strip the new count (tabs.js listens), then redraw.
	changed(){
		window.dispatchEvent(new CustomEvent("drawer-inbox", { detail: { page: folder(this.page), n: this.open.length } }));
		this.draw();
	}

	load(){ return notes(this.page).then(open => { this.open = open; this.changed(); }); }

	drop(text){ return this.post("drop", { text }).then(() => this.load()); }
	clear(id){ return this.post("clear", { id }).then(() => this.load()); }

	/* The small "Leave a note" button, for the AI tab's head row. It opens a one-line
	 * input at the top of the inbox; Enter leaves the note, Escape puts it away. */
	button(){
		return button.c("drawer-inbox-add", "Leave a note").attr("type", "button")
			.attr("title", "A note on this page, for any agent (or you) to pick up and clear")
			.click(() => { this.writing = !this.writing; this.draw(); });
	}

	// The block itself. Captured now, filled when the notes arrive (no DOM after an await).
	view(){
		this.$box = div.c("drawer-inbox flex v");
		this.draw();
		this.load();
		return this.$box;
	}

	draw(){
		const $box = this.$box;
		if (!$box) return;
		$box.empty(() => {
			if (this.writing){
				const $in = input.c("drawer-inbox-input").attr("placeholder", "Leave a note on this page, then Enter").attr("aria-label", "Leave a note");
				$in.on("keydown", e => {
					if (e.key === "Escape"){ this.writing = false; this.draw(); }
					if (e.key !== "Enter" || !$in.el.value.trim()) return;
					this.writing = false;
					this.drop($in.el.value.trim());
				});
				setTimeout(() => $in.el.focus());
			}
			// Two lines: who and when, with Clear, over the note itself (the drawer is narrow).
			this.open.forEach(n => div.c("drawer-inbox-row flex v", () => {
				div.c("drawer-inbox-head flex v-center", () => {
					span.c("drawer-inbox-from", n.from);
					small.c("drawer-inbox-age muted", age(n.at)).attr("title", n.at);
					button.c("drawer-inbox-clear", "Clear").attr("type", "button").click(() => this.clear(n.id));
				});
				span.c("drawer-inbox-text", n.text);
			}));
		});
		$box.el.hidden = !this.writing && !this.open.length;
	}
}

export default DrawerInbox;
