import { div, span, button, input, small } from "/framework/core/View/View.js";
import { servex_base, servex_fetch } from "/framework/ai2/inbox.js";

/* THE PAGE'S INBOX — two different things share this one file, on purpose:
 * they're both "a message, on a page", they're just read from two different
 * places (2026-09-30, core/Page/ext/).
 *
 * 1. `DrawerInbox` (below) — the small "Leave a note" box at the top of the
 *    drawer's AI tab. Servex is the only writer and answerer (`/api/inbox`);
 *    off the dev machine the inbox simply isn't drawn. This half moved here
 *    unchanged from `ext/drawer/inbox.js` (task ai/2026-09-30/page-inbox/),
 *    which is now a one-line re-export so nothing importing it had to change.
 *
 * 2. `DrawerInbox.setup(page)` (new) — the EXTENSION. A page.jsonl line,
 *    `{"ext": "Inbox"}`, turns it on for that one page; `Page.use(DrawerInbox)`
 *    (core/Page/Page.class.js) would turn it on for every page. Either way,
 *    every `{"inbox": {type, author, text, at}}` line already in that page's
 *    own page.jsonl — any agent, or the owner, just appending a message —
 *    collects into `page.inbox`, oldest first. This is content, read straight
 *    off the page's own log; part 1 above is coordination, read through
 *    Servex. core/Page/ext/readme.md and core/Page/ext/Inbox/readme.md have
 *    the rest; see it run at /framework/core/Page/ext/.
 *
 * Docs: doc/inbox.md · Servex/doc/inbox.md (part 1). */

// A page's folder path: the url without its query or hash, ending in "/".
export const folder = page => String(page ?? location.pathname).split(/[?#]/)[0].replace(/\/?$/, "/");

// The page's inbox, {open, coordinator}: its open notes, newest first, and who coordinates
// its module (or null). Empty when Servex is not running.
export async function notes(page){
	try {
		const r = await servex_fetch(`${servex_base()}/api/inbox?path=${encodeURIComponent(folder(page))}`);
		const j = r.ok ? await r.json() : {};
		return { open: j.open ?? [], coordinator: j.coordinator ?? null };
	} catch { return { open: [], coordinator: null }; }
}

// How many are open — the count on the AI tab's label.
export const count = page => notes(page).then(n => n.open.length);

// "3m", "2h", "4d": how long ago a note was left.
export function age(at){
	const s = Math.max(0, (Date.now() - Date.parse(at)) / 1000);
	return s < 60 ? "now" : s < 3600 ? `${Math.floor(s / 60)}m` : s < 86400 ? `${Math.floor(s / 3600)}h` : `${Math.floor(s / 86400)}d`;
}

export class DrawerInbox {
	constructor(...args){ this.assign({ page: location.pathname, open: [], coordinator: null, said: null }, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// ════ THE EXTENSION — {"ext": "Inbox"} or Page.use(DrawerInbox) ═════════════
	// `page.inbox` collects every `{"inbox": {…}}` line the page's own log has
	// (or ever gets): a real line, read the same way a `place` or `tab` line is —
	// nothing to do with the Servex-backed notes above.
	// ⚠ `page.jsonl_lines` (Log.js) is the catch-up: `ext(name)`'s dynamic import
	//   never beats the synchronous replay of an already-fetched page.jsonl, so
	//   without it the very lines this exists to collect would be missed every
	//   time. `page.on("line", …)` (also Log.js) covers anything after that.
	static setup(page){
		page.inbox = [];

		const collect = line => {
			if (!line?.inbox) return;
			const { type = "message", text, at } = line.inbox;
			const author = line.inbox.author ?? line.inbox.from;   // an older line said `from`
			page.inbox.push({ type, author, text, at });
		};

		(page.jsonl_lines ?? []).forEach(collect);
		page.on("line", collect);
	}

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

	load(){ return notes(this.page).then(n => { this.assign(n); this.changed(); }); }

	// One line under the button after a drop or a failed clear: where it went, or why not.
	answer(r, done){
		this.said = r?.ok === false ? `Not saved: ${r.why ?? "Servex said no"}` : done?.(r) ?? null;
		return this.load();
	}
	drop(text){
		return this.post("drop", { text })
			.then(r => this.answer(r, r => r.routed_to ? `Sent to ${r.routed_to}, who coordinates this module.` : null))
			.catch(e => this.answer({ ok: false, why: e.message }));
	}
	clear(id){ return this.post("clear", { id }).then(r => this.answer(r)).catch(e => this.answer({ ok: false, why: e.message })); }

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
			if (this.coordinator) small.c("drawer-inbox-coordinator muted", `Coordinated by ${this.coordinator.agent}: a note goes to it`)
				.attr("title", `${this.coordinator.agent} holds the claim on ${this.coordinator.topic}`);
			if (this.said) small.c("drawer-inbox-said", this.said);
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
					// Its author, with its icon: the site's M logo (.logo, styles.css) for a mastermind.
					if (/mastermind/.test(n.from)) span.c("logo drawer-inbox-logo").attr("aria-hidden", "true");
					span.c("drawer-inbox-from", n.from === "owner" ? "you" : n.from);
					small.c("drawer-inbox-age muted", age(n.at)).attr("title", n.at);
					button.c("drawer-inbox-clear", "Clear").attr("type", "button").click(() => this.clear(n.id));
				});
				span.c("drawer-inbox-text", n.text);
			}));
		});
		$box.el.hidden = !this.writing && !this.open.length && !this.coordinator && !this.said;
	}
}

export { DrawerInbox as Inbox };
export default DrawerInbox;
