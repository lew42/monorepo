import Item from "../Item/Item.js";

// `Item.Store` for a page.jsonl file, one per URL (`Reader.for`); `page.store` IS this once a jsonl page loaded. (doc/method/prefs.md)
export default class PageLogReader extends Item.Store {

	get page(){ return this.host; }
	set page(host){ this.host = host; }

	// ⚠ core never statically imports ext; live.js is imported only on localhost.
	// `this.tailer` (the live.js module, kept) is what `close()` needs to drop the subscription;
	// Item.Store itself never tails more than once and never closes. Not `this.live`: that is the
	// base Store's "first load done" flag, and a module there made Item.source say "remote" for
	// every line of the first load (2026-11-06).
	open(){
		if (!this.constructor.streams) return this.load();
		return import("../../ext/JSONL/live.js")
			.then(live => (this.tailer = live).stream(this, () => this.changed(), { owner: null }));   // the page owns it once built: attach()
	}

	close(){ this.tailer?.drop(this); }

	// Tracks which KEYS arrived in this batch — `changed()` below reads it to decide
	// whether a live line is worth a nav redraw, same as before the fold-in.
	read(entries){
		for (const entry of entries) for (const key of Object.keys(entry)) (this._seen ??= new Set()).add(key);
		return super.read(entries);
	}

	// Line 1 already built the page (`Page.jsonl()` above) — HOLD UNTIL LINE 1,
	// never replay it a second time. Everything else is Item.Store's own `attach()`
	// (the "delta" listener, the echo skip, the replaying flag).
	attach(host){
		this.host = host;
		host.store = this;
		this.tailer?.adopt?.(this, host);   // MY page's leaving pauses my stream, never the page that was active while I loaded (live.js adopt)
		host.on("delta", (line, origin) => {
			if (this.replaying || Item.Store.replay_depth > 0 || Item.Store.muted_at(origin)) return;   // muted: a button's act() records its verb once, not the set lines it made (seat g, B9)
			this.append(this.line_for(line, origin, host));
		});

		const held = this.entries.splice(0).slice(1);
		this.read(held);
		this.live = true;   // from here on a line read is another writer's (Item.source "remote"), as Item.Store.attach
		this._seen = null;   // the load's keys are not news; changed() redraws for live lines only

		host.report_unknown();
		return this;
	}

	// A `tab`/`file` line redraws MY tab strip; a `settings` line redraws my PARENT's. No reload. (doc/decisions.md)
	changed(){
		this.host?.report_unknown();
		this.host?.log_redraw();

		const seen = this._seen; this._seen = null;
		if (seen?.has("tab") || seen?.has("file")) this.host?.nav_redraw?.();
		if (seen?.has("settings")) this.host?.parent?.nav_redraw?.();
	}

	// A REWRITTEN (not appended) file replays from line 1 onto a clean slate.
	reset(){
		this.count = 0;
		this.host?.log_forget();
		delete this.loaded;
		return this;
	}
}
// ⚠ `dev`: this PC only, the gate for the file tools (rename, move, set aside), which the socket refuses anywhere else. (doc/watch-out.md)
PageLogReader.dev = typeof location !== "undefined" && (["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost"));   // node has no location
// `streams`: where a page.jsonl is tailed over the dev socket, which reads anywhere the socket opens: this PC, its LAN, and the owner's
// tunnel (monorepo.lew42.com, Server/SiteGateway.mjs, the key-gated site tier). The same list as dev/servex_url.js DEV_SITE (core cannot
// import dev/; keep the two equal). It was `dev` until 2026-11-06, so the phone on the tunnel loaded a page once and never saw another line.
PageLogReader.streams = typeof location !== "undefined" && /^(localhost|127\.\S*|192\.168\.\S*|10\.\S*|.*\.localhost|monorepo\.lew42\.com)$/.test(location.hostname);
