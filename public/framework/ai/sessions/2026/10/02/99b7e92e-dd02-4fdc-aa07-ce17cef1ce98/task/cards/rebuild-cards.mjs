// rebuild-cards.mjs — rebuild each October card page.jsonl deleted at 22:36 on 2026-10-01,
// from events.json (scan-events.mjs: every card tool call in the transcripts, plus page.jsonl
// snapshots a session Read). Shapes follow Servex/cards/Cards.js (create, append, ask) and
// Servex/agents/Assistant.js card_reply, Layers.js card_set / add_item.
//
// Rules: a path that exists now is NEVER written (flag "wx"); it is recorded kept-existing with
// the count of pre-cutoff lines it lacks. Index lines are only appended. Nothing is deleted.
// usage: node rebuild-cards.mjs [--dry]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const dry = process.argv.includes("--dry");
const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const REPO = path.resolve(here, "../../../../../..");
const AI = path.join(REPO, "public/framework/ai");
const CUTOFF = Date.parse("2026-10-01T22:36:00-05:00");
const CLASS = "/framework/ai2/card.js";
const { events, snapshots } = JSON.parse(fs.readFileSync(path.join(here, "events.json"), "utf8"));

// local ISO with offset, seconds precision — what Servex's stamp() writes
const pad = n => String(n).padStart(2, "0");
function stamp(ms){
	const d = new Date(ms), off = -d.getTimezoneOffset(), a = Math.abs(off);
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${off < 0 ? "-" : "+"}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}
const json = s => { try { return JSON.parse(s); } catch { return null; } };
const when = e => Date.parse(e.result_at ?? e.at);

// ---- 1. which events belong to which October card, and as which line
const cards = new Map();   // id -> { head, lines: [{ms, line, src}] }
const card = id => { if (!cards.has(id)) cards.set(id, { id, head: null, lines: [], sessions: new Set() }); return cards.get(id); };
for (const e of events){
	if (e.error) continue;
	const r = json(e.result ?? "") ?? {};
	if (r.ok === false || r.error) continue;
	const ms = when(e), i = e.input ?? {};
	let id = e.tool === "create_card" ? r.id : (r.id && String(r.id).startsWith("2026/") ? r.id : r.card ?? i.card);
	if (!id || !String(id).startsWith("2026/10/")) continue;
	const c = card(id); c.sessions.add(e.session.slice(0, 8));
	const push = line => c.lines.push({ ms, line, src: e.tool });
	switch (e.tool){
		case "create_card":
			if (!c.head) c.head = { ms, line: { class: CLASS, title: String(i.title).trim(), type: i.type ?? "card", id, created: stamp(ms), by: i.by ?? "agent", tags: [].concat(i.tags ?? []) } };
			break;
		case "card_reply":
			push({ message: { by: i.from || "agent", text: i.text, kind: "reply", ...(i.re ? { re: i.re } : {}), at: stamp(ms), id: "m-" + ms.toString(36) + "rc" } });
			break;
		case "card_set":
			for (const k of ["type", "title", "status", "tags"]) if (i[k] !== undefined) push({ [k]: i[k] });
			break;
		case "add_item":
			push({ item: { id: i.id, title: i.title, asked_at: i.asked_at ?? new Date(ms).toISOString(), done: !!i.done, ...(i.proof ? { proof: i.proof } : {}) } });
			break;
		case "card_ask": {
			const decision = Array.isArray(i.options) && i.options.length > 0;
			const place = decision
				? { module: "/framework/ux/Content/Decision/Decision.js", id: "d-" + ms.toString(36) + "rc", ask: i.question, options: i.options, at: stamp(ms) }
				: { module: "/framework/ux/Content/Question/Question.js", id: "q-" + ms.toString(36) + "rc", ask: i.question, at: stamp(ms) };
			if (i.title) place.title = i.title; if (i.from) place.from = i.from;
			push({ place });
			break;
		}
		case "attach_card": push({ attach: i.agent }); break;
	}
}

// ---- 2. snapshots (a Read of a card page.jsonl): exact lines up to that moment
for (const s of snapshots){
	if (s.tool !== "Read" || !s.result) continue;
	const m = (s.input.file_path ?? "").replace(/\\/g, "/").match(/ai\/(2026\/10\/.+)\/page\.jsonl$/);
	if (!m) continue;
	const lines = s.result.split("\n").map(l => l.replace(/^\s*\d+\t/, "")).filter(l => l.trim()).map(json);
	if (lines.some(l => !l)) continue;
	const c = card(m[1]), ms = when(s);
	if (!c.snapshot || c.snapshot.ms < ms) c.snapshot = { ms, lines, session: s.session.slice(0, 8) };
}

