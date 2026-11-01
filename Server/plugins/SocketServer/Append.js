import fs from "fs";
import path from "path";
import RecordWriter from "../../../public/framework/core/Item/RecordWriter.js";

// A dynamic import with a safe fallback, not a static one — a review (2026-10-02) pointed
// out that a static import ties the WHOLE dev server's boot to jsonl-schema.mjs loading
// cleanly. A static import fails loudly (the server won't start at all) rather than silently,
// so it is less dangerous than the same mistake in ledger.mjs, but matching ledger.mjs's own
// fallback here means a broken checker degrades this ONE plugin instead of the whole server.
let check = () => null;
try { ({ check } = await import("../../../.claude/hooks/jsonl-schema.mjs")); } catch {}

const PUBLIC = path.resolve("public");

// How many batches of one client the server remembers (the answer it gave), and how many clients. A batch is resent only until
// its ack arrives, so a client needs a window as long as its unacked queue; both numbers are generous.
const REMEMBER_BATCHES = 1000, REMEMBER_CLIENTS = 500;

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

	/* `client` -> (`n` -> the ack it got). SHARED by every socket, because a retry arrives on a NEW socket: a tab whose socket died
	   resends its unacked batches after it reconnects. Memory only: a server restart forgets it (core/Item/doc/transport.md). */
	static seen = new Map();

	constructor(socket){
		this.socket = socket;
		socket.on("rpc:append", (args = [], index) => this.append(args[0], args[1], index, args[2]));
		socket.on("rpc:ping", (args, index) => this.ping(args, index));
	}

	// The heartbeat: a tab with unacked batches asks "are you there?" (core/Item/Outbox.js) and a live server says so.
	ping(args, index){ this.socket.send({ index, response: "pong" }); }

	// The ack already given for this batch, or null.
	static recall(meta){ return Append.seen.get(meta.client)?.get(meta.n) ?? null; }

	static remember(meta, ack){
		let batches = Append.seen.get(meta.client);
		if (!batches){
			Append.seen.set(meta.client, batches = new Map());
			if (Append.seen.size > REMEMBER_CLIENTS) Append.seen.delete(Append.seen.keys().next().value);
		}
		batches.set(meta.n, ack);
		if (batches.size > REMEMBER_BATCHES) batches.delete(batches.keys().next().value);
	}

	/* ONE shape: an array of plain objects, each written as one JSON line (2026-10-02,
	   "ONE file API"). A string, a bare object, or an array holding anything else is
	   refused: the only browser caller is ext/filesystem/FsFile.js, which always sends
	   an array of objects. ⚠ `appendFileSync` opens with "a", so two writers interleave
	   BETWEEN lines and never inside one: a torn half-line is unparseable to every
	   reader of the file, not just to its writer.
	   VALIDATED FIRST (2026-10-02): every line is judged against the target's schema
	   (jsonl-schema.mjs's check(), the same rule append.mjs enforces) before anything is
	   written. One bad line refuses the WHOLE batch, nothing partial — the browser gets
	   the reason back instead of a half-written file. */
	append(file, lines, index, meta){
		const full = resolve(file);
		if (!full) return this.answer(index, "append refused");

		const plain = line => !!line && typeof line === "object" && !Array.isArray(line);
		if (!Array.isArray(lines) || !lines.every(plain))
			return this.answer(index, "append refused: lines must be an array of objects");
		if (!lines.length) return this.answer(index, "append empty");

		/* A NUMBERED BATCH, from the Item system (core/Item/Outbox.js): `meta` is {client, n}. Three differences from a plain append:
		   a batch already written is answered again and not written twice (the dedupe that makes every retry safe); the reply names
		   the batch and the file's new size. Numbering is NOT what skips the legacy per-file verb schema (it describes what agents
		   append by hand, `{"log":{…}}`, and FsFile.append callers write exactly that, numbered too). Only a batch that says
		   `item: true` skips it (Item.Store.deliver): an Item's deltas (`{"set":{…}}`, `{"tasks":{"add":…}}`) are not agent verbs.
		   A page.jsonl keeps its check either way. */
		const numbered = typeof meta?.client === "string" && Number.isInteger(meta.n);
		if (numbered){
			const before = Append.recall(meta);
			if (before) return this.answer(index, before.response, { ...before.extra, dup: true });
		}

		if (!(numbered && meta.item === true) || path.basename(full) === "page.jsonl") for (const obj of lines){
			// check() itself throwing (a bug in jsonl-schema.mjs, not in the line) must never stop
			// the write — the owner's rule that outranks this whole feature. Treat it exactly like
			// "nothing wrong found": a throw is a bug report, never a reason to lose the browser's line.
			let why = null;
			try { why = check(full, obj); } catch (e) { console.error("Append: check() threw, writing anyway:", e.message); }
			if (why) return this.settle(index, meta, numbered, `append refused: ${why}`);
		}

		// THE FALLBACK OF THE ONE WRITER (core/Item/RecordWriter.js): a tab sends a record's lines here only when the entry point did
		// not take them. A line whose `by` and `ts` are already in the file's tail was written by the entry point after all (it
		// answered late), so it is not written twice. A numbered batch has the better test above, and `by|ts` cannot tell two tabs
		// apart (two tabs, one millisecond: the second edit would be dropped), so it skips this one.
		const fresh = numbered ? lines : RecordWriter.fresh(RecordWriter.tail_sync(fs, full), lines);
		if (!fresh.length) return this.answer(index, "append successful");

		// JSON.stringify never emits a raw newline, so each object is exactly one line.
		const text = fresh.map(line => JSON.stringify(line) + "\n").join("");

		try {
			fs.mkdirSync(path.dirname(full), { recursive: true });
			fs.appendFileSync(full, text);
			this.settle(index, meta, numbered, "append successful", { offset: fs.statSync(full).size });
		} catch (e) {
			console.error("Append failed:", e.message);
			this.answer(index, "append failed");   // not remembered: the tab may send it again
		}
	}

	// Answer a numbered batch and remember the answer, so a resend gets the same one and no second write. A plain append just answers.
	// A refusal is remembered too: the batch counts as processed, and the tab stops sending it.
	settle(index, meta, numbered, response, extra = {}){
		if (numbered){ extra = { client: meta.client, n: meta.n, ...extra }; Append.remember(meta, { response, extra }); }
		this.answer(index, response, extra);
	}

	/* ⚠ No `live_reload.mute()`, unlike `Runtime.write()`. A `.jsonl` never reaches the
	   reload path at all — `LiveReload.changed()` hands it to `Tail` first — so the
	   writer gets its own line back as a STREAM frame, which is what it wants. */
	answer(index, response, extra = {}){ this.socket.send({ index, response, ...extra }); }
}
