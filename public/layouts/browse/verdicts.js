/* ── THE OWNER'S VERDICTS ──────────────────────────────────────────────────────
   One append-only file, `/layouts/verdicts.jsonl`, one line per press:

       {"verdict": {"at": "2026-09-17T17:20:11-05:00", "item": "shell-left",
                    "say": "approve", "note": ""}}

   READING is `ext/JSONL`'s `live()`: on the dev server the server pushes every
   appended line to every open window, so a verdict cast in one tab appears in the
   other with no reload. Off localhost there is no socket and `live()` IS `load()`
   — a plain fetch of the same file — so the marks still render on the static site.
   That is the whole reason to stand on ext/JSONL instead of hand-rolling this.

   WRITING is one line up the same socket (`rpc:append`, Server/plugins/SocketServer/
   Append.js). It opens the file with "a", so the write is the size of the LINE and
   two windows pressing at once interleave between lines, never inside one.

   ⚠ THE WRITER DOES NOT APPLY ITS OWN LINE. It arrives back off the wire like
     everybody else's, so there is one code path and the server is the only orderer.
     `expect()` is the safety net: if no frame carrying the line has arrived in two
     seconds the writer applies it locally and says so in the console, because a
     press that visibly did nothing is the worst failure a page like this has.

   ⚠ APPEND-ONLY, on purpose. There is no edit and no delete. A verdict you want to
     change is answered by a LATER verdict on the same item — the newest line wins,
     and the whole history is one click down on the item's page. That is the same
     rule `/imagine/importance/` follows, for the same reason: the log is the record
     of what the owner thought over time, not just of what they think now.

   THE OWNER IS THE ONLY WRITER. No agent writes a verdict; the file starts absent
   and a missing file is not an error — it simply means nothing has been judged yet. */

import Socket from "/framework/dev/Socket/Socket.js";
import { edit } from "/framework/ext/Ask/edit.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";

// ⚠ Against `import.meta`, never the document — the SPA fallback makes the document
//   url the current route, so "../verdicts.jsonl" read off the page would follow the
//   reader around the site.
const FILE = new URL("../verdicts.jsonl", import.meta.url).pathname;

// How long the wire gets to hand the writer its own line back. /imagine/stream/
// measures the real round trip at 9 ms.
const WIRE = 2000;

/* ext/JSONL is built for VERB lines replayed onto one object, and these are flat
   records, so `verdict()` is the entire translation: one line in, one row appended. */
class Rows extends JSONL {
	static verbs = ["verdict"];
	rows = [];
	verdict(row){ this.rows.push(row); }
	reset(){ this.rows = []; return super.reset(); }
}

export class Verdicts {

	constructor(...args){ this.assign(...args); }
	assign(...args){ return Object.assign(this, ...args); }

	file(){ return this.jsonl ??= new Rows({ url: FILE }); }

	// Memoised: every card asks, and only the first one pays.
	load(){ return this.loading ??= this.file().live(() => this.arrived()); }

	// A page says `verdicts.watch(fn)` once; `fn` runs after every batch off the wire.
	watch(fn){ (this.watchers ??= []).push(fn); return this; }

	arrived(){ (this.watchers ?? []).forEach(fn => fn(this)); }

	rows(){ return this.file().rows; }

	// Every verdict on one item, oldest first — the history, one click down.
	all(item){ return this.rows().filter(row => row.item === item); }

	// The newest verdict on one item, which is the one the mark shows.
	latest(item){ return this.all(item).at(-1); }

	// How many items in a list have been approved most recently — the tier strip's count.
	approved(ids){ return ids.filter(id => this.latest(id)?.say === "approve").length; }

	judged(ids){ return ids.filter(id => this.latest(id)).length; }

	/* The one switch every editor control reads (ext/Ask/edit.js) — true on the dev
	   socket with the rail's Edit toggle on, false off localhost or with the toggle
	   off, and either way the buttons just don't draw. The rule ext/Saver, the CMS
	   editor and the importance graph already follow. */
	writable(){ return edit(); }

	async say(item, verdict, note = ""){
		if (!this.writable()) throw new Error("read-only — there is no dev socket here");

		const row = { at: stamp(), item, say: verdict, note };

		const reply = await Promise.race([
			Socket.singleton().async_rpc("append", FILE, JSON.stringify({ verdict: row })),
			new Promise(done => setTimeout(done, WIRE, null)),
		]);

		if (reply?.response !== "append successful")
			throw new Error("the dev server refused the append — restart it (rpc:append landed 2026-08-31)");

		return this.expect(row);
	}

	/* The row is coming back off the wire and that is the only path that should apply
	   it — but if no frame carrying it has arrived in two seconds, apply it here after
	   all and say so out loud. On a working dev server this never fires. */
	expect(row){
		setTimeout(() => {
			if (this.rows().some(r => r.at === row.at && r.item === row.item)) return;
			console.warn("verdicts: the appended line never came back off the wire — applying it locally.", row);
			this.file().rows.push(row);
			this.arrived();
		}, WIRE);

		return row;
	}
}

// An ISO timestamp carrying the reader's own offset, so a verdict says when it was
// cast where it was cast — `toISOString()` would silently move it to UTC.
function stamp(){
	const now = new Date();
	const off = -now.getTimezoneOffset();
	const pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate())
		+ "T" + pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds())
		+ (off < 0 ? "-" : "+") + pad(off / 60) + ":" + pad(off % 60);
}

// One store per document — every card on the wall reads the same file.
export const verdicts = new Verdicts();

export default verdicts;
