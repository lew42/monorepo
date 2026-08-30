import fs from "fs";
import path from "path";

const PUBLIC = path.resolve("public");

/* ⚠ Browser input reaches fs.appendFile here — the same gate `Tail.resolve()` uses, and
 * for the same reason: a subscribed path must resolve under public/ and name a .jsonl. */
function resolve(url){
	const file = path.resolve(PUBLIC, String(url ?? "").replace(/^[\\/]+/, ""));
	return file.startsWith(PUBLIC + path.sep) && file.endsWith(".jsonl") ? file : null;
}

/**
 * ⚠ NOT WIRED. One line lands it, in `server.js` beside its neighbours:
 *
 *     import Append from "./Server/plugins/SocketServer/Append.js";
 *     DevSocket.Socket.use(Append);      // next to DevSocket.Socket.use(Tail)
 *
 * and a dev-server restart. Proposed, not applied — `Server/` is the owner's.
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
	   half-line is unparseable to every reader of the file, not just to its writer. */
	append(file, lines, index){
		const full = resolve(file);
		if (!full) return this.answer(index, "append refused");

		const text = [lines].flat()
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
