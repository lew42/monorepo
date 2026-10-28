// append.mjs — CLI over Server/LogLine.mjs (all the rules live there; doc: Server/doc/log-line.md).
// usage: node .claude/hooks/append.mjs <target.jsonl> <lines.json>   exit 2 usage, 3 refused, 1 bad line
// A record file (task/session/page/improvements.jsonl) goes through the one writer (core/Item/RecordWriter.js): posted to the entry
// point, which applies each line to the file's live root and appends it; only when it is down is the file appended here, once.
import { readFileSync } from "node:fs";
import LogLine from "../../Server/LogLine.mjs";
import RecordWriter from "../../public/framework/core/Item/RecordWriter.js";

const [target, source] = process.argv.slice(2);
if (!target || !source){ console.error("usage: node append.mjs <target.jsonl> <lines.json>"); process.exit(2); }
const items = JSON.parse(readFileSync(source, "utf8").replace(/^﻿/, ""));
let r, refused = 0;
try {
	const p = LogLine.prepare(target, items, { source });
	if (RecordWriter.is_record(p.target)){
		const w = await RecordWriter.write(p.target, p.filled, { by: "append.mjs" });
		if (w.refused?.length) throw Object.assign(new Error(w.refused.map(x => `REFUSED: ${x.why}`).join("\n") + `\nNot written to ${p.target}.`), { code: 3, notes: p.notes });
	} else LogLine.write(p);
	r = LogLine.report(p);
}
catch (e){ for (const n of e.notes ?? []) console.error(n); console.error(e.message); process.exit(e.code === 3 ? 3 : 1); }
for (const n of r.notes) console.error(n);
console.log(`${r.file}: appended ${r.appended} at ${r.at}; ${r.total} lines total, ${r.bad} bad`);
if (r.landing) console.log(LogLine.CHECKLIST);
process.exit(r.bad ? 1 : refused ? 3 : 0);   // partly refused: the rest was written, and the exit still says a line was refused