// ---- 3. fold: snapshot first, then every later event; only what happened before the cutoff
const key = l => JSON.stringify(l.message ? { m: l.message.text } : l.item ? { i: l.item.id, d: l.item.done } : l.place ? { p: l.place.ask } : l);
function fold(c){
	let out, from = 0, confidence;
	if (c.snapshot && c.snapshot.ms <= CUTOFF){ out = [...c.snapshot.lines]; from = c.snapshot.ms; confidence = "exact"; }
	else if (c.head && c.head.ms <= CUTOFF){ out = [c.head.line]; confidence = "partial"; }
	else return null;
	const seen = new Set(out.map(key));
	let added = 0;
	for (const x of c.lines.sort((a, b) => a.ms - b.ms)){
		if (x.ms <= from || x.ms > CUTOFF || seen.has(key(x.line))) continue;
		out.push(x.line); seen.add(key(x.line)); added++;
	}
	// replayed lines carry regenerated message ids and second-precision times: partial
	if (added) confidence = "partial";
	return { lines: out, confidence, added };
}

// ---- 4. write the missing ones; measure the existing ones
const records = [], index = new Map();   // day -> [slug]
for (const c of [...cards.values()].sort((a, b) => a.id.localeCompare(b.id))){
	const f = fold(c);
	const rel = `public/framework/ai/${c.id}/page.jsonl`, abs = path.join(REPO, rel);
	const source = `transcripts ${[...c.sessions].concat(c.snapshot ? [c.snapshot.session + " (Read snapshot)"] : []).join(", ")}`;
	if (!f && fs.existsSync(abs)) continue;   // made after the cutoff: never deleted, not ours
	if (!f){ records.push({ recover: { path: rel, source, confidence: "partial", bytes: 0, status: "no-source", note: "created after the cutoff, or no create event" } }); continue; }
	const text = f.lines.map(l => JSON.stringify(l)).join("\n") + "\n";
	if (fs.existsSync(abs)){
		const live = fs.readFileSync(abs, "utf8").split("\n").filter(Boolean).map(json).filter(Boolean);
		const have = new Set(live.map(key));
		const missing = f.lines.filter(l => !have.has(key(l))).length;
		records.push({ recover: { path: rel, source, confidence: f.confidence, bytes: Buffer.byteLength(text), status: "kept-existing", missing_lines: missing } });
		if (missing && !dry){ fs.mkdirSync(path.join(here, "rebuilt"), { recursive: true }); fs.writeFileSync(path.join(here, "rebuilt", c.id.replace(/\//g, "_") + ".jsonl"), text, { flag: "w" }); }
		continue;
	}
	if (!dry){
		fs.mkdirSync(path.dirname(abs), { recursive: true });
		try { fs.writeFileSync(abs, text, { flag: "wx" }); }
		catch (e){ if (e.code !== "EEXIST") throw e; records.push({ recover: { path: rel, source, confidence: f.confidence, bytes: 0, status: "kept-existing", note: "appeared during the run" } }); continue; }
	}
	records.push({ recover: { path: rel, source, confidence: f.confidence, bytes: Buffer.byteLength(text), status: "restored", lines: f.lines.length } });
	const [y, m, d, ...rest] = c.id.split("/");
	if (rest.length === 1){ const day = `${y}/${m}/${d}`; index.set(day, (index.get(day) ?? []).concat(rest[0])); }
	else index.set(c.id.split("/").slice(0, -1).join("/"), (index.get(c.id.split("/").slice(0, -1).join("/")) ?? []).concat(rest.at(-1)));
}

// ---- 5. index lines: append the missing listings to each parent page.jsonl (never rewrite it)
const appends = [];
for (const [parent, slugs] of index){
	const file = path.join(AI, parent, "page.jsonl");
	const have = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
	const lines = slugs.filter(s => !have.includes(`"${s}/page.jsonl"`)).map(s => ({ file: `${s}/page.jsonl` }));
	if (lines.length) appends.push({ file, lines });
}

console.log(JSON.stringify(records.map(r => r.recover), null, 1));
console.log("index appends:", appends.map(a => `${path.relative(REPO, a.file)} +${a.lines.length}`));
if (dry) process.exit(0);

const tmp = path.join(process.env.TEMP ?? here, "rebuild-cards-lines.json");
const append = (target, lines) => { fs.writeFileSync(tmp, JSON.stringify(lines)); execFileSync("node", [path.join(REPO, ".claude/hooks/append.mjs"), target, tmp], { stdio: "inherit", windowsHide: true }); };
for (const a of appends) append(a.file, a.lines);
append(path.join(here, "..", "recovered.jsonl"), records);
