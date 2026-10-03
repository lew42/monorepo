import { div, span, button, input, small } from "/framework/core/View/View.js";
import { servex_base, servex_fetch } from "./servex.js";
import Rail from "./Rail.js";

/* THE PAGE'S INBOX — ONE CLASS, TWO VIEWS (restructured 2026-10-02, the owner's own ask —
 * see public/framework/ai/2026-10-02/panel2-sessions/part1b-inbox-restructure/requirements.md
 * for the exact wording). Before this change, two unrelated classes lived in this folder
 * with no connection to each other, even though they're both "a message, on a page," just
 * read from two different places: `InboxRail` (`Rail.js`, a page's persistent navigation
 * rail) and `DrawerInbox` (this file, the drawer's small "Leave a note" box). Now they are
 * the two VIEWS of one thing, `class Inbox` below:
 *
 *   const inbox = new Inbox({ page: this });
 *   inbox.rail.mount();     // the rail — was `new InboxRail({ page: this }).mount()`
 *   inbox.compact.view();   // the small box — was `new DrawerInbox({ page: this }).view()`
 *
 * `inbox.rail` and `inbox.compact` are getters: the first time either is READ, that one
 * view is built and cached — never both, so a page that only ever touches `.rail` never
 * pays to build `.compact`, and the other way round.
 *
 * `Inbox.Rail` is `Rail.js`'s class, imported above and assigned below (`Inbox.Rail =
 * Rail`) — moved in as a static rather than having its body copied into this file, so
 * `Rail.js` never has to import `Inbox.js` back (an import cycle: "a parent↔child import
 * cycle breaks only on deep reload," `code` skill). `Inbox.Compact` is new: today's
 * `DrawerInbox` class, renamed and kept right here (small enough that a second file for it
 * would be more ceremony than help) — see its own comment, below, for both of its jobs.
 *
 * `InboxRail` and `DrawerInbox`, as names, still work for one release: they are re-exported
 * at the bottom of this file, unedited, so nothing that already imports them breaks today.
 * New code should write `Inbox.Rail` / `Inbox.Compact` instead.
 *
 * Docs: ext/drawer/doc/inbox.md (the drawer half) · Servex/doc/inbox.md (the coordination
 * half) · this folder's own readme.md, "Architecture", has the fuller before/after. */

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

/** THE DATA — one inbox, for one page. Everything either view needs to exist (just
 *  `{ page }`, today) lives here; a view reads it back through `this.page`. `inbox.rail`
 *  and `inbox.compact` are the two ways to SHOW it, below — lazy, so building one never
 *  builds the other, and each is built only once (a getter that constructs-and-caches,
 *  not something built eagerly in the constructor). */
export class Inbox {
	constructor(...args){ this.assign({ page: location.pathname }, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	get rail(){ return this._rail ??= new this.constructor.Rail({ page: this.page }); }
	get compact(){ return this._compact ??= new this.constructor.Compact({ page: this.page }); }

	// `{"ext": "Inbox"}` and `Page.use(Inbox)` (core/Page/ext/readme.md) both end up
	// calling this — it forwards to Compact's own hook (today's `DrawerInbox.setup`,
	// unchanged below): collecting a page's `{"inbox": {…}}` jsonl lines into
	// `page.inbox` is Compact's job, not the rail's, so only Compact needs to answer it.
	static setup(page){ return Inbox.Compact.setup(page); }
}

/** INBOX.COMPACT — the small, dense view. Merges what used to be `DrawerInbox`'s two jobs,
 *  both still true, unchanged:
 *
 *  1. THE DRAWER'S "LEAVE A NOTE" BOX (`view()`/`draw()`, below) — read and written
 *     through Servex's `/api/inbox`; off the dev machine the inbox simply isn't drawn.
 *     `ext/drawer/rail.js` and `ext/drawer/tabs/ai.js` build one:
 *     `new Inbox.Compact({ page }).view()`.
 *  2. THE EXTENSION (`static setup`, called by `Inbox.setup` above) — turned on by a
 *     `{"ext": "Inbox"}` page.jsonl line, or `Page.use(Inbox)` for every page. See
 *     core/Page/ext/readme.md and core/Page/ext/Inbox/readme.md for the rest.
 *
 *  Takes `{ page }`, same as `Inbox.Rail` (deliverable 3, the restructure's own brief) — a
 *  LATER task builds the actual Overview-dashboard tile on top of this class (a denser
 *  render, not a different one); this class's own job is just being correct and reusable,
 *  which is why `view()` stays the same plain, working box rather than something tied to
 *  the drawer's own width. */
Inbox.Compact = class Compact {
	constructor(...args){ this.assign({ page: location.pathname, open: [], coordinator: null, said: null }, ...args); }
	assign(...args){ return Object.assign(this, ...args); }

	// ════ THE EXTENSION — {"ext": "Inbox"} or Page.use(Inbox) ═════════════
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
};

Inbox.Rail = Rail;

// One release of back-compat: every existing import of the old names keeps working
// unedited. New code reaches for `Inbox.Rail` / `Inbox.Compact` directly instead.
export const InboxRail = Inbox.Rail;
export const DrawerInbox = Inbox.Compact;

export default Inbox;
