import fs from "fs";
import path from "path";

// A dynamic import with a safe fallback, not a static one — a review (2026-10-02) pointed
// out that a static import ties the WHOLE dev server's boot to jsonl-schema.mjs loading
// cleanly. A static import fails loudly (the server won't start at all) rather than silently,
// so it is less dangerous than the same mistake in ledger.mjs, but matching ledger.mjs's own
// fallback here means a broken checker degrades this ONE plugin instead of the whole server.
let check = () => null;
try { ({ check } = await import("../../../.claude/hooks/jsonl-schema.mjs")); } catch {}

const PUBLIC = path.resolve("public");

/* ⚠ Browser input reaches fs.appendFile here — the same gate `Tail.resolve()` uses, and
 * for the same reason: a subscribed path must resolve under public/ and name a .jsonl. */
function resolve(url){
	const file = path.resolve(PUBLIC, String(url ?? "").replace(/^[\\/]+/, ""));
	return file.startsWith(PUBLIC + path.sep) && file.endsWith(".jsonl") ? file : null;
}

/**
 * WIRED in `server.js` (2026-08-31) beside its neighbours:
 *
 *     import Append from "./Server/plugins/SocketServer/Append.js";
 *     DevSocket.Socket.use(Append);      // next to DevSocket.Socket.use(Tail)
 *
 * A server started before that date is still running the pre-Append code — restart to get it.
 *
 * WHY IT SHOULD LAND. `rpc:write` is the only writer the dev server has, so a browser
 * that wants to append a line has to send the WHOLE FILE back. Three things follow, all
 * measured on /imagine/stream/ (2026-08-30):
 *
 *   1. The writer is also a subscriber, so its own lines come back — and a client that
 *      adds them to its copy again writes them twice. The log doubled on every edit;
 *      three edits made seven blocks. `Stream` now carries a `confirmed`/`pending` split
 *      to survive it, and that whole mechanism exists only because of this.
 *   2. Two windows editing at once lose each other. The second write is the first
 *      window's copy of the file, and the first window's copy is missing the other's line.
 *   3. It is O(file) per keystroke. Fine at 10 KB, wrong for a document.
 *
 * With this, `Stream.push()` sends one line, `confirmed`/`pending` disappear, and
 * concurrent writers interleave safely — which is also exactly what a Durable Object
 * does in production (public/imagine/stream/doc/durable-objects.md).
 */
export default class Append {

	static setup(socket){ new Append(socket); }

	constructor(socket){
		this.socket = socket;
		socket.on("rpc:append", (args = [], index) => this.append(...args, index));
	}

	/* One or many lines, always whole. ⚠ `appendFileSync` opens with "a", so two writers
	   interleave BETWEEN lines and never inside one — which is the whole point: a torn
	   half-line is unparseable to every reader of the file, not just to its writer.
	   VALIDATED FIRST (2026-10-02): every line is judged against the target's schema
	   (jsonl-schema.mjs's check(), the same rule append.mjs enforces) before anything is
	   written. One bad line refuses the WHOLE batch, nothing partial — the browser gets
	   the reason back instead of a half-written file. A file with no schema only has to
	   be a plain JSON object, which check() already guarantees. */
	append(file, lines, index){
		const full = resolve(file);
		if (!full) return this.answer(index, "append refused");

		const list = [lines].flat().filter(Boolean);
		if (!list.length) return this.answer(index, "append empty");

		for (const raw of list){
			let obj = raw;
			if (typeof raw === "string") {
				try { obj = JSON.parse(raw); } catch { return this.answer(index, "append refused: a line must be valid JSON"); }
			}
			// check() itself throwing (a bug in jsonl-schema.mjs, not in the line) must never stop
			// the write — the owner's rule that outranks this whole feature. Treat it exactly like
			// "nothing wrong found": a throw is a bug report, never a reason to lose the browser's line.
			let why = null;
			try { why = check(full, obj); } catch (e) { console.error("Append: check() threw, writing anyway:", e.message); }
			if (why) return this.answer(index, `append refused: ${why}`);
		}

		const text = list
			.map(line => (typeof line === "string" ? line : JSON.stringify(line)).replace(/[\r\n]+/g, " "))
			.filter(Boolean)
			.map(line => line + "\n")
			.join("");

		if (!text) return this.answer(index, "append empty");

		try {
			fs.mkdirSync(path.dirname(full), { recursive: true });
			fs.appendFileSync(full, text);
			this.answer(index, "append successful");
		} catch (e) {
			console.error("Append failed:", e.message);
			this.answer(index, "append failed");
		}
	}

	/* ⚠ No `live_reload.mute()`, unlike `Runtime.write()`. A `.jsonl` never reaches the
	   reload path at all — `LiveReload.changed()` hands it to `Tail` first — so the
	   writer gets its own line back as a STREAM frame, which is what it wants. */
	answer(index, response){ this.socket.send({ index, response }); }
}
