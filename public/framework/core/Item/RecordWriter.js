/* ONE WRITER for the record files (data-shapes plan step 1d; the owner, ask 41: "one data path, whether it's AI driven or UI
   driven… that needs to be our data backbone"). Every line bound for a `session.jsonl`, `task.jsonl`, `page.jsonl` or
   `improvements.jsonl` is posted to ONE entry point, `record_lines` behind `POST /api/item` (Servex/agents/page_tools.js), which
   applies it to the file's live root and then appends it. This class is the caller's side, the same for the browser
   (`Item.Store.flush`) and for node (the hooks, `append.mjs`):

     const { rest, ts } = await RecordWriter.post("/framework/x/page.jsonl", { lines: [{ title: "Hi" }], by: "owner" });
     // rest = the lines the entry point could not be asked (it is down, or refused where they came from): append those yourself
     await RecordWriter.write("C:/…/public/framework/x/task.jsonl", [{ log: { msg: "hi" } }], { by: "ledger" });   // node: post, else append once

   NO TWIN, EITHER ORDER. Each posted line carries its own `ts`, made here and unique per writer. The entry point skips a line
   whose `ts` and `by` are already in the file's tail, and so does the raw fallback (`fresh`, used by `append_once` here and by
   the dev server's `Append.js`). So a slow entry point that finally writes after the caller gave up, and a fallback that wrote
   first, still leave one line. Before 2026-10-28 the browser gave up after 5 s and appended blind: the twin lines.

   F1 (ask first): moving the entry point to each project's dev server is `entry()` below, one line; no caller changes. */
export class RecordWriter {

	static RECORD = /(^|\/)(task|session|page|improvements)\.jsonl$/;
	static TAIL = 64 * 1024;   // the bytes of a file's end a twin check reads: far more than one flush or one hook burst writes
	static SLOW = 15000;       // a busy entry point is waited on this long; then the fallback, which checks the tail first

	static is_record(path){ return this.RECORD.test(String(path ?? "").replace(/\\/g, "/")); }

	// Where the entry point answers. Browser: Servex via servex_url (the phone goes through its dev server's proxy). Node: Servex's
	// loopback port; RECORD_ENTRY points a test at its own server.
	static async entry(){
		if (globalThis.location) return (await import("../../dev/servex_url.js")).servex_url("/api/item");
		const env = globalThis.process?.env ?? {};
		return env.RECORD_ENTRY || `http://127.0.0.1:${env.SERVEX_PORT || 8090}/api/item`;
	}

	// A `ts` no other line from this writer has: an ISO time, bumped one millisecond past the last one given out.
	static stamp(){
		const t = Math.max(Date.now(), (this.last_ts ?? 0) + 1);
		this.last_ts = t;
		return new Date(t).toISOString();
	}

