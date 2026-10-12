import { JSONL } from "../../ext/JSONL/JSONL.js";
import { View, div, span, small, button, a, p } from "../View/View.js";

View.stylesheet(import.meta, "PageInbox.css");

/* PAGEINBOX — one page's inbox tab: what agents left on it, unread first, archive to zero.
 * Reads the page's own page.jsonl (streamed with JSONL.live), so it shows with Servex down;
 * only marking read / archiving needs Servex (the one writer), as an appended delta, never a delete.
 * Decisions and the alternative: core/Page/doc/inbox-tab.md. */

// page.jsonl folded into notes: `note` (page_note), `inbox` (drop) and `note_state` (read/archived).
class NotesLog extends JSONL {
	static verbs = [...JSONL.verbs, "note", "inbox", "note_state"];
	items = new Map();
	states = new Map();

	note(v){ if (v?.id && v.text) this.items.set(v.id, { id: v.id, from: v.from, to: v.to, text: v.text, at: v.at }); }
	inbox(v){
		if (v?.coordinator || !v) return;
		if (v.cleared) return void this.states.set(v.id, { state: "archived", at: v.cleared.at });
		if (v.routed_to || !v.text) return;                       // a routed note went to its coordinator
		const from = v.from ?? v.author, id = v.id ?? `${v.at}-${from}`;
		this.items.set(id, { id, from, text: v.text, at: v.at });
	}
	note_state(v){ if (v?.id) this.states.set(v.id, v); }
	reset(){ super.reset(); this.items = new Map(); this.states = new Map(); return this; }
}

export default class PageInbox {
	static Log = NotesLog;

	constructor(...args){ this.assign({ seen: new Set() }, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	get log(){ return this._log ??= new this.constructor.Log({ url: this.page.url + "page.jsonl" }); }

	// Each note with its state (new · read · archived), newest first.
	get notes(){
		return [...this.log.items.values()]
			.map(n => ({ ...n, state: this.log.states.get(n.id)?.state ?? "new" }))
			.sort((x, y) => Date.parse(y.at) - Date.parse(x.at));
	}
	get unread(){ return this.notes.filter(n => n.state === "new"); }

	// Start streaming once; `changed` fires on every batch, so the tab label and the list stay current.
	start(){
		return this._started ??= this.log.live(() => this.changed()).then(() => this.changed());
	}
	changed(){
		const n = this.unread.length;
		if (this.section) this.section.label = n ? `Inbox · ${n}` : "Inbox";
		this.page.nav_redraw?.();
		this.draw?.();
	}

	// Append one delta per note through Servex. A refusal leaves the note exactly as it was.
	async mark(ids, state, quiet){
		if (!ids.length) return;
		this.said = null;
		try {
			// Imported here, not at the top: servex.js probes Servex the moment it loads, and most pages never mark anything.
			const { servex_base, servex_fetch } = await import("./ext/Inbox/servex.js");
			const r = await servex_fetch(`${servex_base()}/api/inbox/mark`, { method: "POST",
				headers: { "content-type": "application/json" }, body: JSON.stringify({ path: this.page.url, ids, state }) });
			const j = await r.json();
			if (j.ok === false) throw new Error(j.why);
		} catch (e){ if (!quiet){ this.said = `Not saved: ${e.message}. Marking needs Servex running.`; this.draw?.(); } }
	}

	// The built-in `inbox/` page every Page answers to (Page.child): a config for `add()`.
	static route(page){
		const mailbox = page.mailbox ??= new this({ page });
		return { title: "Inbox", render(){ return this.view ??= div.c("page standard page--inbox", () => mailbox.view()); } };
	}

	// A small "Inbox · N" link for the end of a page, only when something is open; undefined otherwise.
	static async chip(page){
		const mailbox = page.mailbox ??= new this({ page });
		await mailbox.start();
		const open = mailbox.notes.filter(n => n.state !== "archived").length;
		return open ? a(`Inbox · ${open}${mailbox.unread.length ? ", " + mailbox.unread.length + " new" : ""}`).href(page.url + "inbox/") : undefined;
	}

	// The tab's view. Opening it reads every new note (one delta each); this visit still shows them as new.
	view(){
		const $box = div.c("page-inbox flex v");
		this.draw = () => $box.empty(() => this.rows());
		this.draw();
		this.start().then(() => {
			this.notes.filter(n => n.state === "new").forEach(n => this.seen.add(n.id));
			this.mark([...this.seen].filter(id => this.log.states.get(id)?.state !== "read"), "read", true);
		});
		return $box;
	}

	rows(){
		const live = this.notes.filter(n => n.state !== "archived"), old = this.notes.length - live.length;
		const fresh = live.filter(n => n.state === "new" || this.seen.has(n.id));
		div.c("page-inbox-head flex v-center", () => {
			span.c("page-inbox-count", live.length ? `${fresh.length} new · ${live.length - fresh.length} read` : "Inbox zero");
			if (live.length) button.c("page-inbox-archive-all", "Archive all").attr("type", "button")
				.click(() => this.mark(live.map(n => n.id), "archived"));
		});
		if (this.said) small.c("page-inbox-said", this.said);
		if (!live.length) p(old ? `Nothing open here. ${old} archived.` : "Nothing here yet. Agents leave notes with page_note; they land on this tab.");
		live.forEach(n => div.c("page-inbox-row flex v").ac(fresh.includes(n) && "page-inbox-new").append(() => {
			div.c("page-inbox-meta flex v-center", () => {
				if (fresh.includes(n)) span.c("page-inbox-dot").attr("title", "new").attr("aria-label", "new");
				a.c("page-inbox-from", n.from === "owner" ? "you" : n.from).href(`/framework/ai/sessions/${n.from}/`).attr("title", `${n.from}'s session`);
				small.c("page-inbox-age muted", n.at ? new Date(n.at).toLocaleString() : "");
				button.c("page-inbox-archive", "Archive").attr("type", "button").click(() => this.mark([n.id], "archived"));
			});
			span.c("page-inbox-text", n.text);
		}));
	}
}
