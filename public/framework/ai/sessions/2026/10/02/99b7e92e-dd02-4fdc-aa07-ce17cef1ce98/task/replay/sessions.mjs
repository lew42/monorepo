// sessions.mjs — rebuild the voice-session files the 22:36 rm -rf removed (`<home>ai/v-*.jsonl` and
// `v-*.summary.json`) from what Servex still holds: sessions.json (each session's meta, title,
// summary) and the session agents' own logs (logs/agent-session-{fast,smart}-<id>.jsonl: the
// owner's words as agent_msg, each reply as result). Shapes follow Servex/agents/Sessions.js
// (create's {session}, say()'s owner {chat}, a reply's assistant {chat}, summarize()).
// Always `partial`: nav/quiet/para/react lines are not in those logs. Writes only missing
// paths (flag "wx"); records every one in ../recovered.jsonl. usage: node sessions.mjs [--dry]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const dry = process.argv.includes("--dry");
const here = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const TASK = path.resolve(here, ".."), REPO = path.resolve(TASK, "../../../../..");
const SX = path.join(process.env.LOCALAPPDATA, "lew42/servex");
const CUTOFF = Date.parse("2026-10-01T22:36:00-05:00");
const json = s => { try { return JSON.parse(s); } catch { return null; } };
const map = (j => j.map ?? j)(JSON.parse(fs.readFileSync(path.join(SX, "sessions.json"), "utf8")));

const recorded = fs.readFileSync(path.join(TASK, "recovered.jsonl"), "utf8").split("\n").map(l => json(l)?.recover).filter(Boolean);
const wanted = recorded.filter(r => r.status === "no-source" && /\/v-[a-z0-9]+\.(jsonl|summary\.json)$/.test(r.path)).map(r => r.path);
// also every session whose file sat under a deleted folder (no tool ever wrote it, so no other pass named it)
const entries = fs.readFileSync(path.join(TASK, "deleted-paths.txt"), "utf8").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
const isDeleted = r => entries.some(e => e.endsWith("/") ? r.startsWith(e) : r === e);
const seen = new Set(recorded.map(r => r.path)), guessed = new Set();   // guessed: may never have existed, so no-source is not recorded for them
for (const s of Object.values(map)){
	if (!s?.file) continue;
	for (const rel of [`public${s.file}`, `public${s.file.replace(/\.jsonl$/, ".summary.json")}`])
		if (isDeleted(rel) && !seen.has(rel) && !wanted.includes(rel) && !fs.existsSync(path.join(REPO, rel))){ wanted.push(rel); guessed.add(rel); }
}
const local = ms => { const d = new Date(ms), off = -d.getTimezoneOffset(), a = Math.abs(off), p = n => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, "0")}${off < 0 ? "-" : "+"}${p(Math.floor(a / 60))}:${p(a % 60)}`; };
const LONE_EMOJI = /^\p{Extended_Pictographic}️?$/u;

function log(role, id){
	const f = path.join(SX, "logs", `agent-session-${role}-${id}.jsonl`);
	return fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").map(json).filter(Boolean) : [];
}

function session_lines(s){
	const out = [{ session: { id: s.id, home: s.home, at: s.at, project: s.project, host: s.host ?? null, ...(s.card ? { card: s.card } : {}), fast: null, smart: null, backing: s.backing ?? null } }];
	const rows = [];
	let where = s.home;
	for (const e of log("fast", s.id)){
		const ms = Date.parse(e.at);
		if (!(ms <= CUTOFF)) continue;
		if (e.type === "agent_msg" && e.from === "owner"){
			for (const l of String(e.text).split("\n")){
				const m = l.match(/^\[on ([^\]]+)\]\s*(.*)$/);
				if (!m || !m[2].trim()) continue;
				where = m[1];
				rows.push({ ms, chat: { at: local(ms), session: s.id, path: m[1], from: { kind: "owner" }, via: "voice", text: m[2].trim() } });
			}
		}
	}
	for (const role of ["fast", "smart"]) for (const e of log(role, s.id)){
		const ms = Date.parse(e.at);
		if (!(ms <= CUTOFF) || e.type !== "result" || !e.ok) continue;
		const text = String(e.text ?? "").replace(/^\(new paragraph\)\s*/, "").trim();
		if (!text || text === "(listening)" || LONE_EMOJI.test(text)) continue;
		rows.push({ ms: ms + 1, chat: { at: local(ms), session: s.id, path: where, from: { kind: "assistant", id: role, agent: s[role] }, via: "text", text } });
	}
	rows.sort((a, b) => a.ms - b.ms);
	return out.concat(rows.map(r => ({ chat: r.chat })));
}

const records = [];
for (const rel of wanted){
	const before = records.length;
	const id = path.posix.basename(rel).replace(/\.(summary\.json|jsonl)$/, "");
	const s = map[id], abs = path.join(REPO, rel);
	if (!s){ records.push({ path: rel, source: "none (not in sessions.json)", confidence: "partial", bytes: 0, status: "no-source" }); continue; }
	let buf;
	if (rel.endsWith(".summary.json")){
		if (!s.title || !s.summary){ records.push({ path: rel, source: "sessions.json has no title", confidence: "partial", bytes: 0, status: "no-source" }); continue; }
		buf = Buffer.from(JSON.stringify({ id: s.id, home: s.home, title: s.title, summary: s.summary, at: s.last_at ?? s.at, visited: s.visited ?? [] }, null, 2));
	} else {
		const lines = session_lines(s);
		if (lines.length < 2){ records.push({ path: rel, source: "no agent log lines", confidence: "partial", bytes: 0, status: "no-source" }); continue; }
		buf = Buffer.from(lines.map(l => JSON.stringify(l)).join("\n") + "\n");
	}
	const source = rel.endsWith(".summary.json") ? "Servex sessions.json (title, summary, visited)" : `Servex sessions.json + agent-session-fast/smart-${id} logs (owner words + replies; no nav/quiet/react lines)`;
	if (fs.existsSync(abs)){ records.push({ path: rel, source, confidence: "partial", bytes: fs.statSync(abs).size, status: "kept-existing" }); continue; }
	if (!dry){
		fs.mkdirSync(path.dirname(abs), { recursive: true });
		try { fs.writeFileSync(abs, buf, { flag: "wx" }); }
		catch (e){ if (e.code !== "EEXIST") throw e; records.push({ path: rel, source, confidence: "partial", bytes: fs.statSync(abs).size, status: "kept-existing" }); continue; }
	}
	records.push({ path: rel, source, confidence: "partial", bytes: buf.length, status: "restored" });
}
for (let i = records.length - 1; i >= 0; i--) if (records[i].status === "no-source" && guessed.has(records[i].path)) records.splice(i, 1);
console.log(records.map(r => `${r.status} ${r.bytes} ${r.path}`).join("\n"));
if (!dry && records.length){
	const tmp = path.join(process.env.TEMP, "recover-sessions-lines.json");
	fs.writeFileSync(tmp, JSON.stringify(records.map(r => ({ recover: r }))));
	execFileSync("node", [path.join(REPO, ".claude/hooks/append.mjs"), path.join(TASK, "recovered.jsonl"), tmp], { stdio: "inherit", windowsHide: true });
}