	/* Posts each line in order. `{lines}`: raw lines, written as given plus `by`/`ts` (hooks, LogLine, page files). `{deltas}`:
	   item-tool verbs (`{"start":{}}`), validated and stamped by the tool (the browser's task and session files).
	   Answers `{rest, ts, refused}`: `rest` are the lines (stamped) never taken, to append with `append_once`/`Append`. */
	static async post(path, { lines, deltas, by = "owner", root, timeout = this.SLOW } = {}){
		const raw = !!lines, list = (lines ?? deltas ?? []).map(l => ({ ...l, by: l.by ?? by, ts: l.ts ?? this.stamp() }));
		const url = await this.entry(), refused = [];
		// Raw lines go in one request (record_lines takes the batch and names each refusal by index); a verb goes one per request.
		const batches = raw ? (list.length ? [list.map((l, i) => i)] : []) : list.map((l, i) => [i]);
		for (const idx of batches){
			const { by: _by, ts, ...bare } = list[idx[0]];
			// A verb's `by` is not sent: the door stamps every verb "owner" (only a tab posts verbs); `by` here keys the caller's own twin check.
				const body = raw ? { path, lines: idx.map(i => list[i]), ...(root ? { root } : {}) } : { path, delta: bare, ts, ...(root ? { root } : {}) };
			let res, answer;
			try {
				res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeout) });
				answer = await res.json().catch(() => null);
			} catch { return { rest: list.slice(idx[0]), ts: list.map(l => l.ts), refused, down: true }; }   // down, or slower than `timeout`
			// Not refused for its content but for where it came from (a phone: 403; a worktree's page or another checkout: stubbed), or
			// an entry point that cannot take this shape (an older Servex answers raw lines with 400): the caller's own append, once.
			// A refusal of the line itself is a 200 with ok: false.
			if (!res.ok || answer?.stubbed || !answer) return { rest: list.slice(idx[0]), ts: list.map(l => l.ts), refused, down: !answer?.stubbed, stubbed: !!answer?.stubbed };
			if (raw) for (const r of answer.refused ?? []) refused.push({ line: list[idx[r.i]], why: r.why });
			else if (answer.ok === false) refused.push({ line: list[idx[0]], why: answer.why });
		}
		return { rest: [], ts: list.map(l => l.ts), refused };
	}

	/* The lines of `want` not already in `tail` (parsed lines of the file's end). A line is there when a tail line has its `by` and
	   its `ts`, a millisecond stamp (stamp() or the item tool's), so that pair names one post; `strict` (raw lines, written as given)
	   also needs the whole line to match. A line with no such `ts` (LogLine stamps a page line to the second) is always written. */
	static MS = /\.\d{3}Z$/;
	static fresh(tail, want, { strict = false } = {}){
		const key = l => strict ? JSON.stringify(l) : `${l.by}|${l.ts}`;
		const seen = new Set(tail.filter(l => this.MS.test(l?.ts ?? "")).map(key));
		return want.filter(l => !this.MS.test(l?.ts ?? "") || !seen.has(key(l)));
	}

	// The parsed lines in the last TAIL bytes of `file` (node). A torn first line is skipped. `tail_sync` takes node's fs.
	static async tail(file){ return this.tail_sync(await import("node:fs"), file); }
	static tail_sync(fs, file){
		let fd;
		try {
			const size = fs.statSync(file).size, len = Math.min(size, this.TAIL), buf = Buffer.alloc(len);
			fd = fs.openSync(file, "r"); fs.readSync(fd, buf, 0, len, size - len);
			return buf.toString("utf8").split("\n").flatMap(l => { try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; } });
		} catch { return []; }
		finally { if (fd !== undefined) fs.closeSync(fd); }
	}

	// The fallback, node only: append the lines the file does not already hold, newline-safe. Answers how many were written.
	static async append_once(file, lines){
		const fs = await import("node:fs"), path = await import("node:path");
		const out = this.fresh(await this.tail(file), lines, { strict: true });
		if (!out.length) return 0;
		fs.mkdirSync(path.dirname(file), { recursive: true });
		let lead = "";
		try { const size = fs.statSync(file).size; if (size){ const b = Buffer.alloc(1), fd = fs.openSync(file, "r"); fs.readSync(fd, b, 0, 1, size - 1); fs.closeSync(fd); if (b[0] !== 10) lead = "\n"; } } catch {}
		fs.appendFileSync(file, lead + out.map(l => JSON.stringify(l)).join("\n") + "\n");
		return out.length;
	}

	/* Node's one call (hooks, append.mjs): a record file's lines go to the entry point, raw; when it is down, `append_once`. A file
	   that is not a record, or not under a `public/` folder, is appended directly (nothing keeps a live root of it). Never throws. */
	static async write(file, lines, { by = "node", timeout = 3000 } = {}){
		const list = [lines].flat(), m = /^(.*?)[\\/]public[\\/](.+)$/.exec(String(file));
		if (!m || !this.is_record(file)) return { written: await this.append_once(file, list), via: "file" };
		const url = "/" + m[2].replace(/\\/g, "/");
		const { rest, refused } = await this.post(url, { lines: list, by, root: m[1], timeout });
		if (!rest.length) return { written: list.length - refused.length, via: "entry", refused };
		return { written: await this.append_once(file, rest), via: "fallback", refused };
	}
}

export default RecordWriter;
