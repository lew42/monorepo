/* keepLive(planned, fresh) — what merge.mjs writes for an append-only *.jsonl.
 *
 * merge.mjs plans every file first and writes it later. A live log (a task.jsonl,
 * a cards.jsonl) can be appended to in between — by the agent landing that very
 * task, by clarity.mjs, by Servex. Writing the planned bytes then erases those
 * lines: readme-chain lost its landing line and day-close log that way on
 * 2026-09-29 (re-appended in 0a79e7d2), the third lost log that week.
 *
 * The rule: a line that is in the working file right now is never dropped. Every
 * line of `fresh` (the file as it is at write time) that the planned result does
 * not already hold is appended to it, in its own order. Buffers in, a Buffer out;
 * CRLF is kept when the planned data uses it. */
export function keepLive(planned, fresh){
	if (!fresh || !fresh.length) return { data: planned, kept: 0 };
	const crlf = planned.includes("\r\n");
	// latin1 maps every byte to one char and back, so no byte changes (as in the rest of merge.mjs)
	const split = b => b.toString("latin1").split(/\r?\n/).filter(l => l.length);
	const have = new Map();
	for (const l of split(planned)) have.set(l, (have.get(l) ?? 0) + 1);
	const missing = [];
	for (const l of split(fresh)){
		const n = have.get(l) ?? 0;
		if (n > 0) have.set(l, n - 1); else missing.push(l);
	}
	if (!missing.length) return { data: planned, kept: 0 };
	const nl = crlf ? "\r\n" : "\n";
	let text = planned.toString("latin1");
	if (text.length && !text.endsWith("\n")) text += nl;
	return { data: Buffer.from(text + missing.join(nl) + nl, "latin1"), kept: missing.length };
}

/* `node Server/jsonl-keep.mjs --proof` — the rule, on the 09-29 shape. */
if (process.argv[1]?.endsWith("jsonl-keep.mjs") && process.argv.includes("--proof")){
	const B = s => Buffer.from(s, "utf8");
	const cases = [
		["a landing line appended after planning survives",
			keepLive(B('{"a":1}\n{"b":2}\n'), B('{"a":1}\n{"landed_at":"20:00"}\n')), '{"a":1}\n{"b":2}\n{"landed_at":"20:00"}\n'],
		["nothing new at write time: the planned bytes, untouched",
			keepLive(B('{"a":1}\n{"b":2}\n'), B('{"a":1}\n')), '{"a":1}\n{"b":2}\n'],
		["a line written twice is kept twice",
			keepLive(B('{"x":1}\n'), B('{"x":1}\n{"x":1}\n')), '{"x":1}\n{"x":1}\n'],
		["UTF-8 bytes pass through untouched",
			keepLive(B('{"t":"é—✓"}\n'), B('{"t":"é—✓"}\n{"u":"ü"}\n')), '{"t":"é—✓"}\n{"u":"ü"}\n'],
		["CRLF stays CRLF",
			keepLive(B('{"a":1}\r\n'), B('{"a":1}\r\n{"c":3}\r\n')), '{"a":1}\r\n{"c":3}\r\n']
	];
	let bad = 0;
	for (const [name, got, want] of cases){
		const ok = got.data.toString("utf8") === want;
		if (!ok) bad++;
		console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : " — got " + JSON.stringify(got.data.toString())}`);
	}
	console.log(`\n${cases.length - bad}/${cases.length} passed`);
	process.exit(bad ? 1 : 0);
}
