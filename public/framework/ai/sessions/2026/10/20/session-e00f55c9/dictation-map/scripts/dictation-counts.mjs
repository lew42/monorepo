// Counts what each writer put into real voice sessions' session.jsonl files.
// node dictation-counts.mjs <repo> [since YYYY-MM-DD]
import fs from "node:fs";
import path from "node:path";

const repo = process.argv[2] ?? "C:/Code/lew42/monorepo";
const since = process.argv[3] ?? "2026-10-17";
const root = path.join(repo, "public/framework/ai/sessions/2026");
const files = [];
for (const m of fs.readdirSync(root).filter(x => /^\d\d$/.test(x))) for (const d of fs.readdirSync(path.join(root, m)).filter(x => /^\d\d$/.test(x))){
	const day = `2026-${m}-${d}`;
	if (day < since) continue;
	for (const id of fs.readdirSync(path.join(root, m, d))){
		if (!id.startsWith("v-")) continue;
		const f = path.join(root, m, d, id, "session.jsonl");
		if (fs.existsSync(f)) files.push({ day, id, f });
	}
}

const total = {};
const add = (o, k, n = 1) => { o[k] = (o[k] ?? 0) + n; };
const rows = [];
for (const { day, id, f } of files){
	const c = { id, day, lines: 0 };
	let first = null, last = null;
	const keys = {};
	for (const raw of fs.readFileSync(f, "utf8").split("\n")){
		if (!raw.trim()) continue;
		let j; try { j = JSON.parse(raw); } catch { add(c, "bad"); continue; }
		c.lines++;
		const k = Object.keys(j).filter(x => !["ts", "by"].includes(x))[0] ?? "?";
		const kind = /^(p|q|r|t)-\d+$/.test(k) || /^[0-9a-f-]{36}$/.test(k) ? "<id edit>" : k;
		add(keys, kind);
		const at = j.chat?.at ?? j.place?.ts ?? j.ts ?? j.sent?.at ?? null;
		if (at){ first ??= at; last = at; }
		if (j.chat){
			const from = j.chat.from?.kind === "owner" ? `owner:${j.chat.via}` : `${j.chat.from?.kind}:${j.chat.from?.id}`;
			add(c, "chat " + from);
			if (j.chat.from?.kind === "owner"){
				if (j.chat.raw && j.chat.raw !== j.chat.text) add(c, "owner raw≠text");
				if (/^[a-z]/.test(j.chat.text)) add(c, "owner text starts lowercase");
			}
		}
		if (j.place){ add(c, "place by " + String(j.by ?? "?").replace(/-v-.*/, "")); add(c, "place edit=" + (j.place.edit ?? "none")); add(c, "place to=" + j.place.to); }
		if (j.sent) add(c, "sent to " + j.sent.to);
		if (j.refined) add(c, "refined (code refine())");
		if (j.tasks?.add) add(c, `tasks.add ${j.tasks.add.type ?? "Task"} by ${j.by ?? "?"}`);
		if (kind === "<id edit>"){
			const v = j[k];
			const fields = Object.keys(v).join(",");
			add(c, `edit [${fields}] by ${String(j.by ?? "?").replace(/-v-.*/, "")}`);
		}
	}
	c.keys = keys; c.first = first; c.last = last;
	rows.push(c);
	for (const [k, v] of Object.entries(c)) if (typeof v === "number") add(total, k, v);
	for (const [k, v] of Object.entries(keys)) add(total, "key " + k, v);
}
console.log(JSON.stringify({ since, sessions: rows.length, total, rows }, null, 1));
