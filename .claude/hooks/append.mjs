// append.mjs — CLI over Server/LogLine.mjs (all the rules live there; doc: Server/doc/log-line.md).
// usage: node .claude/hooks/append.mjs <target.jsonl> <lines.json>   exit 2 usage, 3 refused, 1 bad line
import { readFileSync } from "node:fs";
import LogLine from "../../Server/LogLine.mjs";

const [target, source] = process.argv.slice(2);
if (!target || !source){ console.error("usage: node append.mjs <target.jsonl> <lines.json>"); process.exit(2); }
const items = JSON.parse(readFileSync(source, "utf8").replace(/^﻿/, ""));
let r;
try { r = LogLine.append(target, items, { source }); }
catch (e){ for (const n of e.notes ?? []) console.error(n); console.error(e.message); process.exit(e.code === 3 ? 3 : 1); }
for (const n of r.notes) console.error(n);
console.log(`${r.file}: appended ${r.appended} at ${r.at}; ${r.total} lines total, ${r.bad} bad`);
if (r.landing) console.log(LogLine.CHECKLIST);
process.exit(r.bad ? 1 : 0);
