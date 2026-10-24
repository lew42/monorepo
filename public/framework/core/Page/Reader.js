import Item from "../Item/Item.js";

// `Item.Store` for a page.jsonl file, one per URL (`Reader.for`); `page.store` IS this once a jsonl page loaded. (doc/method/prefs.md)
export default class PageLogReader extends Item.Store {

	get page(){ return this.host; }
	set page(host){ this.host = host; }

	// ⚠ core never statically imports ext; live.js is imported only on localhost.
	// `this.live` (kept, not on the base Store) is what `close()` needs to drop the
	// subscription — Item.Store itself never tails more than once and never closes.
	open(){
		if (!this.constructor.dev) return this.load();
		return import("../../ext/JSONL/live.js")
			.then(live => (this.live = live).stream(this, () => this.changed()));
	}

	close(){ this.live?.drop(this); }

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
		host.on("delta", (line, origin) => {
			if (this.replaying) return;
			this.append(this.line_for(line, origin, host));
		});

		const held = this.entries.splice(0).slice(1);
		this.read(held);
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
// ⚠ Localhost only, the gate dev/Socket keeps. (doc/watch-out.md)
PageLogReader.dev = typeof location !== "undefined" && (["localhost", "127.0.0.1"].includes(location.hostname) || location.hostname.endsWith(".localhost"));   // node has no location
