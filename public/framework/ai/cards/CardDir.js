/* CardDir — where an Inbox card's FOLDER lives. One tree under framework/ai (ai/doc/task-folders.md, 2026-10-13):
   a card's id and its page stay `2026/10/13/<slug>` and `/framework/ai/2026/10/13/<slug>/` (the Inbox route), but its
   folder is `ai/sessions/2026/10/13/cards/<slug>/`: "cards" goes in right after the date. The year, month and day index
   pages follow the same rule (`2026` → `sessions/2026/cards/`). Plain string math, so Servex (Cards.dir), the dev
   server (old file urls) and the browser (the card page, the Inbox scans) all share this one rule. */
export default class CardDir {

	static AI = "/framework/ai/";

	/** True for a dated id or path: `2026`, `2026/10/13/x`, `2026/10/13/x/report.md`. Never a `2026-10-13` task day. */
	static dated(id){ return /^\d{4}(\/|$)/.test(this.clean(id)); }

	static clean(id){ return String(id ?? "").split("/").filter(Boolean).join("/"); }

	/** The path under framework/ai/ where it lives now: `2026/10/13/x/a.md` → `sessions/2026/10/13/cards/x/a.md`.
	    Anything undated comes back unchanged. */
	static rel(id){
		const segs = this.clean(id).split("/");
		if (!/^\d{4}$/.test(segs[0])) return segs.join("/");
		let k = 1;
		while (k < 3 && /^\d{2}$/.test(segs[k] ?? "")) k++;
		return ["sessions", ...segs.slice(0, k), "cards", ...segs.slice(k)].join("/");
	}

	/** Where it lived before 2026-10-13: `2026/10/13/x`. A reader with a disk falls back to it (`pick`). */
	static old(id){ return this.clean(id); }

	/** The folder's site url, for its static files: `/framework/ai/sessions/2026/10/13/cards/x/`. */
	static url(id){ return this.AI + this.rel(id) + "/"; }

	/** The card's page: the Inbox route, unchanged by the move: `/framework/ai/2026/10/13/x/`. */
	static page(id){ return this.AI + this.old(id) + "/"; }

	/** A site path → where its file really is: an old card address `/framework/ai/2026/…` maps into the store; anything else
	    is returned as is. Keeps a trailing slash. */
	static site(p){
		const m = /^\/framework\/ai\/(\d{4}(?:\/.*)?)$/.exec(String(p));
		if (!m) return p;
		return this.AI + this.rel(m[1]) + (m[1].endsWith("/") ? "/" : "");
	}

	/** The inverse: a store folder (`/framework/ai/sessions/2026/10/13/cards/x/`, or the same without /framework/ai/) → its id
	    `2026/10/13/x`; null for anything else. */
	static id(p){
		const m = /(?:^|\/)sessions\/(\d{4}(?:\/\d{2}){0,2})\/cards(?:\/(.*?))?\/?$/.exec(String(p ?? ""));
		return m ? [m[1], m[2]].filter(Boolean).join("/") : null;
	}

	/** With a disk: the new place, unless only the old one exists (a card written by a Servex not yet restarted).
	    `has(rel)` answers whether framework/ai/<rel> exists. */
	static pick(id, has){
		const now = this.rel(id), was = this.old(id);
		return now === was || has(now) || !has(was) ? now : was;
	}
}
